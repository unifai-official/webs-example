import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ━━━ DATA ━━━
const SERVICES = [
  { id: "general", name: "רפואה כללית", icon: "🩺", duration: 20, price: 150, desc: "בדיקה כללית מקיפה, מעקב בריאותי שוטף והפניות למומחים" },
  { id: "derma", name: "דרמטולוגיה", icon: "✦", duration: 30, price: 350, desc: "טיפולי עור מתקדמים, אסתטיקה רפואית ומיפוי שומות" },
  { id: "ortho", name: "אורתופדיה", icon: "◈", duration: 25, price: 400, desc: "פציעות ספורט, כאבי גב ומפרקים, תוכניות שיקום" },
  { id: "cardio", name: "קרדיולוגיה", icon: "♡", duration: 30, price: 450, desc: "אקו לב, מבחן מאמץ, הולטר וייעוץ קרדיולוגי" },
  { id: "eye", name: "רפואת עיניים", icon: "◉", duration: 20, price: 300, desc: "בדיקות ראייה מקיפות, לחץ תוך עיני, שדה ראייה" },
  { id: "ent", name: "אף אוזן גרון", icon: "◎", duration: 20, price: 300, desc: "בדיקות שמיעה, טיפול בסינוסים, דום נשימה בשינה" },
];

const DOCTORS = [
  { id: "d1", name: "ד״ר מיכל לוי", role: "מנהלת רפואית", spec: "רפואה כללית", services: ["general"] },
  { id: "d2", name: "ד״ר יונתן כהן", role: "דרמטולוג בכיר", spec: "דרמטולוגיה", services: ["derma"] },
  { id: "d3", name: "ד״ר נועה ברק", role: "אורתופדית", spec: "רפואת ספורט", services: ["ortho"] },
  { id: "d4", name: "ד״ר אלון שמיר", role: "קרדיולוג", spec: "קרדיולוגיה", services: ["cardio"] },
];

const HOURS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
const HEB_DAYS = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
const HEB_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

function fmt(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtHeb(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ב${HEB_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function generateSlots(dateStr, bookedSlots) {
  const d = new Date(dateStr);
  const day = d.getDay();
  if (day === 6) return [];
  const isFri = day === 5;
  return HOURS.filter(h => {
    const hr = parseInt(h.split(":")[0]);
    return isFri ? hr < 14 : hr < 19;
  }).filter(h => !bookedSlots.includes(h));
}

// ━━━ HOOKS ━━━
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsInView(true); obs.unobserve(el); }
    }, { threshold: 0.15, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, isInView];
}

function useCounter(end, duration = 2000, trigger = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, end, duration]);
  return val;
}

// ━━━ ANIMATED COMPONENTS ━━━
function Reveal({ children, delay = 0, y = 40, className = "", style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

function StatCounter({ num, suffix = "", label, delay = 0 }) {
  const [ref, inView] = useInView();
  const count = useCounter(num, 2200, inView);
  return (
    <div
      ref={ref}
      className="stat"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate3d(0,0,0)" : "translate3d(0,30px,0)",
        transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      <div className="stat-num">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ━━━ STYLES ━━━
const css = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700;800;900&family=Noto+Serif+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap');

:root {
  --bg: #F8F7F4;
  --bg-warm: #F3F0EB;
  --surface: #FFFFFF;
  --surface-glass: rgba(255,255,255,0.72);
  --primary: #1B3A2D;
  --primary-mid: #2A5A45;
  --primary-light: #3D7A5F;
  --primary-pale: #E4EDE8;
  --accent: #B8885A;
  --accent-warm: #D4A373;
  --text: #111111;
  --text-2: #555555;
  --text-3: #999999;
  --border: #E5E1DB;
  --border-light: #F0EDE8;
  --r-lg: 24px;
  --r-md: 16px;
  --r-sm: 10px;
  --r-full: 100px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration: 0.6s;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }
body {
  font-family: 'Heebo', sans-serif;
  background: var(--bg);
  color: var(--text);
  direction: rtl;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* ═══ NAV ═══ */
.nav {
  position: fixed; top: 0; right: 0; left: 0; z-index: 100;
  padding: 0 48px;
  height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface-glass);
  backdrop-filter: blur(40px) saturate(2);
  -webkit-backdrop-filter: blur(40px) saturate(2);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  transition: all 0.5s var(--ease-out);
}
.nav.scrolled { height: 60px; box-shadow: 0 1px 30px rgba(0,0,0,0.04); }
.nav-logo {
  font-family: 'Noto Serif Hebrew', serif;
  font-weight: 700; font-size: 22px;
  color: var(--primary);
  letter-spacing: -0.5px;
  transition: transform 0.5s var(--ease-spring);
}
.nav-logo:hover { transform: scale(1.03); }
.nav-logo b { color: var(--accent); font-weight: 700; }
.nav-center { display: flex; gap: 36px; align-items: center; }
.nav-link {
  text-decoration: none; color: var(--text-2);
  font-size: 14px; font-weight: 500;
  position: relative; cursor: pointer;
  transition: color 0.3s ease;
  background: none; border: none; font-family: inherit;
}
.nav-link::after {
  content: '';
  position: absolute; bottom: -4px; right: 0; left: 0;
  height: 1.5px; background: var(--primary);
  transform: scaleX(0); transform-origin: right;
  transition: transform 0.4s var(--ease-out);
}
.nav-link:hover { color: var(--primary); }
.nav-link:hover::after { transform: scaleX(1); }
.nav-cta-wrap {}
.nav-cta {
  background: var(--primary); color: #fff;
  border: none; padding: 10px 28px;
  border-radius: var(--r-full);
  font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.4s var(--ease-out);
  position: relative; overflow: hidden;
}
.nav-cta::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.1));
  opacity: 0; transition: opacity 0.3s ease;
}
.nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(27,58,45,0.3); }
.nav-cta:hover::before { opacity: 1; }
.nav-cta:active { transform: translateY(0) scale(0.97); }

