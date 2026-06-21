import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─── */
const SITE = { name: "נועה לימודים", phone: "054-1234567", phoneFull: "+972541234567", email: "noa@lessons.co.il", ig: "@noa.lessons" };

const SUBJECTS = [
  { icon: "∑", title: "מתמטיקה", desc: "3-5 יח״ל, אלגברה, גיאומטריה, חדו״א, סטטיסטיקה והסתברות", gradient: "linear-gradient(135deg, #FF6B6B, #EE5A24)" },
  { icon: "⚛", title: "פיזיקה", desc: "מכניקה, חשמל, אופטיקה, גלים וקרינה — 5 יחידות", gradient: "linear-gradient(135deg, #74b9ff, #0984e3)" },
  { icon: "En", title: "אנגלית", desc: "דקדוק, הבנת הנקרא, כתיבה אקדמית, הכנה לפסיכומטרי", gradient: "linear-gradient(135deg, #55efc4, #00b894)" },
  { icon: "✦", title: "הכנה לבגרויות", desc: "תוכנית מותאמת, סימולציות, חומרי עזר ומעקב התקדמות", gradient: "linear-gradient(135deg, #fdcb6e, #e17055)" },
];

const TESTIMONIALS = [
  { name: "יעל כ.", text: "נועה העלתה אותי מ-60 ל-95 במתמטיקה תוך 3 חודשים. היא מסבירה בצורה שפשוט נכנסת לראש.", badge: "כיתה י״ב" },
  { name: "אורי מ.", text: "בזכות נועה עברתי פיזיקה 5 יחידות בהצטיינות. הרבה סבלנות, שיטתיות ודיוק.", badge: "כיתה י״א" },
  { name: "מיכל ד.", text: "הבת שלי פחדה ממתמטיקה. אחרי חודשיים עם נועה היא מבקשת עוד תרגילים בבית.", badge: "אמא של תלמידה" },
  { name: "דניאל ש.", text: "למדתי אנגלית לקראת הפסיכומטרי. קפצתי 30 נקודות בחלק האנגלי בזכותה.", badge: "פסיכומטרי" },
];

const PRICING = [
  { title: "שיעור בודד", price: "150", unit: "לשיעור", features: ["60 דקות", "אונליין או פרונטלי", "חומרי עזר כלולים", "גמישות מלאה"], pop: false },
  { title: "חבילת 8", price: "130", unit: "לשיעור", features: ["60 דקות לשיעור", "חיסכון של 160₪", "מעקב התקדמות שבועי", "מבחנים לדוגמא"], pop: true },
  { title: "חבילת 16", price: "110", unit: "לשיעור", features: ["60 דקות לשיעור", "חיסכון של 640₪", "דו״ח חודשי להורים", "זמינות בווטסאפ 24/7"], pop: false },
];

/* ─── HOOKS ─── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function useMouseGlow() {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
  return { ref, onMouseMove: handleMove };
}

/* ─── COMPONENTS ─── */
function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

