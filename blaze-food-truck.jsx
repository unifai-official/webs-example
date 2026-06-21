import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─── */
const MENU = [
  {
    id: "burgers", label: "בורגרים", icon: "🍔",
    items: [
      { id: 1, name: "דה קלאסיק", desc: "200 גרם אנגוס, צ'דר מיושן, חסה, עגבנייה שרי, רוטב סיגנצ'ר", price: 58, badge: "הכי נמכר", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { id: 2, name: "סמוקי BBQ", desc: "בקר מעושן 12 שעות, בייקון פריך, בצל מקורמל, BBQ תוצרת בית", price: 68, badge: "חדש", img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop" },
      { id: 3, name: "טראפל מאשרום", desc: "פטריות יער, שמן כמהין, גבינת גרויאר, רוקט", price: 74, img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&h=400&fit=crop" },
      { id: 4, name: "ביונד פלייבור", desc: "פאטי צמחי, אבוקדו, טחינה גולמית, ירקות גריל", price: 62, badge: "צמחוני", img: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&h=400&fit=crop" },
    ],
  },
  {
    id: "sides", label: "תוספות", icon: "🍟",
    items: [
      { id: 5, name: "צ'יפס טראפל", desc: "צ'יפס דק עם שמן כמהין ופרמזן מגורד", price: 32, badge: "הכי נמכר", img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop" },
      { id: 6, name: "טבעות בצל קראנצ'", desc: "בציפוי פנקו יפני עם דיפ צ'ילי מתוק", price: 28, img: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=400&fit=crop" },
      { id: 7, name: "נאצ'וס Supreme", desc: "גבינות, גוואקמולי, סלסה, חלפיניו, שמנת", price: 38, img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&h=400&fit=crop" },
      { id: 8, name: "סלט קיסר", desc: "חסה רומית, קרוטונים, פרמזן, רוטב קיסר קלאסי", price: 34, img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop" },
    ],
  },
  {
    id: "drinks", label: "שתייה", icon: "🧊",
    items: [
      { id: 9, name: "לימונענע הבית", desc: "לימון טרי, נענע, סירופ אגבה, קרח כתוש", price: 22, badge: "הכי נמכר", img: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop" },
      { id: 10, name: "אייס ברו קפה", desc: "קפה קולד ברו 24 שעות, חלב שיבולת שועל", price: 26, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop" },
      { id: 11, name: "מילקשייק פרימיום", desc: "גלידה אמיתית — וניל / שוקולד בלגי / פיסטוק", price: 34, img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop" },
    ],
  },
];

const SCHEDULE = [
  { day: "ראשון", spot: "שדרות רוטשילד, תל אביב", time: "11:00–22:00", coords: "32.0636,34.7756" },
  { day: "שני", spot: "מתחם שרונה", time: "11:00–21:30", coords: "32.0731,34.7854" },
  { day: "שלישי", spot: "נמל תל אביב", time: "11:00–23:00", coords: "32.0972,34.7720" },
  { day: "רביעי", spot: "שוק הכרמל", time: "10:00–22:00", coords: "32.0654,34.7677" },
  { day: "חמישי", spot: "פארק הירקון — כניסה ב'", time: "11:00–22:00", coords: "32.1033,34.8075" },
  { day: "שישי", spot: "נמל יפו", time: "10:00–16:00", coords: "32.0515,34.7519" },
  { day: "שבת", spot: "—", time: "סגור", coords: null },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700;800;900&family=Secular+One&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#050505;overflow-x:hidden}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:10px}

@keyframes orbFloat{
  0%,100%{transform:translate(0,0) scale(1)}
  25%{transform:translate(40px,-30px) scale(1.05)}
  50%{transform:translate(-20px,-60px) scale(0.95)}
  75%{transform:translate(-40px,-15px) scale(1.02)}
}
@keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.15)}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.3)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.glass{
  background:rgba(255,255,255,0.03);
  backdrop-filter:blur(40px);
  -webkit-backdrop-filter:blur(40px);
  border:1px solid rgba(255,255,255,0.06);
}
.glass-strong{
  background:rgba(255,255,255,0.05);
  backdrop-filter:blur(60px);
  -webkit-backdrop-filter:blur(60px);
  border:1px solid rgba(255,255,255,0.08);
}
.glass-card{
  background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%);
  backdrop-filter:blur(40px);
  -webkit-backdrop-filter:blur(40px);
  border:1px solid rgba(255,255,255,0.06);
  transition:all 0.5s cubic-bezier(.23,1,.32,1);
}
.glass-card:hover{
  background:linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 100%);
  border-color:rgba(255,176,56,0.2);
  transform:translateY(-6px) scale(1.01);
  box-shadow:0 30px 80px rgba(0,0,0,0.4),0 0 60px rgba(255,176,56,0.05);
}
.item-enter{opacity:0;transform:translateY(30px)}
.item-visible{opacity:1;transform:translateY(0);transition:all 0.7s cubic-bezier(.23,1,.32,1)}

.cat-btn{
  padding:10px 28px;
  border-radius:100px;
  border:1px solid rgba(255,255,255,0.06);
  background:rgba(255,255,255,0.02);
  backdrop-filter:blur(20px);
  color:rgba(255,255,255,0.4);
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  font-family:'Heebo',sans-serif;
  transition:all 0.4s cubic-bezier(.23,1,.32,1);
  display:flex;align-items:center;gap:8px;
  white-space:nowrap;
}
.cat-btn:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7)}
.cat-btn.active{
  background:rgba(255,176,56,0.12);
  border-color:rgba(255,176,56,0.3);
  color:#FFB038;
  box-shadow:0 0 30px rgba(255,176,56,0.1);
}

.add-btn{
  width:100%;padding:12px 0;
  border:1px solid rgba(255,255,255,0.06);
  background:rgba(255,255,255,0.02);
  backdrop-filter:blur(20px);
  color:rgba(255,255,255,0.5);
  border-radius:14px;
  font-size:14px;font-weight:600;
  cursor:pointer;font-family:'Heebo',sans-serif;
  transition:all 0.35s cubic-bezier(.23,1,.32,1);
}
.add-btn:hover{
  background:rgba(255,176,56,0.15);
  border-color:rgba(255,176,56,0.3);
  color:#FFB038;
}
.add-btn.in-cart{
  background:rgba(255,176,56,0.1);
  border-color:rgba(255,176,56,0.25);
  color:#FFB038;
}

.qty-btn{
  width:36px;height:36px;border-radius:10px;
  border:1px solid rgba(255,255,255,0.08);
  background:rgba(255,255,255,0.03);
  color:rgba(255,255,255,0.6);
  font-size:18px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all 0.25s;
}
.qty-btn:hover{background:rgba(255,176,56,0.15);border-color:rgba(255,176,56,0.3);color:#FFB038}

.schedule-card{
  padding:18px 22px;border-radius:16px;
  border:1px solid rgba(255,255,255,0.04);
  background:rgba(255,255,255,0.015);
  backdrop-filter:blur(20px);
  transition:all 0.35s cubic-bezier(.23,1,.32,1);
}
.schedule-card:hover{background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.08)}
.schedule-card.today{
  background:rgba(255,176,56,0.06);
  border-color:rgba(255,176,56,0.2);
}

.cta-primary{
  padding:16px 52px;border:none;border-radius:16px;
  background:linear-gradient(135deg,#FFB038 0%,#FF8C42 100%);
  color:#000;font-size:17px;font-weight:700;
  font-family:'Heebo',sans-serif;cursor:pointer;
  transition:all 0.35s cubic-bezier(.23,1,.32,1);
  position:relative;overflow:hidden;
}
.cta-primary::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 50%);
  opacity:0;transition:opacity 0.35s;
}
.cta-primary:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 20px 60px rgba(255,176,56,0.3)}
.cta-primary:hover::after{opacity:1}
`;

function Orb({ size, x, y, color, delay = 0 }) {
  return (
    <div style={{
      position: "absolute",
      width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      left: x, top: y,
      filter: "blur(80px)",
      opacity: 0.4,
      animation: `orbFloat ${12 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: "none",
    }} />
  );
}