.hamburger {
  display: none; background: none; border: none;
  width: 32px; height: 32px; cursor: pointer;
  flex-direction: column; justify-content: center; gap: 6px; align-items: center;
}
.hamburger span {
  display: block; width: 22px; height: 1.5px;
  background: var(--text); border-radius: 1px;
  transition: all 0.4s var(--ease-out);
}

/* ═══ HERO ═══ */
.hero {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 120px 48px 80px;
  position: relative; overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse 80% 60% at 70% 30%, rgba(228,237,232,0.7) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 20% 70%, rgba(184,136,90,0.06) 0%, transparent 50%),
    var(--bg);
}
.hero-grid-line {
  position: absolute;
  background: rgba(0,0,0,0.025);
}
.hero-grid-line.h {
  height: 1px; right: 0; left: 0;
}
.hero-grid-line.v {
  width: 1px; top: 0; bottom: 0;
}
.hero-inner {
  position: relative; z-index: 2;
  max-width: 820px;
  text-align: center;
}
.hero-overline {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600;
  color: var(--primary-mid);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 32px;
  opacity: 0;
  animation: heroFade 1s var(--ease-out) 0.2s forwards;
}
.hero-overline-dot {
  width: 6px; height: 6px;
  background: var(--accent);
  border-radius: 50%;
  animation: gentlePulse 3s ease-in-out infinite;
}
.hero h1 {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: clamp(44px, 6vw, 80px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -2px;
  color: var(--text);
  margin-bottom: 28px;
}
.hero-h1-line {
  display: block;
  opacity: 0;
  animation: heroSlideUp 1s var(--ease-out) forwards;
}
.hero-h1-line:nth-child(1) { animation-delay: 0.3s; }
.hero-h1-line:nth-child(2) { animation-delay: 0.45s; }
.hero-h1-line:nth-child(3) { animation-delay: 0.6s; }
.hero-h1-accent {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero p {
  font-size: 19px; line-height: 1.75;
  color: var(--text-2);
  max-width: 540px;
  margin: 0 auto 44px;
  font-weight: 300;
  opacity: 0;
  animation: heroFade 1s var(--ease-out) 0.75s forwards;
}
.hero-actions {
  display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  opacity: 0;
  animation: heroFade 1s var(--ease-out) 0.9s forwards;
}
.btn-hero {
  padding: 18px 44px; border-radius: var(--r-full);
  font-size: 16px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.5s var(--ease-out);
  border: none; position: relative; overflow: hidden;
}
.btn-hero-primary {
  background: var(--primary); color: #fff;
  box-shadow: 0 2px 24px rgba(27,58,45,0.15);
}
.btn-hero-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 40px rgba(27,58,45,0.25);
}
.btn-hero-primary:active { transform: translateY(-1px) scale(0.98); }
.btn-hero-secondary {
  background: transparent; color: var(--text);
  border: 1.5px solid var(--border);
}
.btn-hero-secondary:hover {
  border-color: var(--primary); color: var(--primary);
  transform: translateY(-2px);
}

.hero-scroll-cue {
  position: absolute; bottom: 40px; left: 50%;
  transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  opacity: 0;
  animation: heroFade 1s var(--ease-out) 1.3s forwards;
}
.scroll-line {
  width: 1px; height: 48px;
  background: linear-gradient(to bottom, var(--border), transparent);
  position: relative; overflow: hidden;
}
.scroll-line::after {
  content: '';
  position: absolute; top: -100%; right: 0;
  width: 1px; height: 100%;
  background: var(--primary);
  animation: scrollDown 2s ease-in-out infinite;
}

/* ═══ STATS ═══ */
.stats-section {
  padding: 0 48px;
  margin-top: -1px;
}
.stats-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.stat {
  padding: 48px 32px;
  text-align: center;
  position: relative;
}
.stat:not(:last-child)::after {
  content: '';
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 1px; background: var(--border);
}
.stat-num {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 48px; font-weight: 800;
  color: var(--primary);
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -2px;
}
.stat-label { font-size: 14px; color: var(--text-3); font-weight: 400; letter-spacing: 0.5px; }

/* ═══ SECTIONS ═══ */
.section { padding: 120px 48px; position: relative; }
.section-warm { background: var(--bg-warm); }

.section-header { text-align: center; margin-bottom: 72px; }
.section-overline {
  font-size: 11px; font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 20px;
}
.section-title {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 700;
  color: var(--text);
  letter-spacing: -1.5px;
  line-height: 1.15;
  margin-bottom: 20px;
}
.section-desc {
  font-size: 17px; color: var(--text-2);
  font-weight: 300; max-width: 480px;
  margin: 0 auto; line-height: 1.7;
}

/* ═══ SERVICES ═══ */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
}
.service-card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--r-lg);
  padding: 40px 32px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.5s var(--ease-out);
}
.service-card::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 60%, var(--primary-pale));
  opacity: 0;
  transition: opacity 0.5s var(--ease-out);
}
.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  border-color: transparent;
}
.service-card:hover::before { opacity: 1; }
.service-card > * { position: relative; z-index: 1; }
.service-icon {
  width: 56px; height: 56px;
  background: var(--bg);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  margin-bottom: 24px;
  transition: all 0.5s var(--ease-spring);
}
.service-card:hover .service-icon { transform: scale(1.1) rotate(-3deg); background: var(--primary-pale); }
.service-name {
  font-size: 20px; font-weight: 700;
  margin-bottom: 10px; color: var(--text);
  transition: color 0.3s ease;
}
.service-card:hover .service-name { color: var(--primary); }
.service-desc { font-size: 14px; color: var(--text-2); line-height: 1.7; margin-bottom: 20px; font-weight: 300; }
.service-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
  font-size: 13px; color: var(--text-3);
}
.service-price { font-weight: 700; color: var(--primary); font-size: 15px; }
.service-arrow {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  transition: all 0.4s var(--ease-out);
  color: var(--text-3);
}
.service-card:hover .service-arrow {
  background: var(--primary); color: #fff;
  transform: translateX(-4px);
}

