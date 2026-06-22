import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Home, CalendarDays, Sparkles, Settings2, Plus, Send, X, Clock, Star,
  ChevronLeft, Check, MessageCircle, Calendar as CalIcon, Scissors, Trash2,
} from "lucide-react";

/* =========================================================================
   Romi — AI front-desk for Israeli service businesses
   Owner app: Dashboard · Calendar (month/day) · Live Romi chat (Claude) · Settings
   Brand: Apple system palette, Indigo primary. Hebrew RTL.
   ========================================================================= */

/* ------------------------------- Tokens --------------------------------- */
const C = {
  brand: "#5856D6", brandDark: "#5E5CE6", success: "#34C759", warning: "#FF9500",
  danger: "#FF3B30", info: "#007AFF", accent: "#AF52DE",
  label: "#000000", secondary: "#8E8E93", separator: "#E5E5EA",
  bg: "#FFFFFF", grouped: "#F2F2F7", fill: "rgba(120,120,128,0.12)",
};
const GRAD = "linear-gradient(135deg,#5E5CE6 0%,#5856D6 55%,#AF52DE 100%)";
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

const SERVICE_COLORS = ["#5856D6", "#34C759", "#FF9500", "#007AFF", "#FF2D55", "#AF52DE"];
const WEEKDAYS_HE = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
const GREG_MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

/* ------------------------------ Date utils ------------------------------ */
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const addMonths = (y, m, d) => { const x = new Date(y, m + d, 1); return { y: x.getFullYear(), m: x.getMonth() }; };
const addDays = (date, n) => { const x = new Date(date); x.setDate(x.getDate() + n); return x; };
const toMin = (t) => { if (!t) return 0; const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };
const addMinutes = (t, mins) => fromMin(toMin(t) + mins);
const fromMin = (mins) => `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`;

function hebrewNumeral(n) {
  const ones = ["","א","ב","ג","ד","ה","ו","ז","ח","ט"], tens = ["","י","כ","ל"];
  let l = n === 15 ? "טו" : n === 16 ? "טז" : tens[Math.floor(n / 10)] + ones[n % 10];
  return l.length === 1 ? l + "׳" : l.slice(0, -1) + "״" + l.slice(-1);
}
const _hd = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric" });
const _hm = new Intl.DateTimeFormat("he-u-ca-hebrew", { month: "long" });
function hebCaption(date) {
  let n = 1; try { n = parseInt(_hd.format(date), 10) || 1; } catch (e) {}
  if (n === 1) { let nm = ""; try { nm = _hm.format(date).replace(/[׳״]/g, ""); } catch (e) {} return { label: nm, isMonthStart: true }; }
  return { label: hebrewNumeral(n), isMonthStart: false };
}
const heDateLong = (d) => `יום ${WEEKDAYS_HE[d.getDay()].replace("׳","")} · ${d.getDate()} ${GREG_MONTHS_HE[d.getMonth()]}`;

/* ------------------------------- Storage -------------------------------- */
const KEY = "romi_state_v1";
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
async function loadState() { try { if (window.storage?.get) { const r = await window.storage.get(KEY); if (r?.value) return JSON.parse(r.value); } } catch (e) {} return null; }
async function saveState(s) { try { if (window.storage?.set) await window.storage.set(KEY, JSON.stringify(s)); } catch (e) {} }