function GlassCard({ children, className = "", glow = false, style = {} }) {
  const { ref, onMouseMove } = useMouseGlow();
  return (
    <div ref={ref} onMouseMove={onMouseMove} className={`glass-card ${glow ? "glass-glow" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ─── MAIN ─── */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", subject: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const [activeTesti, setActiveTesti] = useState(0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTesti(i => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  const submit = (e) => { e.preventDefault(); setFormSent(true); setTimeout(() => setFormSent(false), 4500); setFormData({ name: "", phone: "", subject: "", message: "" }); };

  return (
    <div style={{ direction: "rtl" }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700;800;900&family=Frank+Ruhl+Libre:wght@300;400;500;700;900&display=swap');

:root {
  --bg: #08090E;
  --bg2: #0F1117;
  --surface: rgba(255,255,255,0.04);
  --glass: rgba(255,255,255,0.06);
  --glass-border: rgba(255,255,255,0.08);
  --glass-hover: rgba(255,255,255,0.1);
  --text: #F0EDE8;
  --text2: rgba(240,237,232,0.55);
  --accent: #FF8A65;
  --accent2: #FFB74D;
  --accent-glow: rgba(255,138,101,0.15);
  --accent-glow2: rgba(255,138,101,0.08);
  --radius: 20px;
  --radius-sm: 12px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Heebo', sans-serif; overflow-x: hidden; }

::selection { background: rgba(255,138,101,0.3); color: white; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

/* ─── GLASS ─── */
.glass-card {
  background: var(--glass);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(255,138,101,0.06), transparent 40%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
  z-index: 0;
}
.glass-card:hover::before { opacity: 1; }
.glass-card:hover { border-color: rgba(255,255,255,0.12); }
.glass-glow:hover {
  box-shadow: 0 8px 40px -12px rgba(255,138,101,0.15), 0 0 0 1px rgba(255,138,101,0.08);
  transform: translateY(-4px);
}
.glass-card > * { position: relative; z-index: 1; }

/* ─── AMBIENT ORBS ─── */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}
.orb-1 { width: 500px; height: 500px; background: #FF6B6B; top: -10%; right: -10%; animation: orbFloat1 20s ease-in-out infinite; }
.orb-2 { width: 400px; height: 400px; background: #74b9ff; bottom: 10%; left: -8%; animation: orbFloat2 25s ease-in-out infinite; }
.orb-3 { width: 350px; height: 350px; background: #fdcb6e; top: 50%; left: 40%; animation: orbFloat3 18s ease-in-out infinite; }
@keyframes orbFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-40px, 60px) scale(1.1); } 66% { transform: translate(30px, -30px) scale(0.95); } }
@keyframes orbFloat2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(50px, -40px) scale(1.08); } }
@keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0) scale(1); } 40% { transform: translate(-60px, 30px) scale(1.12); } 80% { transform: translate(20px, -50px) scale(0.92); } }

/* ─── NOISE OVERLAY ─── */
.noise {
  position: fixed; inset: 0; z-index: 9998; pointer-events: none; opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px;
}

/* ─── NAV ─── */
.nav {
  position: fixed; top: 0; right: 0; left: 0; z-index: 100;
  transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
  padding: 0 24px;
}
.nav.scrolled {
  background: rgba(8,9,14,0.75);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.nav-inner {
  max-width: 1200px; margin: 0 auto; display: flex; align-items: center;
  justify-content: space-between; height: 72px;
}
.nav.scrolled .nav-inner { height: 60px; }
.nav-logo {
  font-family: 'Frank Ruhl Libre', serif; font-weight: 700; font-size: 22px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; cursor: pointer;
}
.nav-links { display: flex; gap: 36px; list-style: none; }
.nav-links a {
  text-decoration: none; color: var(--text2); font-size: 14px; font-weight: 400;
  cursor: pointer; transition: color 0.3s; letter-spacing: 0.02em;
}
.nav-links a:hover { color: var(--text); }
.nav-cta {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #08090E; border: none; padding: 10px 24px; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Heebo', sans-serif;
  transition: all 0.3s; letter-spacing: 0.02em;
}
.nav-cta:hover { box-shadow: 0 4px 24px rgba(255,138,101,0.3); transform: translateY(-1px); }

.burger { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
.burger span {
  display: block; width: 22px; height: 1.5px; background: var(--text);
  margin: 5px 0; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); border-radius: 1px;
}
.mobile-drawer {
  display: none; position: fixed; inset: 0; z-index: 99;
  background: rgba(8,9,14,0.96);
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  flex-direction: column; align-items: center; justify-content: center; gap: 28px;
}
.mobile-drawer.open { display: flex; }
.mobile-drawer a { font-size: 24px; color: var(--text); text-decoration: none; cursor: pointer; font-weight: 300; }

@media (max-width: 768px) {
  .nav-links, .nav-cta-d { display: none !important; }
  .burger { display: block; }
}

/* ─── HERO ─── */
.hero {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; padding: 100px 24px 80px;
}
.hero-content { max-width: 820px; text-align: center; position: relative; z-index: 2; }
.hero-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--glass); backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); padding: 8px 20px;
  border-radius: 100px; font-size: 13px; color: var(--accent);
  font-weight: 400; margin-bottom: 32px;
}
.hero-pill-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }

.hero h1 {
  font-family: 'Frank Ruhl Libre', serif; font-weight: 900;
  font-size: clamp(44px, 8vw, 80px); line-height: 1.08;
  letter-spacing: -2px; margin-bottom: 24px;
}
.hero h1 .glow {
  background: linear-gradient(135deg, var(--accent), var(--accent2), #FF6B6B);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: clamp(16px, 2.2vw, 20px); font-weight: 300; color: var(--text2);
  max-width: 520px; margin: 0 auto 40px; line-height: 1.75;
}
.hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

.btn-glow {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #08090E; border: none; padding: 16px 40px; border-radius: var(--radius-sm);
  font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'Heebo', sans-serif;
  transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 4px 24px rgba(255,138,101,0.2);
}
.btn-glow:hover { box-shadow: 0 8px 40px rgba(255,138,101,0.35); transform: translateY(-2px) scale(1.02); }

.btn-ghost {
  background: var(--glass); backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border); color: var(--text);
  padding: 16px 40px; border-radius: var(--radius-sm);
  font-size: 16px; font-weight: 400; cursor: pointer; font-family: 'Heebo', sans-serif;
  transition: all 0.35s;
}
.btn-ghost:hover { background: var(--glass-hover); border-color: rgba(255,255,255,0.15); }

.hero-stats {
  display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;
  margin-top: 64px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.06);
}
.hero-stat { text-align: center; }
.hero-stat-n {
  font-family: 'Frank Ruhl Libre', serif; font-size: 40px; font-weight: 700;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-stat-l { font-size: 13px; color: var(--text2); margin-top: 4px; letter-spacing: 0.03em; }

/* ─── SECTIONS ─── */
.sec { padding: 120px 24px; max-width: 1200px; margin: 0 auto; position: relative; }
.sec-head { text-align: center; margin-bottom: 64px; }
.sec-head h2 {
  font-family: 'Frank Ruhl Libre', serif; font-size: clamp(30px, 5vw, 48px);
  font-weight: 700; letter-spacing: -1px; margin-bottom: 12px;
}
.sec-head p { font-size: 16px; color: var(--text2); max-width: 480px; margin: 0 auto; line-height: 1.7; font-weight: 300; }
.sec-line {
  width: 40px; height: 2px; margin: 0 auto 20px; border-radius: 1px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
}

/* ─── ABOUT ─── */
.about-card { padding: 56px; max-width: 1000px; margin: 0 auto; }
.about-grid { display: grid; grid-template-columns: 280px 1fr; gap: 48px; align-items: center; }
.about-img {
  width: 100%; aspect-ratio: 3/4; border-radius: 16px;
  background: linear-gradient(160deg, rgba(255,138,101,0.2) 0%, rgba(116,185,255,0.15) 50%, rgba(85,239,196,0.15) 100%);
  display: flex; align-items: center; justify-content: center; font-size: 100px;
  border: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden;
}
.about-img::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(8,9,14,0.4));
}
.about-txt h3 {
  font-family: 'Frank Ruhl Libre', serif; font-size: 30px; font-weight: 700; margin-bottom: 16px;
}
.about-txt p { font-size: 15px; line-height: 1.85; color: var(--text2); margin-bottom: 14px; font-weight: 300; }
.about-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.about-tag {
  background: var(--surface); border: 1px solid var(--glass-border);
  padding: 6px 14px; border-radius: 8px; font-size: 12px; color: var(--text2);
  font-weight: 400; letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr; }
  .about-card { padding: 32px 24px; }
  .about-img { max-height: 240px; }
}

/* ─── SUBJECTS ─── */
.subj-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.subj-card { padding: 32px; cursor: default; }
.subj-icon {
  width: 48px; height: 48px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800; color: white; margin-bottom: 20px;
}
.subj-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
.subj-card p { font-size: 14px; color: var(--text2); line-height: 1.7; font-weight: 300; }

/* ─── TESTIMONIALS ─── */
.testi-wrap {
  max-width: 900px; margin: 0 auto; padding: 64px 48px; text-align: center;
  position: relative;
}
.testi-wrap::before {
  content: '״'; position: absolute; top: 8px; right: 32px;
  font-family: 'Frank Ruhl Libre', serif; font-size: 160px;
  background: linear-gradient(135deg, var(--accent), transparent);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  opacity: 0.15; line-height: 1;
}
.testi-text {
  font-size: clamp(18px, 2.5vw, 22px); line-height: 1.8; font-weight: 300;
  margin-bottom: 28px; min-height: 100px;
}
.testi-author { font-weight: 600; font-size: 16px; }
.testi-badge {
  display: inline-block; margin-top: 8px; font-size: 12px; color: var(--accent);
  background: var(--accent-glow); padding: 4px 12px; border-radius: 6px;
}
.testi-dots { display: flex; gap: 6px; justify-content: center; margin-top: 40px; }
.testi-dot {
  width: 6px; height: 6px; border-radius: 50%; border: none; padding: 0;
  background: rgba(255,255,255,0.15); cursor: pointer; transition: all 0.4s;
}
.testi-dot.on { background: var(--accent); width: 24px; border-radius: 3px; }

@media (max-width: 768px) {
  .testi-wrap { padding: 40px 24px; }
}

/* ─── PRICING ─── */
.price-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; align-items: stretch; }
.price-card { padding: 40px 32px; text-align: center; position: relative; }
.price-card.pop {
  border-color: rgba(255,138,101,0.2);
  background: linear-gradient(180deg, rgba(255,138,101,0.06) 0%, var(--glass) 100%);
  box-shadow: 0 8px 48px -12px rgba(255,138,101,0.12);
}
.price-badge {
  position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #08090E; padding: 4px 16px; border-radius: 8px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em;
}
.price-card h3 { font-size: 18px; font-weight: 500; margin-bottom: 20px; color: var(--text2); }
.price-num {
  font-family: 'Frank Ruhl Libre', serif; font-size: 56px; font-weight: 900;
  background: linear-gradient(135deg, var(--text), var(--text2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  line-height: 1;
}
.price-card.pop .price-num {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.price-unit { display: block; font-size: 13px; color: var(--text2); margin: 4px 0 28px; }
.price-feats { list-style: none; text-align: right; margin-bottom: 32px; }
.price-feats li {
  padding: 10px 0; font-size: 14px; color: var(--text2); font-weight: 300;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  display: flex; align-items: center; gap: 10px;
}
.price-feats li::before {
  content: '✓'; font-weight: 700; font-size: 12px;
  color: var(--accent); flex-shrink: 0;
}
.price-btn {
  width: 100%; padding: 14px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Heebo', sans-serif;
  transition: all 0.3s; border: 1px solid var(--glass-border);
  background: var(--surface); color: var(--text);
}
.price-btn:hover { background: var(--glass-hover); border-color: rgba(255,255,255,0.12); }
.price-card.pop .price-btn {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #08090E; border: none;
}
.price-card.pop .price-btn:hover { box-shadow: 0 4px 24px rgba(255,138,101,0.3); }

/* ─── CONTACT ─── */
.contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; align-items: start; }
.contact-info { padding: 48px; }
.contact-info h3 {
  font-family: 'Frank Ruhl Libre', serif; font-size: 28px; font-weight: 700; margin-bottom: 12px;
}
.contact-info > p { color: var(--text2); line-height: 1.7; font-weight: 300; margin-bottom: 36px; font-size: 15px; }
.c-item {
  display: flex; align-items: center; gap: 14px; padding: 14px 0;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.c-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--accent-glow); display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.c-item-title { font-size: 13px; color: var(--text2); margin-bottom: 2px; }
.c-item-val { font-size: 15px; font-weight: 500; }
.c-item-val a { color: var(--text); text-decoration: none; }
.c-item-val a:hover { color: var(--accent); }

.contact-form { padding: 48px; }
.fg { margin-bottom: 20px; }
.fg label { display: block; font-size: 13px; font-weight: 400; color: var(--text2); margin-bottom: 6px; }
.fg input, .fg select, .fg textarea {
  width: 100%; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-sm); font-size: 15px; font-family: 'Heebo', sans-serif;
  background: rgba(255,255,255,0.03); color: var(--text);
  transition: all 0.3s; direction: rtl;
}
.fg input::placeholder, .fg textarea::placeholder { color: rgba(255,255,255,0.2); }
.fg input:focus, .fg select:focus, .fg textarea:focus {
  outline: none; border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow2);
  background: rgba(255,255,255,0.05);
}
.fg select { appearance: none; cursor: pointer; }
.fg select option { background: var(--bg2); color: var(--text); }
.fg textarea { resize: vertical; min-height: 100px; }
.form-ok {
  background: rgba(85,239,196,0.06); border: 1px solid rgba(85,239,196,0.2);
  padding: 20px; border-radius: var(--radius-sm); text-align: center;
  color: #55efc4; font-weight: 500;
}

@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; }
  .contact-info, .contact-form { padding: 32px 24px; }
  .hero-stats { gap: 20px; }
}

/* ─── FOOTER ─── */
.foot {
  border-top: 1px solid rgba(255,255,255,0.04); padding: 48px 24px 24px;
  margin-top: 80px;
}
.foot-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
}
.foot-logo {
  font-family: 'Frank Ruhl Libre', serif; font-size: 18px; font-weight: 700;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.foot-links { display: flex; gap: 24px; }
.foot-links a { color: var(--text2); text-decoration: none; font-size: 13px; cursor: pointer; transition: color 0.2s; }
.foot-links a:hover { color: var(--text); }
.foot-copy {
  max-width: 1200px; margin: 28px auto 0; padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.04);
  text-align: center; font-size: 12px; color: rgba(255,255,255,0.2);
}

/* ─── FAB ─── */
.wa-fab {
  position: fixed; bottom: 28px; left: 28px; z-index: 100;
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, #25D366, #128C7E); color: white;
  border: none; cursor: pointer; font-size: 26px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(37,211,102,0.25);
  transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
}
.wa-fab:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 8px 32px rgba(37,211,102,0.35); border-radius: 20px; }

@media (max-width: 768px) {
  .sec { padding: 80px 16px; }
  .wa-fab { bottom: 20px; left: 20px; width: 52px; height: 52px; border-radius: 14px; }
}
      `}</style>

      {/* NOISE OVERLAY */}
      <div className="noise" />

      {/* NAV */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => go("hero")}>{SITE.name}</div>
          <ul className="nav-links" style={{ listStyle: "none" }}>
            {[["about","עליי"],["subjects","מקצועות"],["testimonials","המלצות"],["pricing","מחירים"],["contact","צרו קשר"]].map(([id,l]) => (
              <li key={id}><a onClick={() => go(id)}>{l}</a></li>
            ))}
          </ul>
          <button className="nav-cta nav-cta-d" onClick={() => go("contact")}>שיעור ניסיון חינם</button>
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="תפריט">
            <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        {[["about","עליי"],["subjects","מקצועות"],["testimonials","המלצות"],["pricing","מחירים"],["contact","צרו קשר"]].map(([id,l]) => (
          <a key={id} onClick={() => go(id)}>{l}</a>
        ))}
        <button className="btn-glow" onClick={() => go("contact")} style={{ marginTop: 8 }}>שיעור ניסיון חינם</button>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-content">
          <Reveal><div className="hero-pill"><span className="hero-pill-dot" />שיעור ניסיון ראשון — חינם</div></Reveal>
          <Reveal delay={0.08}>
            <h1>הדרך שלך<br />ל<span className="glow">הצלחה</span> בלימודים</h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="hero-sub">שיעורים פרטיים במתמטיקה, פיזיקה ואנגלית. שיטת לימוד מותאמת אישית שמביאה תוצאות אמיתיות — אונליין או פרונטלי.</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hero-btns">
              <button className="btn-glow" onClick={() => go("contact")}>לתיאום שיעור ניסיון</button>
              <button className="btn-ghost" onClick={() => go("about")}>קצת עליי</button>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="hero-stats">
              {[["200+","תלמידים מרוצים"],["8","שנות ניסיון"],["96%","הצלחה בבגרויות"],["4.9","דירוג ממוצע"]].map(([n,l]) => (
                <div className="hero-stat" key={l}>
                  <div className="hero-stat-n">{n}</div>
                  <div className="hero-stat-l">{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section className="sec" id="about">
        <Reveal>
          <GlassCard className="about-card">
            <div className="about-grid">
              <div className="about-img"><span style={{ fontSize: 80, zIndex: 1 }}>👩‍🏫</span></div>
              <div className="about-txt">
                <h3>היי, אני נועה</h3>
                <p>בוגרת תואר ראשון במתמטיקה ופיזיקה מהטכניון, עם 8 שנות ניסיון בהוראה פרטית. אני מאמינה שכל תלמיד יכול להצליח — צריך רק למצוא את הדרך שמתאימה לו.</p>
                <p>השיטה שלי מבוססת על הבנה עמוקה, בניית ביטחון עצמי ותרגול ממוקד. לא שינון — הבנה.</p>
                <div className="about-tags">
                  {["בוגרת הטכניון","8 שנות ניסיון","אונליין + פרונטלי","חומרים מותאמים","גמישות מלאה"].map(t => (
                    <span className="about-tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </section>

      {/* SUBJECTS */}
      <section className="sec" id="subjects">
        <div className="sec-head"><div className="sec-line" /><h2>מקצועות הלימוד</h2><p>התמחות בהכנה לבגרויות ולפסיכומטרי בגישה אישית</p></div>
        <div className="subj-grid">
          {SUBJECTS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <GlassCard className="subj-card" glow>
                <div className="subj-icon" style={{ background: s.gradient }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec" id="testimonials">
        <div className="sec-head"><div className="sec-line" /><h2>מה התלמידים אומרים</h2></div>
        <Reveal>
          <GlassCard className="testi-wrap">
            <div key={activeTesti}>
              <p className="testi-text">&ldquo;{TESTIMONIALS[activeTesti].text}&rdquo;</p>
              <div className="testi-author">{TESTIMONIALS[activeTesti].name}</div>
              <div className="testi-badge">{TESTIMONIALS[activeTesti].badge}</div>
            </div>
            <div className="testi-dots">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className={`testi-dot ${i === activeTesti ? "on" : ""}`} onClick={() => setActiveTesti(i)} />
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </section>

      {/* PRICING */}
      <section className="sec" id="pricing">
        <div className="sec-head"><div className="sec-line" /><h2>מחירון</h2><p>מחירים שקופים, בלי הפתעות. ביטול בכל עת.</p></div>
        <div className="price-grid">
          {PRICING.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <GlassCard className={`price-card ${p.pop ? "pop" : ""}`} glow={!p.pop}>
                {p.pop && <div className="price-badge">הכי פופולרי</div>}
                <h3>{p.title}</h3>
                <div className="price-num">{p.price}₪</div>
                <span className="price-unit">{p.unit}</span>
                <ul className="price-feats">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                <button className="price-btn" onClick={() => go("contact")}>לתיאום שיעור</button>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="sec" id="contact">
        <div className="sec-head"><div className="sec-line" /><h2>בואו נתחיל</h2><p>השאירו פרטים ואחזור אליכם תוך שעות ספורות</p></div>
        <Reveal>
          <div className="contact-grid">
            <GlassCard className="contact-info">
              <h3>דברו איתי</h3>
              <p>אשמח לענות על כל שאלה. אפשר להתקשר, לשלוח ווטסאפ, או למלא את הטופס.</p>
              <div className="c-item">
                <div className="c-icon">📱</div>
                <div><div className="c-item-title">טלפון / ווטסאפ</div><div className="c-item-val"><a href={`tel:${SITE.phoneFull}`}>{SITE.phone}</a></div></div>
              </div>
              <div className="c-item">
                <div className="c-icon">✉️</div>
                <div><div className="c-item-title">אימייל</div><div className="c-item-val"><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div></div>
              </div>
              <div className="c-item">
                <div className="c-icon">📸</div>
                <div><div className="c-item-title">אינסטגרם</div><div className="c-item-val">{SITE.ig}</div></div>
              </div>
            </GlassCard>

            <GlassCard className="contact-form">
              {formSent ? (
                <div className="form-ok">ההודעה נשלחה בהצלחה! אחזור אליכם בהקדם</div>
              ) : (
                <>
                  <div className="fg"><label>שם מלא</label><input type="text" placeholder="השם שלכם" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div className="fg"><label>טלפון</label><input type="tel" placeholder="050-0000000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                  <div className="fg"><label>מקצוע</label>
                    <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                      <option value="">בחרו מקצוע</option>
                      <option value="math">מתמטיקה</option>
                      <option value="physics">פיזיקה</option>
                      <option value="english">אנגלית</option>
                      <option value="psycho">פסיכומטרי</option>
                      <option value="other">אחר</option>
                    </select>
                  </div>
                  <div className="fg"><label>הודעה</label><textarea placeholder="ספרו קצת על מה אתם צריכים עזרה..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} /></div>
                  <button className="btn-glow" style={{ width: "100%" }} onClick={submit}>שלחו הודעה</button>
                </>
              )}
            </GlassCard>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-inner">
          <div className="foot-logo">{SITE.name}</div>
          <div className="foot-links">
            {[["about","עליי"],["subjects","מקצועות"],["pricing","מחירים"],["contact","צרו קשר"]].map(([id,l]) => (
              <a key={id} onClick={() => go(id)}>{l}</a>
            ))}
          </div>
        </div>
        <div className="foot-copy">כל הזכויות שמורות {SITE.name} &copy; {new Date().getFullYear()}</div>
      </footer>

      {/* WHATSAPP FAB */}
      <button className="wa-fab" onClick={() => window.open(`https://wa.me/${SITE.phoneFull}?text=שלום, אשמח לקבל פרטים נוספים`, "_blank")} aria-label="ווטסאפ">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </button>
    </div>
  );
}