/* ═══ ABOUT ═══ */
.about-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 80px;
  align-items: center;
}
.about-visual {
  position: relative;
  aspect-ratio: 5/6;
  border-radius: var(--r-lg);
  overflow: hidden;
  background: linear-gradient(160deg, var(--primary-pale) 0%, var(--bg-warm) 50%, #ddd5cb 100%);
}
.about-visual-text {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 120px; font-weight: 900;
  color: var(--primary);
  opacity: 0.05;
  user-select: none;
}
.about-visual-badge {
  position: absolute; bottom: 24px; right: 24px;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  border-radius: var(--r-md);
  padding: 20px 24px;
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}
.avb-num {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 36px; font-weight: 800;
  color: var(--primary);
  line-height: 1;
}
.avb-label { font-size: 12px; color: var(--text-3); margin-top: 4px; }
.about-content {}
.about-overline {
  font-size: 11px; font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 20px;
}
.about-title {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 40px; font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.2;
  margin-bottom: 24px;
  color: var(--text);
}
.about-text {
  font-size: 16px; line-height: 1.85;
  color: var(--text-2); font-weight: 300;
  margin-bottom: 36px;
}
.about-feats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
.about-feat {
  display: flex; align-items: center; gap: 12px;
  font-size: 14px; font-weight: 500;
  color: var(--text);
  padding: 12px 16px;
  border-radius: var(--r-sm);
  transition: all 0.3s ease;
}
.about-feat:hover { background: var(--primary-pale); }
.af-dot {
  width: 6px; height: 6px;
  background: var(--accent);
  border-radius: 50%;
  flex-shrink: 0;
}

/* ═══ TEAM ═══ */
.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
}
.team-card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--r-lg);
  padding: 40px 28px 32px;
  text-align: center;
  transition: all 0.5s var(--ease-out);
  position: relative; overflow: hidden;
}
.team-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,0.07); }
.team-avatar {
  width: 88px; height: 88px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 32px; font-weight: 700;
  color: var(--primary);
  background: linear-gradient(145deg, var(--primary-pale), var(--bg-warm));
  transition: all 0.5s var(--ease-spring);
}
.team-card:hover .team-avatar { transform: scale(1.08); }
.team-name { font-size: 18px; font-weight: 700; margin-bottom: 6px; color: var(--text); }
.team-role { font-size: 13px; color: var(--text-3); font-weight: 400; margin-bottom: 4px; }
.team-spec { font-size: 12px; color: var(--accent); font-weight: 600; }

/* ═══ BOOKING CTA ═══ */
.booking-cta-section {
  padding: 120px 48px;
  position: relative; overflow: hidden;
}
.booking-cta-bg {
  position: absolute; inset: 0;
  background: var(--primary);
}
.booking-cta-bg::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 50% 80% at 30% 20%, rgba(61,122,95,0.5) 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 80% 80%, rgba(184,136,90,0.15) 0%, transparent 50%);
}
.booking-cta-inner {
  position: relative; z-index: 2;
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}
.booking-cta-inner .section-overline { color: var(--accent-warm); }
.booking-cta-title {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: clamp(36px, 4.5vw, 56px);
  font-weight: 700;
  color: #fff;
  letter-spacing: -1.5px;
  line-height: 1.15;
  margin-bottom: 20px;
}
.booking-cta-desc {
  font-size: 17px; color: rgba(255,255,255,0.6);
  font-weight: 300; line-height: 1.7;
  margin-bottom: 44px;
  max-width: 460px;
  margin-left: auto; margin-right: auto;
}
.btn-booking-cta {
  background: #fff; color: var(--primary);
  border: none; padding: 20px 52px;
  border-radius: var(--r-full);
  font-size: 17px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.5s var(--ease-out);
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
}
.btn-booking-cta:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 48px rgba(0,0,0,0.25);
}
.btn-booking-cta:active { transform: translateY(-1px) scale(0.98); }