function seed() {
  const t = new Date();
  const d0 = ymd(t), d1 = ymd(addDays(t, 1)), d2 = ymd(addDays(t, 2));
  return {
    settings: { businessName: "סטודיו לין", ownerName: "לין", blockShabbat: true, blockHolidays: true, hours: { from: "09:00", to: "19:00" } },
    services: [
      { id: "s1", name: "תספורת נשים", durationMin: 45, price: 160, color: SERVICE_COLORS[0] },
      { id: "s2", name: "צבע ופן", durationMin: 120, price: 380, color: SERVICE_COLORS[1] },
      { id: "s3", name: "פן", durationMin: 30, price: 90, color: SERVICE_COLORS[2] },
      { id: "s4", name: "תספורת גברים", durationMin: 30, price: 80, color: SERVICE_COLORS[3] },
    ],
    bookings: [
      { id: uid(), date: d0, start: "10:00", end: "10:45", serviceId: "s1", customerName: "נועה ברק", status: "confirmed", source: "romi" },
      { id: uid(), date: d0, start: "13:00", end: "15:00", serviceId: "s2", customerName: "תמר כהן", status: "confirmed", source: "romi" },
      { id: uid(), date: d0, start: "17:30", end: "18:00", serviceId: "s4", customerName: "אורי לוי", status: "confirmed", source: "manual" },
      { id: uid(), date: d1, start: "11:00", end: "11:30", serviceId: "s3", customerName: "מאיה", status: "confirmed", source: "romi" },
      { id: uid(), date: d2, start: "16:00", end: "16:45", serviceId: "s1", customerName: "רוני", status: "confirmed", source: "romi" },
    ],
    conversations: [
      { id: "c1", role: "assistant", content: "היי! אני רומי, פקידת הקבלה של סטודיו לין. אפשר לקבוע, להזיז או לבטל תור — פשוט תכתבי לי 🙂" },
    ],
    metrics: { noShowsSaved: 7, romiBookings: 23 },
  };
}

/* ------------------------------- Atoms ---------------------------------- */
function RomiAvatar({ size = 36 }) {
  return (
    <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: size, height: size, background: GRAD }}>
      <Sparkles size={size * 0.5} color="#fff" strokeWidth={2.2} />
    </div>
  );
}
function StatusBar() {
  return (
    <div dir="ltr" className="flex items-center justify-between px-7 pt-3 pb-1 select-none" style={{ height: 40 }}>
      <div className="text-[15px] font-semibold tracking-tight">9:41</div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center justify-center rounded-md text-[10px] font-semibold" style={{ background: "#1c1c1e", color: "#fff", width: 26, height: 15 }}>87</div>
      </div>
    </div>
  );
}