function Badge({ children, color = "rgba(255,176,56,0.15)", textColor = "#FFB038" }) {
  return (
    <span style={{
      background: color,
      color: textColor,
      fontSize: 10,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: 100,
      letterSpacing: 0.3,
      border: `1px solid ${textColor}22`,
    }}>{children}</span>
  );
}

function AnimatedSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `all 0.8s cubic-bezier(.23,1,.32,1) ${delay}s`,
    }}>{children}</div>
  );
}

function MenuCard({ item, qty, onAdd }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`glass-card ${visible ? "item-visible" : "item-enter"}`}
      style={{ borderRadius: 22, overflow: "hidden" }}>
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img src={item.img} alt={item.name} loading="lazy" style={{
          width: "100%", height: "100%", objectFit: "cover",
          transition: "transform 0.6s cubic-bezier(.23,1,.32,1)",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.9) 100%)",
        }} />
        {item.badge && (
          <div style={{ position: "absolute", top: 14, right: 14 }}>
            <Badge>{item.badge}</Badge>
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 14, left: 14,
          fontFamily: "'Secular One', sans-serif",
          fontSize: 26, color: "#FFB038",
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}>
          ₪{item.price}
        </div>
      </div>
      <div style={{ padding: "20px 22px 22px" }}>
        <h3 style={{
          fontFamily: "'Heebo', sans-serif",
          fontSize: 19, fontWeight: 700,
          color: "rgba(255,255,255,0.92)",
          marginBottom: 6,
        }}>{item.name}</h3>
        <p style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 13, lineHeight: 1.6,
          marginBottom: 18,
          minHeight: 42,
        }}>{item.desc}</p>
        <button className={`add-btn ${qty > 0 ? "in-cart" : ""}`} onClick={() => onAdd(item)}>
          {qty > 0 ? `בהזמנה (${qty}) · הוסף עוד` : "הוסף להזמנה"}
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onUpdate, onClear, onOrder }) {
  const all = MENU.flatMap(c => c.items);
  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  const total = entries.reduce((s, [id, q]) => {
    const it = all.find(i => i.id === +id);
    return s + (it ? it.price * q : 0);
  }, 0);
  const count = entries.reduce((s, [, q]) => s + q, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", justifyContent: "flex-start" }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.25s ease",
      }} />
      <div style={{
        position: "relative",
        width: "min(440px, 92vw)",
        height: "100%",
        background: "rgba(12,12,12,0.85)",
        backdropFilter: "blur(60px)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        overflowY: "auto",
        animation: "slideUp 0.4s cubic-bezier(.23,1,.32,1)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Heebo', sans-serif", fontSize: 24, fontWeight: 800,
              color: "rgba(255,255,255,0.92)",
            }}>ההזמנה שלך</h2>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
              {count > 0 ? `${count} פריטים` : "ריקה"}
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.4)", fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, padding: "12px 28px", overflowY: "auto" }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: 56, marginBottom: 16, filter: "grayscale(1) opacity(0.3)" }}>🛒</div>
              <p style={{ fontWeight: 600, fontSize: 17 }}>העגלה ריקה</p>
              <p style={{ fontSize: 13, marginTop: 6, color: "rgba(255,255,255,0.1)" }}>הוסיפו פריטים מהתפריט</p>
            </div>
          ) : entries.map(([id, qty]) => {
            const it = all.find(i => i.id === +id);
            if (!it) return null;
            return (
              <div key={id} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 0",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}>
                <img src={it.img} alt="" style={{
                  width: 56, height: 56, borderRadius: 14, objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.06)",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 15 }}>{it.name}</div>
                  <div style={{ color: "#FFB038", fontSize: 14, fontWeight: 700, marginTop: 3 }}>₪{it.price * qty}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button className="qty-btn" onClick={() => onUpdate(it.id, -1)}>−</button>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, minWidth: 18, textAlign: "center", fontSize: 15 }}>{qty}</span>
                  <button className="qty-btn" onClick={() => onUpdate(it.id, 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div style={{
            padding: "20px 28px 28px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            flexShrink: 0,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 20,
            }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 500 }}>סה"כ לתשלום</span>
              <span style={{ fontFamily: "'Secular One', sans-serif", fontSize: 30, color: "#FFB038" }}>₪{total}</span>
            </div>
            <button className="cta-primary" onClick={onOrder} style={{ width: "100%", fontSize: 16, padding: "16px 0", borderRadius: 14 }}>
              שלח הזמנה בוואטסאפ
            </button>
            <button onClick={onClear} style={{
              width: "100%", padding: "12px 0", marginTop: 10,
              background: "none", border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 14, color: "rgba(255,255,255,0.2)",
              fontSize: 13, cursor: "pointer", fontFamily: "'Heebo', sans-serif",
            }}>נקה הזמנה</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [cat, setCat] = useState(0);
  const [cart, setCart] = useState({});
  const [drawer, setDrawer] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);
  const locRef = useRef(null);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const todayIdx = new Date().getDay();
  const todayLoc = SCHEDULE[todayIdx === 0 ? 0 : todayIdx - 1];

  const addToCart = useCallback((item) => {
    setCart(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }));
    setToast(`${item.name} נוסף להזמנה`);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const updateCart = useCallback((id, d) => {
    setCart(p => {
      const n = { ...p };
      n[id] = (n[id] || 0) + d;
      if (n[id] <= 0) delete n[id];
      return n;
    });
  }, []);

  const sendOrder = () => {
    const all = MENU.flatMap(c => c.items);
    const lines = Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => {
      const it = all.find(i => i.id === +id);
      return it ? `${it.name} x${q} - ₪${it.price * q}` : "";
    }).filter(Boolean);
    const total = Object.entries(cart).filter(([, q]) => q > 0).reduce((s, [id, q]) => {
      const it = all.find(i => i.id === +id);
      return s + (it ? it.price * q : 0);
    }, 0);
    const msg = `🔥 הזמנה חדשה מ-BLAZE\n\n${lines.join("\n")}\n\nסה"כ: ₪${total}`;
    window.open(`https://wa.me/972501234567?text=${encodeURIComponent(msg)}`, "_blank");
    setDrawer(false);
  };

  return (
    <div dir="rtl" style={{
      fontFamily: "'Heebo', sans-serif",
      background: "#050505",
      color: "#fff",
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{css}</style>

      {/* ─── AMBIENT ORBS ─── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <Orb size={600} x="-10%" y="-10%" color="rgba(255,176,56,0.15)" delay={0} />
        <Orb size={500} x="70%" y="20%" color="rgba(255,100,60,0.1)" delay={3} />
        <Orb size={400} x="20%" y="70%" color="rgba(255,176,56,0.08)" delay={6} />
      </div>

      {/* ─── NAV ─── */}
      <nav className="glass-strong" style={{
        position: "fixed", top: 0, right: 0, left: 0, zIndex: 1000,
        padding: "0 28px",
        transition: "all 0.4s",
        borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: scrollY > 50 ? 56 : 68,
          transition: "height 0.4s cubic-bezier(.23,1,.32,1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 26,
              animation: "glow 3s ease-in-out infinite",
            }}>🔥</span>
            <span style={{
              fontFamily: "'Secular One', sans-serif",
              fontSize: scrollY > 50 ? 18 : 21,
              transition: "font-size 0.4s",
              background: "linear-gradient(135deg, #FFB038, #FF8C42)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
            }}>BLAZE</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { label: "תפריט", ref: menuRef },
              { label: "מיקום", ref: locRef },
            ].map((t, i) => (
              <button key={i} onClick={() => t.ref.current?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  padding: "7px 20px", borderRadius: 100,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  fontFamily: "'Heebo', sans-serif",
                  transition: "all 0.3s",
                  backdropFilter: "blur(10px)",
                }}>{t.label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        textAlign: "center",
        padding: "120px 28px 80px",
        position: "relative", zIndex: 1,
      }}>
        {/* Radial spotlight */}
        <div style={{
          position: "absolute",
          top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,176,56,0.07) 0%, transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        <div style={{
          animation: "fadeUp 1s cubic-bezier(.23,1,.32,1) 0.2s both",
          marginBottom: 28,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "8px 22px", borderRadius: 100,
            background: "rgba(255,176,56,0.06)",
            border: "1px solid rgba(255,176,56,0.12)",
            marginBottom: 32,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#4ADE80",
              animation: "pulse 2.5s ease-in-out infinite",
            }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
              {todayLoc?.time !== "סגור" ? `פתוח היום · ${todayLoc?.spot}` : "סגור היום"}
            </span>
          </div>
        </div>

        <h1 style={{
          fontFamily: "'Secular One', sans-serif",
          fontSize: "clamp(48px, 10vw, 100px)",
          lineHeight: 1,
          fontWeight: 400,
          animation: "fadeUp 1s cubic-bezier(.23,1,.32,1) 0.4s both",
          marginBottom: 20,
        }}>
          <span style={{
            background: "linear-gradient(135deg, #FFB038 0%, #FF8C42 50%, #FFB038 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 4s ease-in-out infinite",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>BLAZE</span>
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2.2vw, 20px)",
          color: "rgba(255,255,255,0.3)",
          maxWidth: 440,
          lineHeight: 1.8,
          fontWeight: 300,
          animation: "fadeUp 1s cubic-bezier(.23,1,.32,1) 0.6s both",
          letterSpacing: 0.5,
        }}>
          בורגרים מובחרים על גלגלים.
          <br />בשר טרי · אש חופשית · בלי פשרות.
        </p>

        <div style={{
          display: "flex", gap: 14, marginTop: 44, flexWrap: "wrap", justifyContent: "center",
          animation: "fadeUp 1s cubic-bezier(.23,1,.32,1) 0.8s both",
        }}>
          <button className="cta-primary"
            onClick={() => menuRef.current?.scrollIntoView({ behavior: "smooth" })}>
            צפה בתפריט
          </button>
          <button onClick={() => locRef.current?.scrollIntoView({ behavior: "smooth" })} style={{
            padding: "16px 40px", borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 16, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Heebo', sans-serif",
            transition: "all 0.35s",
          }}>
            מצא אותנו
          </button>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          color: "rgba(255,255,255,0.1)", fontSize: 12,
          animation: "fadeUp 1s 1.2s both",
        }}>
          <div style={{
            width: 20, height: 34, borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", justifyContent: "center", paddingTop: 8,
          }}>
            <div style={{
              width: 3, height: 8, borderRadius: 2,
              background: "rgba(255,176,56,0.5)",
              animation: "pulse 2s infinite",
            }} />
          </div>
        </div>
      </section>

      {/* ─── MENU ─── */}
      <section ref={menuRef} style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "40px 28px 100px",
        position: "relative", zIndex: 1,
      }}>
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ color: "#FFB038", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
              MENU
            </span>
            <h2 style={{
              fontFamily: "'Secular One', sans-serif",
              fontSize: "clamp(30px, 5vw, 46px)",
              fontWeight: 400, marginTop: 8,
              color: "rgba(255,255,255,0.9)",
            }}>התפריט שלנו</h2>
            <div style={{
              width: 50, height: 2, borderRadius: 1, margin: "16px auto 0",
              background: "linear-gradient(90deg, transparent, #FFB038, transparent)",
            }} />
          </div>
        </AnimatedSection>

        {/* Categories */}
        <AnimatedSection delay={0.1}>
          <div style={{
            display: "flex", justifyContent: "center", gap: 10,
            marginBottom: 48, flexWrap: "wrap",
          }}>
            {MENU.map((c, i) => (
              <button key={c.id} className={`cat-btn ${cat === i ? "active" : ""}`}
                onClick={() => setCat(i)}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 22,
        }}>
          {MENU[cat].items.map((item) => (
            <MenuCard key={item.id} item={item} qty={cart[item.id] || 0} onAdd={addToCart} />
          ))}
        </div>
      </section>

      {/* ─── LOCATION ─── */}
      <section ref={locRef} style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.03)",
        padding: "80px 28px 100px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <span style={{ color: "#FFB038", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
                LOCATION
              </span>
              <h2 style={{
                fontFamily: "'Secular One', sans-serif",
                fontSize: "clamp(30px, 5vw, 46px)",
                fontWeight: 400, marginTop: 8,
                color: "rgba(255,255,255,0.9)",
              }}>איפה היום?</h2>
              <div style={{
                width: 50, height: 2, borderRadius: 1, margin: "16px auto 0",
                background: "linear-gradient(90deg, transparent, #FFB038, transparent)",
              }} />
            </div>
          </AnimatedSection>

          {/* Today spotlight */}
          {todayLoc?.time !== "סגור" && (
            <AnimatedSection delay={0.1}>
              <div className="glass-strong" style={{
                borderRadius: 24, padding: "32px 36px",
                marginBottom: 40, textAlign: "center",
                position: "relative", overflow: "hidden",
                border: "1px solid rgba(255,176,56,0.12)",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at 50% 0%, rgba(255,176,56,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "6px 18px", borderRadius: 100,
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  marginBottom: 18,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#4ADE80",
                    animation: "pulse 2.5s infinite",
                  }} />
                  <span style={{ color: "#4ADE80", fontSize: 12, fontWeight: 600 }}>פתוח עכשיו</span>
                </div>
                <div style={{
                  fontFamily: "'Secular One', sans-serif",
                  fontSize: "clamp(22px, 4vw, 30px)",
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: 6,
                }}>{todayLoc.spot}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 15 }}>{todayLoc.time}</div>
                {todayLoc.coords && (
                  <a href={`https://waze.com/ul?ll=${todayLoc.coords}&navigate=yes`}
                    target="_blank" rel="noopener noreferrer"
                    className="cta-primary"
                    style={{
                      display: "inline-block", marginTop: 22,
                      padding: "12px 36px", fontSize: 14, textDecoration: "none",
                    }}>
                    נווט עם Waze
                  </a>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Schedule grid */}
          <AnimatedSection delay={0.2}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
            }}>
              {SCHEDULE.map((s, i) => {
                const isToday = todayIdx === 0 ? i === 0 : i === todayIdx - 1;
                return (
                  <div key={i} className={`schedule-card ${isToday ? "today" : ""}`}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: 8,
                    }}>
                      <span style={{
                        fontWeight: 700, fontSize: 15,
                        color: isToday ? "#FFB038" : "rgba(255,255,255,0.7)",
                      }}>{s.day}</span>
                      {isToday && <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#4ADE80",
                        animation: "pulse 2.5s infinite",
                      }} />}
                    </div>
                    <div style={{
                      color: s.time === "סגור" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
                      fontSize: 13, lineHeight: 1.5,
                    }}>{s.spot}</div>
                    <div style={{
                      color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 4,
                    }}>{s.time}</div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.03)",
        padding: "48px 28px",
        textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontFamily: "'Secular One', sans-serif",
          fontSize: 24,
          background: "linear-gradient(135deg, #FFB038, #FF8C42)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 20,
        }}>BLAZE</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24 }}>
          {[
            { label: "Instagram", url: "#" },
            { label: "TikTok", url: "#" },
          ].map(s => (
            <a key={s.label} href={s.url} style={{
              color: "rgba(255,255,255,0.2)", textDecoration: "none",
              fontSize: 13, fontWeight: 500, transition: "color 0.3s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#FFB038"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
            >{s.label}</a>
          ))}
        </div>
        <div style={{ color: "rgba(255,255,255,0.08)", fontSize: 12 }}>
          BLAZE © {new Date().getFullYear()} · כל הזכויות שמורות
        </div>
      </footer>

      {/* ─── CART FAB ─── */}
      <button onClick={() => setDrawer(true)} style={{
        position: "fixed",
        bottom: 28, left: 28, zIndex: 1000,
        width: 64, height: 64,
        borderRadius: 20,
        background: "rgba(255,176,56,0.12)",
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255,176,56,0.2)",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26,
        transition: "all 0.35s cubic-bezier(.23,1,.32,1)",
        boxShadow: totalItems > 0 ? "0 0 40px rgba(255,176,56,0.15)" : "none",
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
          e.currentTarget.style.background = "rgba(255,176,56,0.2)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.background = "rgba(255,176,56,0.12)";
        }}
      >
        🛒
        {totalItems > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -6,
            width: 24, height: 24, borderRadius: 8,
            background: "#FFB038", color: "#000",
            fontSize: 12, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(255,176,56,0.4)",
          }}>{totalItems}</span>
        )}
      </button>

      {/* ─── WHATSAPP FAB ─── */}
      <a href="https://wa.me/972501234567?text=שלום, אשמח לשמוע פרטים נוספים!"
        target="_blank" rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: 100, left: 28, zIndex: 1000,
          width: 52, height: 52,
          borderRadius: 16,
          background: "rgba(37,211,102,0.12)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(37,211,102,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, textDecoration: "none",
          transition: "all 0.35s cubic-bezier(.23,1,.32,1)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
          e.currentTarget.style.background = "rgba(37,211,102,0.2)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.background = "rgba(37,211,102,0.12)";
        }}
      >
        💬
      </a>

      {/* ─── DRAWER ─── */}
      {drawer && (
        <CartDrawer
          cart={cart}
          onClose={() => setDrawer(false)}
          onUpdate={updateCart}
          onClear={() => setCart({})}
          onOrder={sendOrder}
        />
      )}

      {/* ─── TOAST ─── */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 100, left: "50%", transform: "translateX(-50%)",
          zIndex: 8000,
          background: "rgba(255,176,56,0.1)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,176,56,0.2)",
          padding: "12px 28px", borderRadius: 14,
          color: "#FFB038", fontSize: 14, fontWeight: 600,
          animation: "fadeUp 0.4s cubic-bezier(.23,1,.32,1)",
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