/* ═══ CONTACT ═══ */
.contact-grid {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.contact-card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--r-lg);
  padding: 36px 28px;
  text-align: center;
  transition: all 0.5s var(--ease-out);
}
.contact-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,0.06); }
.cc-icon {
  width: 52px; height: 52px;
  background: var(--primary-pale);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
  font-size: 22px;
  transition: all 0.4s var(--ease-spring);
}
.contact-card:hover .cc-icon { transform: scale(1.1) rotate(-5deg); }
.cc-label {
  font-size: 11px; color: var(--text-3); font-weight: 600;
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;
}
.cc-value { font-size: 16px; font-weight: 600; color: var(--text); line-height: 1.6; }
.cc-value a { color: var(--primary); text-decoration: none; transition: color 0.3s ease; }
.cc-value a:hover { color: var(--primary-light); }

/* ═══ FOOTER ═══ */
.footer {
  background: #111; color: #fff;
  padding: 72px 48px 36px;
}
.footer-inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.footer-brand {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 24px; font-weight: 700;
  margin-bottom: 14px;
}
.footer-brand b { color: var(--accent); }
.footer-brand-desc { font-size: 14px; color: rgba(255,255,255,0.35); line-height: 1.7; font-weight: 300; }
.footer-col-title {
  font-size: 12px; font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 20px;
}
.footer-links { list-style: none; }
.footer-links li { margin-bottom: 12px; }
.footer-links a {
  color: rgba(255,255,255,0.4); text-decoration: none;
  font-size: 14px; font-weight: 400;
  transition: all 0.3s ease;
  display: inline-block;
}
.footer-links a:hover { color: var(--accent-warm); transform: translateX(-4px); }
.footer-bottom {
  max-width: 1100px; margin: 24px auto 0;
  text-align: center;
  font-size: 12px; color: rgba(255,255,255,0.2);
  letter-spacing: 0.5px;
}

/* ═══ WHATSAPP ═══ */
.whatsapp-fab {
  position: fixed; bottom: 28px; left: 28px;
  z-index: 90;
  width: 56px; height: 56px;
  background: #25D366;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 28px;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(37,211,102,0.35);
  transition: all 0.4s var(--ease-spring);
  animation: fabIn 0.6s var(--ease-spring) 1.5s both;
}
.whatsapp-fab:hover { transform: scale(1.12); box-shadow: 0 6px 28px rgba(37,211,102,0.45); }
.whatsapp-fab:active { transform: scale(0.95); }
.whatsapp-fab svg { width: 28px; height: 28px; fill: #fff; }

/* ═══ BOOKING MODAL ═══ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(12px);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: fadeIn 0.35s ease;
}
.modal-box {
  background: var(--surface);
  border-radius: 28px;
  width: 100%; max-width: 880px;
  max-height: 92vh; overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0,0,0,0.18);
  animation: modalIn 0.5s var(--ease-out);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-light);
}
.modal-title {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 20px; font-weight: 700;
}
.modal-close {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: none; background: var(--bg);
  cursor: pointer; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  transition: all 0.3s ease;
}
.modal-close:hover { background: var(--border); color: var(--text); }

.steps-bar {
  display: flex;
  padding: 20px 32px;
  gap: 8px;
  border-bottom: 1px solid var(--border-light);
}
.step-pill {
  flex: 1; height: 4px;
  border-radius: 2px;
  background: var(--border-light);
  transition: all 0.6s var(--ease-out);
  overflow: hidden;
}
.step-pill.active { background: var(--primary); }
.step-pill.done { background: var(--accent); }

.modal-body { padding: 36px 32px; }
.mb-title {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 24px; font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}
.mb-desc { font-size: 14px; color: var(--text-3); margin-bottom: 28px; }

/* Service Select */
.svc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.svc-opt {
  padding: 20px;
  border: 1.5px solid var(--border-light);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all 0.4s var(--ease-out);
  background: var(--surface);
}
.svc-opt:hover { border-color: var(--primary-pale); background: rgba(228,237,232,0.3); }
.svc-opt.active { border-color: var(--primary); background: var(--primary-pale); }
.svc-opt-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
.svc-opt-meta { font-size: 12px; color: var(--text-3); }

/* Calendar */
.cal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.cal-title {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 20px; font-weight: 700;
  letter-spacing: -0.5px;
}
.cal-nav { display: flex; gap: 6px; }
.cal-nav button {
  width: 36px; height: 36px;
  border-radius: 50%; border: 1px solid var(--border-light);
  background: var(--surface);
  cursor: pointer; font-size: 15px;
  transition: all 0.3s ease;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-2); font-family: inherit;
}
.cal-nav button:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-pale); }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day-label {
  text-align: center; font-size: 11px; font-weight: 600;
  color: var(--text-3); padding: 8px 0;
  letter-spacing: 1px;
}
.cal-day {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px; font-size: 14px; font-weight: 500;
  cursor: pointer; border: none; background: transparent;
  transition: all 0.3s var(--ease-out);
  font-family: inherit; color: var(--text);
}
.cal-day:hover:not(.off):not(.empty) { background: var(--primary-pale); color: var(--primary); }
.cal-day.sel { background: var(--primary); color: #fff; font-weight: 700; transform: scale(1.08); }
.cal-day.today { box-shadow: inset 0 0 0 2px var(--accent); }
.cal-day.off { color: var(--text-3); opacity: 0.35; cursor: default; }
.cal-day.empty { cursor: default; }

.slots-label { font-size: 15px; font-weight: 600; margin: 28px 0 14px; color: var(--text); }
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
}
.slot-btn {
  padding: 12px 4px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border-light);
  background: var(--surface);
  font-size: 15px; font-weight: 500;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s var(--ease-out);
  color: var(--text);
}
.slot-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-pale); }
.slot-btn.sel { background: var(--primary); color: #fff; border-color: var(--primary); transform: scale(1.04); }

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg.full { grid-column: 1 / -1; }
.fg-label { font-size: 13px; font-weight: 600; color: var(--text); }
.fg-input {
  padding: 14px 18px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border-light);
  font-size: 15px; font-family: inherit;
  transition: all 0.3s ease;
  background: var(--surface); color: var(--text);
  direction: rtl;
}
.fg-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-pale); }
.fg-input::placeholder { color: var(--text-3); }
textarea.fg-input { resize: vertical; min-height: 80px; }