/* ============================== Dashboard =============================== */
function StatCard({ value, label, color }) {
  return (
    <div className="flex-1 rounded-2xl p-3" style={{ background: C.grouped }}>
      <div className="text-[26px] font-bold leading-none" style={{ color }}>{value}</div>
      <div className="text-[12px] mt-1" style={{ color: C.secondary }}>{label}</div>
    </div>
  );
}
function BookingRow({ b, service, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-right active:opacity-60" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
      <div className="text-center shrink-0" style={{ width: 52 }}>
        <div className="text-[15px] font-semibold tabular-nums" style={{ color: C.label }} dir="ltr">{b.start}</div>
        <div className="text-[11px]" style={{ color: C.secondary }} dir="ltr">{b.end}</div>
      </div>
      <div className="rounded-full self-stretch" style={{ width: 3, background: service?.color || C.brand }} />
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-medium truncate" style={{ color: C.label }}>{b.customerName}</div>
        <div className="text-[13px] truncate" style={{ color: C.secondary }}>{service?.name || "שירות"}</div>
      </div>
      {b.source === "romi" && (
        <span className="flex items-center gap-1 rounded-full px-2 py-0.5 shrink-0" style={{ background: "#EFE2FA" }}>
          <Sparkles size={11} color={C.brand} /><span className="text-[10px] font-semibold" style={{ color: C.brand }}>רומי</span>
        </span>
      )}
    </button>
  );
}
function Dashboard({ settings, bookings, services, metrics, onOpenBooking, onGoChat }) {
  const today = new Date();
  const svc = (id) => services.find((s) => s.id === id);
  const todays = bookings.filter((b) => b.date === ymd(today)).sort((a, b) => a.start.localeCompare(b.start));
  const hour = today.getHours();
  const greet = hour < 12 ? "בוקר טוב" : hour < 18 ? "צהריים טובים" : "ערב טוב";
  return (
    <div className="flex-1 overflow-y-auto" dir="rtl">
      <div className="px-5 pt-3 pb-6 rounded-b-3xl" style={{ background: GRAD }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/80 text-[14px]">{greet},</div>
            <div className="text-white text-[26px] font-bold leading-tight">{settings.ownerName}</div>
            <div className="text-white/80 text-[13px] mt-0.5">{settings.businessName} · {heDateLong(today)}</div>
          </div>
          <RomiAvatar size={52} />
        </div>
        <button onClick={onGoChat} className="mt-4 w-full flex items-center gap-2 rounded-2xl px-4 py-3 active:opacity-80" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
          <MessageCircle size={18} color="#fff" />
          <span className="text-white text-[14px] font-medium">רומי פעילה ועונה ללקוחות בוואטסאפ</span>
          <span className="mr-auto w-2 h-2 rounded-full" style={{ background: C.success }} />
        </button>
      </div>

      <div className="px-4 -mt-3">
        <div className="flex gap-3">
          <StatCard value={todays.length} label="תורים היום" color={C.brand} />
          <StatCard value={metrics.romiBookings} label="קבעה רומי החודש" color={C.success} />
          <StatCard value={metrics.noShowsSaved} label="הברזות נמנעו" color={C.warning} />
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="text-[20px] font-bold mb-1">התורים של היום</div>
        {todays.length === 0 ? (
          <div className="text-center py-10 text-[15px]" style={{ color: C.secondary }}>אין תורים היום. רומי תעדכן אותך כשייקבע משהו.</div>
        ) : todays.map((b) => <BookingRow key={b.id} b={b} service={svc(b.serviceId)} onClick={() => onOpenBooking(b)} />)}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================== Calendar =============================== */
function MonthGrid({ year, month, today, byDay, onSelect, registerRef }) {
  const offset = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div ref={(el) => registerRef(`${year}-${month}`, el, year)} data-month={`${year}-${month}`}>
      <h2 dir="rtl" className="text-[30px] font-bold px-4 pt-5 pb-1">{GREG_MONTHS_HE[month]} {year}</h2>
      <div dir="rtl" className="grid grid-cols-7" style={{ borderTop: `0.5px solid ${C.separator}` }}>
        {cells.map((date, i) => {
          const evs = date ? (byDay[ymd(date)] || []) : [];
          const isT = date && sameDay(date, today);
          const heb = date && hebCaption(date);
          return (
            <div key={i} style={{ minWidth: 0, overflow: "hidden", borderTop: i >= 7 ? `0.5px solid ${C.separator}` : "none" }}>
              {date && (
                <button onClick={() => onSelect(date)} className="flex flex-col items-center pt-1.5 w-full active:bg-black/[0.03]" style={{ minHeight: 78, minWidth: 0 }}>
                  {isT ? (
                    <div className="flex flex-col items-center justify-center rounded-full" style={{ background: C.brand, width: 34, height: 34 }}>
                      <span className="text-[17px] font-semibold leading-none text-white">{date.getDate()}</span>
                      <span className="text-[9px] text-white leading-tight">{heb.label}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center" style={{ height: 34 }}>
                      <span className="text-[17px] font-medium leading-none">{date.getDate()}</span>
                      <span className="text-[9px] mt-0.5" style={{ color: heb.isMonthStart ? C.brand : C.secondary }}>{heb.label}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-0.5 justify-center mt-1 px-0.5">
                    {evs.slice(0, 4).map((b) => <span key={b.id} className="rounded-full" style={{ width: 5, height: 5, background: b.color }} />)}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HOUR_H = 56, GUTTER = 48;
function DayTimeline({ date, today, bookings, services, onTapSlot, onTapBooking }) {
  const scrollRef = useRef(null);
  const [nowMin, setNowMin] = useState(() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); });
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 8 * HOUR_H - 8; const t = setInterval(() => { const n = new Date(); setNowMin(n.getHours() * 60 + n.getMinutes()); }, 60000); return () => clearInterval(t); }, []);
  const dayB = bookings.filter((b) => b.date === ymd(date)).sort((a, b) => a.start.localeCompare(b.start));
  const svc = (id) => services.find((s) => s.id === id);
  const tap = (e) => { const r = e.currentTarget.getBoundingClientRect(); const h = Math.max(0, Math.min(23, Math.floor((e.clientY - r.top) / HOUR_H))); onTapSlot(date, h); };
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div dir="rtl" className="flex" style={{ minHeight: 24 * HOUR_H }}>
        <div style={{ width: GUTTER, position: "relative", flexShrink: 0 }}>
          {Array.from({ length: 24 }, (_, h) => <div key={h} className="text-[11px] absolute right-2" style={{ top: h * HOUR_H - 6, color: C.secondary }}>{h === 0 ? "" : `${pad(h)}:00`}</div>)}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(to bottom, ${C.separator} 0, ${C.separator} 0.5px, transparent 0.5px, transparent ${HOUR_H}px)` }} />
          <div className="absolute inset-0" onClick={tap} />
          {dayB.map((b) => {
            const s = svc(b.serviceId); const top = (toMin(b.start) / 60) * HOUR_H; const h = Math.max(((toMin(b.end) - toMin(b.start)) / 60) * HOUR_H, 22);
            return (
              <button key={b.id} onClick={(e) => { e.stopPropagation(); onTapBooking(b); }} className="absolute rounded-lg px-2 py-1 text-right overflow-hidden active:opacity-70" style={{ top, height: h - 2, insetInlineStart: 4, insetInlineEnd: 4, background: (s?.color || C.brand) + "22", borderInlineStart: `3px solid ${s?.color || C.brand}` }}>
                <div className="text-[12px] font-semibold leading-tight truncate" style={{ color: C.label }}>{b.customerName}</div>
                <div className="text-[10px] truncate" style={{ color: C.secondary }}>{s?.name} · {b.start}</div>
              </button>
            );
          })}
          {sameDay(date, today) && (
            <div className="absolute pointer-events-none" style={{ top: (nowMin / 60) * HOUR_H, insetInline: 0 }}>
              <div style={{ borderTop: `2px solid ${C.danger}` }}><div className="absolute rounded-full" style={{ background: C.danger, width: 8, height: 8, right: -1, top: -5 }} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ today, bookings, services, onTapSlot, onTapBooking, onAdd }) {
  const [mode, setMode] = useState("month");
  const [anchor, setAnchor] = useState(today);
  const scrollRef = useRef(null); const monthRefs = useRef({}); const yByKey = useRef({});
  const months = useMemo(() => { const a = []; for (let i = -6; i <= 12; i++) { const { y, m } = addMonths(today.getFullYear(), today.getMonth(), i); a.push({ y, m }); } return a; }, [today]);
  const byDay = useMemo(() => { const map = {}; for (const b of bookings) { const s = services.find((x) => x.id === b.serviceId); (map[b.date] ||= []).push({ ...b, color: s?.color || C.brand }); } return map; }, [bookings, services]);
  const registerRef = useCallback((k, el, y) => { if (el) { monthRefs.current[k] = el; yByKey.current[k] = y; } }, []);
  useEffect(() => { if (mode === "month") requestAnimationFrame(() => { const el = monthRefs.current[`${today.getFullYear()}-${today.getMonth()}`]; if (el) el.scrollIntoView({ block: "start" }); }); }, [mode, today]);

  return (
    <div className="flex-1 flex flex-col min-h-0" dir="rtl">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex rounded-lg overflow-hidden" style={{ background: C.fill }}>
          {[["month", "חודש"], ["day", "יום"]].map(([k, l]) => (
            <button key={k} onClick={() => { setMode(k); if (k === "day") setAnchor(today); }} className="px-4 py-1.5 text-[14px] font-medium" style={{ background: mode === k ? "#fff" : "transparent", color: mode === k ? C.brand : C.secondary, boxShadow: mode === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none", borderRadius: 7, margin: 2 }}>{l}</button>
          ))}
        </div>
        <button onClick={() => onAdd(mode === "day" ? anchor : today)} className="flex items-center justify-center rounded-full active:opacity-60" style={{ width: 38, height: 38, background: C.fill }}>
          <Plus size={22} color={C.brand} strokeWidth={2.2} />
        </button>
      </div>
      {mode === "month" ? (
        <>
          <div className="grid grid-cols-7 px-1 pb-1" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
            {WEEKDAYS_HE.map((d, i) => <div key={i} className="text-center text-[12px] py-1" style={{ color: C.secondary }}>{d}</div>)}
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {months.map(({ y, m }) => <MonthGrid key={`${y}-${m}`} year={y} month={m} today={today} byDay={byDay} onSelect={(d) => { setAnchor(d); setMode("day"); }} registerRef={registerRef} />)}
            <div style={{ height: 24 }} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
            <button onClick={() => setAnchor((d) => addDays(d, 1))} className="p-1 active:opacity-50"><ChevronLeft size={22} color={C.brand} style={{ transform: "scaleX(-1)" }} /></button>
            <div className="text-[16px] font-semibold" style={{ color: sameDay(anchor, today) ? C.brand : C.label }}>{heDateLong(anchor)}</div>
            <button onClick={() => setAnchor((d) => addDays(d, -1))} className="p-1 active:opacity-50"><ChevronLeft size={22} color={C.brand} /></button>
          </div>
          <DayTimeline date={anchor} today={today} bookings={bookings} services={services} onTapSlot={onTapSlot} onTapBooking={onTapBooking} />
        </>
      )}
    </div>
  );
}

/* ============================== Romi chat =============================== */
function buildSystemPrompt(state) {
  const { settings, services, bookings } = state;
  const today = new Date();
  const upcoming = bookings.filter((b) => b.date >= ymd(today)).map((b) => `${b.date} ${b.start}-${b.end}`).join(", ") || "אין";
  const svc = services.map((s) => `${s.name} (${s.durationMin} דק', ${s.price}₪)`).join("; ");
  return `את רומי, פקידת הקבלה הווירטואלית של "${settings.businessName}". את מדברת עברית, חמה, קצרה ויעילה — כמו פקידה אנושית בוואטסאפ.

תפקידך: לקבוע, להזיז ולבטל תורים עבור לקוחות.

שירותים זמינים: ${svc}.
שעות פעילות: ${settings.hours.from}–${settings.hours.to}.
ימי עבודה: ראשון עד חמישי בלבד. ${settings.blockShabbat ? "אסור לקבוע בשישי ובשבת (שבת)." : ""} ${settings.blockHolidays ? "אסור לקבוע בחגים יהודיים." : ""}
תאריך היום: ${ymd(today)} (${heDateLong(today)}).
תורים תפוסים קרובים: ${upcoming}.

חוקים:
- אם לקוח מבקש תור בשבת/שישי או בחג — סרבי בעדינות והציעי את יום העבודה הקרוב הפנוי.
- כשמסכמים תור קונקרטי (שירות + תאריך + שעה), בקשי שם אם אין, ואז קבעי.
- אל תמציאי תורים שכבר תפוסים.

חובה: החזירי אך ורק אובייקט JSON תקין, בלי טקסט נוסף ובלי markdown, בפורמט:
{"reply":"<ההודעה ללקוח בעברית>","action":null או {"type":"book","service":"<שם שירות>","date":"YYYY-MM-DD","time":"HH:MM","customerName":"<שם>"}}
שימי action רק כשהתור סוכם סופית. אחרת action=null.`;
}
function extractJSON(text) {
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(text.slice(s, e + 1)); } catch (err) { return null; }
}

function ChatView({ state, messages, onAddMessage, onBook }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, busy]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput(""); setErr("");
    const userMsg = { id: uid(), role: "user", content };
    onAddMessage(userMsg);
    const history = [...messages, userMsg].filter((m) => m.role === "user" || m.role === "assistant").slice(-12).map((m) => ({ role: m.role, content: m.content }));
    setBusy(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: buildSystemPrompt(state), messages: history }),
      });
      const data = await res.json();
      const raw = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
      const parsed = extractJSON(raw);
      const reply = parsed?.reply || raw || "סליחה, לא הצלחתי להבין. אפשר לנסח שוב?";
      onAddMessage({ id: uid(), role: "assistant", content: reply });
      if (parsed?.action?.type === "book" && parsed.action.date && parsed.action.time) {
        const booked = onBook(parsed.action);
        if (booked) onAddMessage({ id: uid(), role: "system", kind: "booked", booking: booked });
      }
    } catch (e) {
      setErr("רומי לא זמינה כרגע. נסי שוב.");
      onAddMessage({ id: uid(), role: "assistant", content: "אופס, יש לי תקלה רגעית. אפשר לנסות שוב?" });
    } finally { setBusy(false); }
  };

  const chips = ["אפשר תור לתספורת מחר?", "מתי יש פנוי השבוע?", "קבעי לי תור לשבת בבוקר"];
  return (
    <div className="flex-1 flex flex-col min-h-0" dir="rtl">
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
        <RomiAvatar size={40} />
        <div className="flex-1">
          <div className="text-[17px] font-semibold">רומי</div>
          <div className="text-[12px] flex items-center gap-1" style={{ color: C.success }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: C.success }} />פעילה · עונה כלקוחה</div>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: C.fill, color: C.secondary }}>הדגמה חיה</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3" style={{ background: "#F7F7FA" }}>
        {messages.map((m) => {
          if (m.role === "system" && m.kind === "booked") {
            const b = m.booking; const s = state.services.find((x) => x.id === b.serviceId);
            return (
              <div key={m.id} className="flex justify-center my-2">
                <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#fff", border: `1px solid ${C.separator}` }}>
                  <span className="flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: C.success }}><Check size={13} color="#fff" strokeWidth={3} /></span>
                  <div className="text-[12px]"><b>תור נקבע</b> · {s?.name} · {b.date} {b.start}</div>
                </div>
              </div>
            );
          }
          const mine = m.role === "user";
          return (
            <div key={m.id} className={`flex mb-2 ${mine ? "justify-start" : "justify-end"}`}>
              <div className="max-w-[78%] rounded-2xl px-3 py-2 text-[15px] leading-snug whitespace-pre-wrap" style={mine ? { background: C.brand, color: "#fff", borderBottomRightRadius: 4 } : { background: "#fff", color: C.label, border: `0.5px solid ${C.separator}`, borderBottomLeftRadius: 4 }}>
                {m.content}
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="flex justify-end mb-2">
            <div className="rounded-2xl px-3 py-2.5 flex gap-1" style={{ background: "#fff", border: `0.5px solid ${C.separator}` }}>
              {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.secondary, animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="flex gap-2 px-3 py-2 overflow-x-auto" style={{ borderTop: `0.5px solid ${C.separator}` }}>
          {chips.map((c) => <button key={c} onClick={() => send(c)} className="whitespace-nowrap text-[13px] px-3 py-1.5 rounded-full active:opacity-60" style={{ background: C.fill, color: C.brand }}>{c}</button>)}
        </div>
      )}
      {err && <div className="text-center text-[12px] py-1" style={{ color: C.danger }}>{err}</div>}
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: `0.5px solid ${C.separator}`, background: "#fff" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="כתבי כמו לקוחה..." className="flex-1 bg-transparent outline-none text-[16px] px-2 text-right" />
        <button onClick={() => send()} disabled={busy || !input.trim()} className="flex items-center justify-center rounded-full active:opacity-70" style={{ width: 38, height: 38, background: input.trim() ? C.brand : C.fill }}>
          <Send size={18} color={input.trim() ? "#fff" : C.secondary} style={{ transform: "scaleX(-1)" }} />
        </button>
      </div>
    </div>
  );
}

/* ============================== Settings =============================== */
function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} className="relative rounded-full transition-colors" style={{ width: 51, height: 31, background: on ? C.success : "#E5E5EA" }}>
      <span className="absolute top-0.5 rounded-full bg-white transition-all" style={{ width: 27, height: 27, right: on ? 2 : 22, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}
function SettingsView({ state, setState }) {
  const { settings, services } = state;
  const upd = (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  return (
    <div className="flex-1 overflow-y-auto" dir="rtl">
      <div className="px-5 pt-4 pb-2"><h2 className="text-[28px] font-bold">הגדרות</h2></div>

      <div className="px-4 mt-2">
        <div className="text-[13px] mb-1.5 px-2" style={{ color: C.secondary }}>העסק</div>
        <div className="rounded-2xl" style={{ background: C.grouped }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
            <span className="text-[16px]">שם העסק</span>
            <input value={settings.businessName} onChange={(e) => upd({ businessName: e.target.value })} className="bg-transparent text-[16px] text-left outline-none" style={{ color: C.secondary, maxWidth: 180 }} dir="rtl" />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[16px]">שם בעל/ת העסק</span>
            <input value={settings.ownerName} onChange={(e) => upd({ ownerName: e.target.value })} className="bg-transparent text-[16px] text-left outline-none" style={{ color: C.secondary, maxWidth: 180 }} dir="rtl" />
          </div>
        </div>
      </div>

      <div className="px-4 mt-5">
        <div className="text-[13px] mb-1.5 px-2" style={{ color: C.secondary }}>זמן יהודי — היתרון של רומי</div>
        <div className="rounded-2xl" style={{ background: C.grouped }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
            <div><div className="text-[16px]">לא לקבוע בשבת</div><div className="text-[12px]" style={{ color: C.secondary }}>חוסם שישי–שבת אוטומטית</div></div>
            <Toggle on={settings.blockShabbat} onChange={() => upd({ blockShabbat: !settings.blockShabbat })} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div><div className="text-[16px]">לא לקבוע בחגים</div><div className="text-[12px]" style={{ color: C.secondary }}>חגים יהודיים וערבי חג</div></div>
            <Toggle on={settings.blockHolidays} onChange={() => upd({ blockHolidays: !settings.blockHolidays })} />
          </div>
        </div>
      </div>

      <div className="px-4 mt-5">
        <div className="text-[13px] mb-1.5 px-2" style={{ color: C.secondary }}>שירותים</div>
        <div className="rounded-2xl" style={{ background: C.grouped }}>
          {services.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < services.length - 1 ? `0.5px solid ${C.separator}` : "none" }}>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[16px] flex-1">{s.name}</span>
              <span className="text-[14px]" style={{ color: C.secondary }}>{s.durationMin} דק' · {s.price}₪</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 mt-6 text-center text-[12px]" style={{ color: C.secondary }}>Romi · גרסת הדגמה</div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ========================= Booking editor sheet ========================= */
function BookingSheet({ initial, services, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial.customerName || "");
  const [date, setDate] = useState(initial.date);
  const [start, setStart] = useState(initial.start || "10:00");
  const [serviceId, setServiceId] = useState(initial.serviceId || services[0]?.id);
  const isNew = !initial.id;
  const svc = services.find((s) => s.id === serviceId);
  const save = () => { if (!name.trim()) return; onSave({ id: initial.id || uid(), customerName: name.trim(), date, start, end: addMinutes(start, svc?.durationMin || 30), serviceId, status: "confirmed", source: initial.source || "manual" }); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div dir="rtl" onClick={(e) => e.stopPropagation()} className="w-full rounded-t-2xl" style={{ background: "#fff", maxWidth: 480, animation: "su .25s ease" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={onClose} className="text-[16px]" style={{ color: C.brand }}>ביטול</button>
          <span className="text-[17px] font-semibold">{isNew ? "תור חדש" : "פרטי תור"}</span>
          <button onClick={save} className="text-[16px] font-semibold" style={{ color: name.trim() ? C.brand : C.secondary }}>{isNew ? "קבע" : "שמור"}</button>
        </div>
        <div className="p-4">
          <div className="rounded-2xl mb-3" style={{ background: C.grouped }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם הלקוח/ה" autoFocus className="w-full bg-transparent px-4 py-3 text-[17px] outline-none text-right" />
          </div>
          <div className="rounded-2xl" style={{ background: C.grouped }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
              <span className="text-[16px]">שירות</span>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="bg-transparent text-[16px] outline-none" style={{ color: C.secondary }}>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `0.5px solid ${C.separator}` }}>
              <span className="text-[16px]">תאריך</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-[16px] outline-none" dir="ltr" />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[16px]">שעה</span>
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="bg-transparent text-[16px] outline-none" dir="ltr" />
            </div>
          </div>
          {!isNew && (
            <button onClick={() => onDelete(initial.id)} className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl active:opacity-60" style={{ background: C.grouped }}>
              <Trash2 size={18} color={C.danger} /><span className="text-[16px]" style={{ color: C.danger }}>בטל תור</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Tab bar ================================= */
function TabBar({ tab, setTab }) {
  const tabs = [["home", "בית", Home], ["calendar", "יומן", CalendarDays], ["chat", "רומי", Sparkles], ["settings", "הגדרות", Settings2]];
  return (
    <div dir="rtl" className="flex" style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(20px)", borderTop: `0.5px solid ${C.separator}`, paddingBottom: 6 }}>
      {tabs.map(([k, l, Icon]) => (
        <button key={k} onClick={() => setTab(k)} className="flex-1 flex flex-col items-center gap-0.5 py-2 active:opacity-60">
          <Icon size={24} color={tab === k ? C.brand : C.secondary} strokeWidth={tab === k ? 2.3 : 2} fill={k === "chat" && tab === k ? C.brand : "none"} />
          <span className="text-[10px] font-medium" style={{ color: tab === k ? C.brand : C.secondary }}>{l}</span>
        </button>
      ))}
    </div>
  );
}

/* ================================ App ================================== */
export default function App() {
  const today = useMemo(() => new Date(), []);
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("home");
  const [editor, setEditor] = useState(null);

  useEffect(() => { let a = true; (async () => { const s = await loadState(); if (a) setState(s ?? seed()); })(); return () => { a = false; }; }, []);
  useEffect(() => { if (state) saveState(state); }, [state]);

  const addMessage = (m) => setState((s) => ({ ...s, conversations: [...s.conversations, m] }));

  /* validate + create a booking from Romi action or manual editor */
  const createBooking = useCallback((action) => {
    let created = null;
    setState((s) => {
      const svc = s.services.find((x) => x.name === action.service) || s.services.find((x) => action.service && x.name.includes(action.service)) || s.services[0];
      const d = new Date(action.date + "T00:00:00");
      const dur = svc?.durationMin || 30;
      const b = { id: uid(), date: action.date, start: action.time, end: addMinutes(action.time, dur), serviceId: svc.id, customerName: action.customerName || "לקוח/ה", status: "confirmed", source: "romi" };
      created = b;
      return { ...s, bookings: [...s.bookings, b], metrics: { ...s.metrics, romiBookings: s.metrics.romiBookings + 1 } };
    });
    return created;
  }, []);

  const saveBooking = (b) => { setState((s) => ({ ...s, bookings: s.bookings.some((x) => x.id === b.id) ? s.bookings.map((x) => (x.id === b.id ? b : x)) : [...s.bookings, b] })); setEditor(null); };
  const deleteBooking = (id) => { setState((s) => ({ ...s, bookings: s.bookings.filter((x) => x.id !== id) })); setEditor(null); };

  if (!state) return <div className="flex items-center justify-center h-screen" style={{ background: "#fff" }}><RomiAvatar size={48} /></div>;

  return (
    <div className="flex flex-col mx-auto overflow-hidden" style={{ height: "100vh", maxWidth: 480, background: "#fff", color: C.label, fontFamily: FONT }}>
      <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}} *{-webkit-tap-highlight-color:transparent}`}</style>
      <StatusBar />
      <div className="flex-1 flex flex-col min-h-0">
        {tab === "home" && <Dashboard settings={state.settings} bookings={state.bookings} services={state.services} metrics={state.metrics} onOpenBooking={(b) => setEditor(b)} onGoChat={() => setTab("chat")} />}
        {tab === "calendar" && <CalendarView today={today} bookings={state.bookings} services={state.services} onTapSlot={(d, h) => setEditor({ date: ymd(d), start: `${pad(h)}:00` })} onTapBooking={(b) => setEditor(b)} onAdd={(d) => setEditor({ date: ymd(d), start: "10:00" })} />}
        {tab === "chat" && <ChatView state={state} messages={state.conversations} onAddMessage={addMessage} onBook={createBooking} />}
        {tab === "settings" && <SettingsView state={state} setState={setState} />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
      {editor && <BookingSheet initial={editor} services={state.services} onClose={() => setEditor(null)} onSave={saveBooking} onDelete={deleteBooking} />}
    </div>
  );
}