/* Summary */
.summary-block {
  background: var(--bg); border-radius: var(--r-lg); padding: 32px;
}
.summary-row {
  display: flex; justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
  font-size: 15px;
}
.summary-row:last-child { border-bottom: none; }
.sr-label { color: var(--text-3); }
.sr-value { font-weight: 600; }
.sr-total .sr-label { font-size: 18px; color: var(--text); font-weight: 600; }
.sr-total .sr-value { font-size: 24px; color: var(--primary); font-weight: 800; }

.modal-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 32px;
  border-top: 1px solid var(--border-light);
}
.btn-m-back {
  background: transparent; border: 1.5px solid var(--border);
  padding: 14px 32px; border-radius: var(--r-full);
  font-size: 15px; font-weight: 500;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s ease;
  color: var(--text);
}
.btn-m-back:hover { border-color: var(--primary); color: var(--primary); }
.btn-m-next {
  background: var(--primary); color: #fff;
  border: none; padding: 14px 40px;
  border-radius: var(--r-full);
  font-size: 15px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.4s var(--ease-out);
}
.btn-m-next:hover { background: var(--primary-mid); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(27,58,45,0.25); }
.btn-m-next:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-m-next:active:not(:disabled) { transform: translateY(0) scale(0.97); }

/* SUCCESS */
.success-wrap { text-align: center; padding: 60px 40px; }
.success-check {
  width: 80px; height: 80px;
  background: var(--primary-pale);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 28px;
  animation: successPop 0.6s var(--ease-spring);
}
.success-check-inner {
  width: 36px; height: 36px;
  color: var(--primary);
}
.success-title {
  font-family: 'Noto Serif Hebrew', serif;
  font-size: 28px; font-weight: 700;
  margin-bottom: 12px; letter-spacing: -0.5px;
}
.success-desc { font-size: 15px; color: var(--text-2); font-weight: 300; line-height: 1.7; }

/* ═══ ANIMATIONS ═══ */
@keyframes heroSlideUp {
  from { opacity: 0; transform: translate3d(0, 50px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes heroFade {
  from { opacity: 0; transform: translate3d(0, 20px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes gentlePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
@keyframes scrollDown {
  0% { top: -100%; }
  100% { top: 100%; }
}
@keyframes fabIn {
  from { opacity: 0; transform: scale(0.5) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalIn {
  from { opacity: 0; transform: translate3d(0, 40px, 0) scale(0.96); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes successPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 1024px) {
  .services-grid { grid-template-columns: repeat(2, 1fr); }
  .team-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-visual { display: none; }
}
@media (max-width: 768px) {
  .nav { padding: 0 20px; }
  .nav-center { display: none; }
  .nav-cta-wrap { display: none; }
  .hamburger { display: flex; }
  .hero { padding: 100px 24px 60px; }
  .section { padding: 80px 24px; }
  .stats-section { padding: 0 24px; }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .stat:not(:last-child)::after { display: none; }
  .services-grid { grid-template-columns: 1fr; }
  .about-layout { grid-template-columns: 1fr; gap: 40px; }
  .about-feats { grid-template-columns: 1fr; }
  .team-grid { grid-template-columns: 1fr 1fr; }
  .contact-grid { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
  .booking-cta-section { padding: 80px 24px; }
  .form-grid { grid-template-columns: 1fr; }
  .modal-body { padding: 24px 20px; }
  .modal-header { padding: 20px; }
  .modal-footer { padding: 20px; }
  .svc-grid { grid-template-columns: 1fr; }
  .hero-actions { flex-direction: column; align-items: stretch; }
  .btn-hero { text-align: center; }
}
@media (max-width: 480px) {
  .team-grid { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; }
}
`;

// ═══ CALENDAR ═══
function CalendarPicker({ selectedDate, onSelect, month, onMonthChange }) {
  const today = new Date();
  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isPast = (d) => {
    const date = new Date(year, mo, d); date.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return date < t;
  };
  const isSat = (d) => new Date(year, mo, d).getDay() === 6;

  return (
    <div>
      <div className="cal-head">
        <div className="cal-title">{HEB_MONTHS[mo]} {year}</div>
        <div className="cal-nav">
          <button onClick={() => onMonthChange(-1)} aria-label="חודש קודם">→</button>
          <button onClick={() => onMonthChange(1)} aria-label="חודש הבא">←</button>
        </div>
      </div>
      <div className="cal-grid">
        {HEB_DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="cal-day empty" />;
          const dateStr = fmt(new Date(year, mo, d));
          const sel = selectedDate === dateStr;
          const isToday = d === today.getDate() && mo === today.getMonth() && year === today.getFullYear();
          const off = isPast(d) || isSat(d);
          return (
            <button
              key={i}
              className={`cal-day${sel ? " sel" : ""}${isToday ? " today" : ""}${off ? " off" : ""}`}
              onClick={() => !off && onSelect(dateStr)}
              disabled={off}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ═══ BOOKING MODAL ═══
function BookingModal({ onClose, initialService }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(initialService || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [month, setMonth] = useState(new Date());
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [booked, setBooked] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      try {
        const res = await window.storage.get(`appt:${selectedDate}`);
        setBookedSlots(res ? JSON.parse(res.value).map(a => a.time) : []);
      } catch { setBookedSlots([]); }
    })();
  }, [selectedDate]);

  const slots = selectedDate ? generateSlots(selectedDate, bookedSlots) : [];
  const svc = SERVICES.find(s => s.id === service);

  const handleBook = async () => {
    setLoading(true);
    try {
      const key = `appt:${selectedDate}`;
      let existing = [];
      try { const r = await window.storage.get(key); if (r) existing = JSON.parse(r.value); } catch {}
      existing.push({ time: selectedTime, service, name: form.name, phone: form.phone, email: form.email, notes: form.notes, at: new Date().toISOString() });
      await window.storage.set(key, JSON.stringify(existing));
      setBooked(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const canNext = step === 1 ? !!service : step === 2 ? !!selectedDate && !!selectedTime : step === 3 ? form.name.length > 1 && form.phone.length > 5 : true;

  if (booked) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="success-wrap">
          <div className="success-check">
            <svg className="success-check-inner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="success-title">התור נקבע בהצלחה</div>
          <p className="success-desc">{svc?.name} · {fmtHeb(selectedDate)} · {selectedTime}</p>
          <p className="success-desc" style={{marginTop: 4}}>אישור יישלח ל-{form.phone}</p>
          <button className="btn-m-next" style={{marginTop: 32}} onClick={onClose}>סגירה</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">קביעת תור</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="steps-bar">
          {[1,2,3,4].map(i => <div key={i} className={`step-pill${step === i ? " active" : ""}${step > i ? " done" : ""}`} />)}
        </div>
        <div className="modal-body">
          {step === 1 && (
            <div>
              <div className="mb-title">בחרו טיפול</div>
              <div className="mb-desc">בחרו את סוג הביקור הרצוי</div>
              <div className="svc-grid">
                {SERVICES.map(s => (
                  <div key={s.id} className={`svc-opt${service === s.id ? " active" : ""}`} onClick={() => setService(s.id)}>
                    <div className="svc-opt-name">{s.icon} {s.name}</div>
                    <div className="svc-opt-meta">{s.duration} דקות · ₪{s.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="mb-title">בחרו תאריך ושעה</div>
              <div className="mb-desc">בחרו יום ושעה נוחים</div>
              <CalendarPicker selectedDate={selectedDate} onSelect={d => { setSelectedDate(d); setSelectedTime(""); }} month={month} onMonthChange={dir => setMonth(p => { const d = new Date(p); d.setMonth(d.getMonth()+dir); return d; })} />
              {selectedDate && slots.length > 0 && (
                <>
                  <div className="slots-label">שעות פנויות ל-{fmtHeb(selectedDate)}</div>
                  <div className="slots-grid">
                    {slots.map(s => <button key={s} className={`slot-btn${selectedTime === s ? " sel" : ""}`} onClick={() => setSelectedTime(s)}>{s}</button>)}
                  </div>
                </>
              )}
              {selectedDate && slots.length === 0 && (
                <div style={{textAlign: "center", padding: 40, color: "var(--text-3)", fontSize: 15}}>
                  {new Date(selectedDate).getDay() === 6 ? "הקליניקה סגורה בשבת" : "אין תורים פנויים ביום זה"}
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="mb-title">פרטים אישיים</div>
              <div className="mb-desc">מלאו את הפרטים לאישור התור</div>
              <div className="form-grid">
                <div className="fg">
                  <label className="fg-label">שם מלא *</label>
                  <input className="fg-input" placeholder="ישראל ישראלי" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="fg">
                  <label className="fg-label">טלפון *</label>
                  <input className="fg-input" placeholder="050-1234567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="fg full">
                  <label className="fg-label">אימייל</label>
                  <input className="fg-input" type="email" placeholder="mail@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="fg full">
                  <label className="fg-label">הערות לרופא</label>
                  <textarea className="fg-input" placeholder="מידע רלוונטי..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <div className="mb-title">סיכום התור</div>
              <div className="mb-desc">בדקו את הפרטים לפני אישור</div>
              <div className="summary-block">
                <div className="summary-row"><span className="sr-label">שירות</span><span className="sr-value">{svc?.name}</span></div>
                <div className="summary-row"><span className="sr-label">תאריך</span><span className="sr-value">{fmtHeb(selectedDate)}</span></div>
                <div className="summary-row"><span className="sr-label">שעה</span><span className="sr-value">{selectedTime}</span></div>
                <div className="summary-row"><span className="sr-label">משך</span><span className="sr-value">{svc?.duration} דקות</span></div>
                <div className="summary-row"><span className="sr-label">שם</span><span className="sr-value">{form.name}</span></div>
                <div className="summary-row"><span className="sr-label">טלפון</span><span className="sr-value">{form.phone}</span></div>
                <div className="summary-row sr-total"><span className="sr-label">מחיר</span><span className="sr-value">₪{svc?.price}</span></div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {step > 1 ? <button className="btn-m-back" onClick={() => setStep(s => s-1)}>חזרה</button> : <button className="btn-m-back" onClick={onClose}>ביטול</button>}
          {step < 4 ? <button className="btn-m-next" disabled={!canNext} onClick={() => setStep(s => s+1)}>המשך</button>
            : <button className="btn-m-next" onClick={handleBook} disabled={loading}>{loading ? "שולח..." : "אישור וקביעת תור"}</button>}
        </div>
      </div>
    </div>
  );
}

// ═══ MAIN ═══
export default function ClinicPremium() {
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSvc, setBookingSvc] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openBooking = (id = "") => { setBookingSvc(id); setShowBooking(true); };
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      <style>{css}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-logo">מדיקה<b>+</b></div>
        <div className="nav-center">
          <button className="nav-link" onClick={() => scrollTo("services")}>שירותים</button>
          <button className="nav-link" onClick={() => scrollTo("about")}>אודות</button>
          <button className="nav-link" onClick={() => scrollTo("team")}>הצוות</button>
          <button className="nav-link" onClick={() => scrollTo("contact")}>צור קשר</button>
        </div>
        <div className="nav-cta-wrap">
          <button className="nav-cta" onClick={() => openBooking()}>קביעת תור</button>
        </div>
        <button className="hamburger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="תפריט">
          <span /><span /><span />
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid-line h" style={{top: "25%"}} />
          <div className="hero-grid-line h" style={{top: "50%"}} />
          <div className="hero-grid-line h" style={{top: "75%"}} />
          <div className="hero-grid-line v" style={{right: "25%"}} />
          <div className="hero-grid-line v" style={{right: "50%"}} />
          <div className="hero-grid-line v" style={{right: "75%"}} />
        </div>
        <div className="hero-inner">
          <div className="hero-overline">
            <span className="hero-overline-dot" />
            מקבלים מטופלים חדשים
          </div>
          <h1>
            <span className="hero-h1-line">הבריאות שלך.</span>
            <span className="hero-h1-line"><span className="hero-h1-accent">בידיים הטובות</span></span>
            <span className="hero-h1-line">ביותר.</span>
          </h1>
          <p>קליניקה רב-תחומית מתקדמת המשלבת מומחיות רפואית עם גישה אנושית חמה. טכנולוגיה מתקדמת, תורים דיגיטליים, חוויה אחרת.</p>
          <div className="hero-actions">
            <button className="btn-hero btn-hero-primary" onClick={() => openBooking()}>קביעת תור</button>
            <button className="btn-hero btn-hero-secondary" onClick={() => scrollTo("services")}>גלו את השירותים</button>
          </div>
        </div>
        <div className="hero-scroll-cue">
          <div className="scroll-line" />
        </div>
      </section>

      {/* STATS */}
      <div className="stats-section">
        <div className="stats-inner">
          <StatCounter num={15} suffix="K+" label="מטופלים פעילים" delay={0} />
          <StatCounter num={12} suffix="" label="תחומי מומחיות" delay={0.1} />
          <StatCounter num={25} suffix="" label="שנות ניסיון" delay={0.2} />
          <StatCounter num={4.9} suffix="" label="דירוג ממוצע" delay={0.3} />
        </div>
      </div>

      {/* SERVICES */}
      <section className="section" id="services">
        <Reveal>
          <div className="section-header">
            <div className="section-overline">שירותים רפואיים</div>
            <div className="section-title">מגוון מומחיויות.<br/>מקום אחד.</div>
            <div className="section-desc">הקליניקה מציעה מענה רפואי מקיף עם צוות המומחים המובילים בישראל</div>
          </div>
        </Reveal>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <div className="service-card" onClick={() => openBooking(s.id)}>
                <div className="service-icon">{s.icon}</div>
                <div className="service-name">{s.name}</div>
                <div className="service-desc">{s.desc}</div>
                <div className="service-footer">
                  <span>{s.duration} דקות</span>
                  <span className="service-price">₪{s.price}</span>
                  <div className="service-arrow">←</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="section section-warm" id="about">
        <div className="about-layout">
          <Reveal y={30}>
            <div className="about-visual">
              <div className="about-visual-text">+</div>
              <div className="about-visual-badge">
                <div className="avb-num">25</div>
                <div className="avb-label">שנות מצוינות רפואית</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="about-content">
              <div className="about-overline">אודות הקליניקה</div>
              <h3 className="about-title">רפואה מתקדמת.<br/>גישה אנושית.</h3>
              <p className="about-text">קליניקת מדיקה+ הוקמה מתוך חזון ליצור מרכז רפואי שמשלב את הטכנולוגיה המתקדמת ביותר עם גישה אישית וחמה לכל מטופל. הצוות שלנו כולל מומחים מהשורה הראשונה, ציוד חדיש ומערכת דיגיטלית שמבטיחה חוויה חלקה מההרשמה ועד קבלת התוצאות.</p>
              <div className="about-feats">
                {["ציוד רפואי מתקדם","זימון תורים דיגיטלי","חניה חינם למטופלים","נגישות מלאה","תוצאות בדיגיטל","הסכמי קופות חולים"].map(f => (
                  <div key={f} className="about-feat"><div className="af-dot" />{f}</div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TEAM */}
      <section className="section" id="team">
        <Reveal>
          <div className="section-header">
            <div className="section-overline">הצוות הרפואי</div>
            <div className="section-title">מומחים שאפשר<br/>לסמוך עליהם.</div>
            <div className="section-desc">שנים של ניסיון, מחויבות למצוינות, ואכפתיות אמיתית לכל מטופל</div>
          </div>
        </Reveal>
        <div className="team-grid">
          {DOCTORS.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.1}>
              <div className="team-card">
                <div className="team-avatar">{d.name.split(" ").pop()?.[0]}</div>
                <div className="team-name">{d.name}</div>
                <div className="team-role">{d.role}</div>
                <div className="team-spec">{d.spec}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BOOKING CTA */}
      <section className="booking-cta-section" id="booking">
        <div className="booking-cta-bg" />
        <Reveal>
          <div className="booking-cta-inner">
            <div className="section-overline">זימון תורים</div>
            <div className="booking-cta-title">הבריאות שלך<br/>לא יכולה לחכות.</div>
            <div className="booking-cta-desc">קבעו תור עכשיו — בחרו מומחיות, תאריך ושעה נוחים, ואנחנו נדאג לשאר.</div>
            <button className="btn-booking-cta" onClick={() => openBooking()}>קביעת תור →</button>
          </div>
        </Reveal>
      </section>

      {/* CONTACT */}
      <section className="section" id="contact">
        <Reveal>
          <div className="section-header">
            <div className="section-overline">צור קשר</div>
            <div className="section-title">נשמח לעמוד<br/>לשירותכם.</div>
          </div>
        </Reveal>
        <div className="contact-grid">
          {[
            { icon: "📍", label: "כתובת", value: "רחוב הרופאים 12, תל אביב", link: null },
            { icon: "📞", label: "טלפון", value: "03-1234567", link: "tel:+97231234567" },
            { icon: "🕐", label: "שעות פעילות", value: "א׳-ה׳ 08:00-18:00\nו׳ 08:00-13:00", link: null },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="contact-card">
                <div className="cc-icon">{c.icon}</div>
                <div className="cc-label">{c.label}</div>
                <div className="cc-value" style={{whiteSpace: "pre-line"}}>
                  {c.link ? <a href={c.link}>{c.value}</a> : c.value}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">מדיקה<b>+</b></div>
            <p className="footer-brand-desc">קליניקה רב-תחומית מתקדמת. הבריאות שלך, בידיים הטובות ביותר.</p>
          </div>
          <div>
            <div className="footer-col-title">ניווט</div>
            <ul className="footer-links">
              {[["שירותים","services"],["אודות","about"],["הצוות","team"],["צור קשר","contact"]].map(([t,id]) => (
                <li key={id}><a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{t}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">שירותים</div>
            <ul className="footer-links">
              {SERVICES.slice(0,4).map(s => <li key={s.id}><a href="#" onClick={e => { e.preventDefault(); openBooking(s.id); }}>{s.name}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">משפטי</div>
            <ul className="footer-links">
              <li><a href="#">מדיניות פרטיות</a></li>
              <li><a href="#">הצהרת נגישות</a></li>
              <li><a href="#">תקנון</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} מדיקה+ · כל הזכויות שמורות</div>
      </footer>

      {/* WHATSAPP */}
      <a className="whatsapp-fab" href="https://wa.me/9721234567?text=שלום, אשמח לקבל פרטים נוספים" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.496A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.389 0-4.636-.826-6.438-2.267l-.362-.298-2.647.888.888-2.647-.298-.362A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
      </a>

      {/* MODAL */}
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} initialService={bookingSvc} />}
    </div>
  );
}
