import { useState, useEffect, useRef, useCallback } from "react";

const PHONE = "972501234567";
const WA = (msg) => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;

/* ─── Data ─── */
const services = [
  { name: "מניקור קלאסי", time: "45 דק׳", price: "120", desc: "טיפול מניקור מושלם עם לק רגיל באיכות גבוהה", icon: "✦" },
  { name: "ג׳ל על טבעית", time: "60 דק׳", price: "180", desc: "ציפוי ג׳ל עמיד ומבריק על הציפורן הטבעית", icon: "◆" },
  { name: "בנייה באקריל", time: "90 דק׳", price: "250", desc: "הארכה מקצועית באקריל עם עיצוב מותאם אישית", icon: "❖" },
  { name: "פדיקור ספא", time: "60 דק׳", price: "150", desc: "טיפול פדיקור מפנק כולל עיסוי ופילינג", icon: "✧" },
  { name: "נייל ארט", time: "30+ דק׳", price: "50+", desc: "עיצובים ייחודיים — ציורי יד, אבנים, פויל וסטיקרים", icon: "✶" },
  { name: "הסרה בטוחה", time: "30 דק׳", price: "60", desc: "הסרת ג׳ל או אקריל בעדינות מלאה ללא פגיעה", icon: "○" },
];

const reviews = [
  { name: "מיכל כ.", text: "הציפורניים מחזיקות שלושה שבועות! תמיד מקבלת מחמאות על העיצובים המיוחדים.", stars: 5 },
  { name: "שירה ל.", text: "הסטודיו מדהים, נקי ומטופח. האווירה מרגיעה והתוצאה מושלמת כל פעם.", stars: 5 },
  { name: "נועה ר.", text: "הנייל ארט הכי מיוחד שראיתי! יצירתיות ודיוק ברמה אחרת לגמרי.", stars: 5 },
  { name: "דנה ש.", text: "סוף סוף מצאתי מישהי שמבינה בדיוק מה אני רוצה. מקצוענית אמיתית!", stars: 5 },
];

const galleryColors = [
  ["#F4E4DC","#EBD5CB"], ["#E8D5D0","#DEC7C0"], ["#F0DDE4","#E6CFD8"],
  ["#DDE4E8","#CDD6DC"], ["#E8E0D0","#DDD4C2"], ["#E4D0D0","#D8C0C0"],
  ["#D5DDE0","#C5D0D5"], ["#E8DCD5","#DDCfC6"], ["#D8E0D5","#CBD5C8"],
];

/* ─── Hooks ─── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return [ref, v];
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useMouse() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return pos;
}

/* ─── Glass Card Component ─── */
function GlassCard({ children, style, hover = true, blur = 16, opacity = 0.45, border = 0.18, ...rest }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: `rgba(255,255,255,${hovered ? opacity + 0.08 : opacity})`,
        backdropFilter: `blur(${blur}px) saturate(1.8)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.8)`,
        border: `1px solid rgba(255,255,255,${hovered ? border + 0.15 : border})`,
        borderRadius: 24,
        boxShadow: hovered
          ? "0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)"
          : "0 4px 24px rgba(0,0,0,0.04), 0 1px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.4)",
        transition: "all 0.55s cubic-bezier(0.22,1,0.36,1)",
        transform: hovered ? "translateY(-4px) scale(1.005)" : "translateY(0) scale(1)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ─── Gradient Mesh Background ─── */
function MeshGradient({ colors, mouse, scroll }) {
  const offset = scroll * 0.02;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {/* Base warm gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(145deg, #FEF9F4 0%, #FDF5EE 25%, #FCF0E8 50%, #FEF7F2 75%, #FFFBF7 100%)",
      }} />
      {/* Animated blobs */}
      {(colors || [
        { c: "rgba(232,196,176,0.35)", x: 20, y: 15, s: 500 },
        { c: "rgba(210,175,195,0.25)", x: 75, y: 20, s: 400 },
        { c: "rgba(195,210,225,0.2)", x: 50, y: 70, s: 450 },
        { c: "rgba(225,200,170,0.3)", x: 85, y: 75, s: 380 },
        { c: "rgba(240,210,200,0.2)", x: 15, y: 80, s: 350 },
      ]).map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${b.x + (mouse.x - 0.5) * (8 + i * 3)}%`,
          top: `${b.y + (mouse.y - 0.5) * (8 + i * 3) - offset}%`,
          width: b.s, height: b.s,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
          filter: "blur(60px)",
          transition: "left 0.8s ease-out, top 0.8s ease-out",
          willChange: "left, top",
        }} />
      ))}
      {/* Noise texture */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35, pointerEvents: "none" }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.08"/>
      </svg>
    </div>
  );
}

/* ─── Navigation ─── */
function Nav({ active }) {
  const scrollY = useScrollY();
  const [open, setOpen] = useState(false);
  const scrolled = scrollY > 50;

  const links = [
    { id: "hero", l: "ראשי" }, { id: "services", l: "שירותים" }, { id: "gallery", l: "גלריה" },
    { id: "about", l: "עליי" }, { id: "reviews", l: "המלצות" }, { id: "contact", l: "יצירת קשר" },
  ];

  const go = (id) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "10px 0" : "18px 0",
        transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {/* Glass pill nav */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: scrolled ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.35)",
            backdropFilter: `blur(${scrolled ? 40 : 20}px) saturate(1.8)`,
            WebkitBackdropFilter: `blur(${scrolled ? 40 : 20}px) saturate(1.8)`,
            border: `1px solid rgba(255,255,255,${scrolled ? 0.5 : 0.3})`,
            borderRadius: 100, padding: "6px 8px",
            boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)" : "0 2px 20px rgba(0,0,0,0.03)",
            transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
          className="nav-pill">
            {/* Logo */}
            <button onClick={() => go("hero")} style={{
              background: "none", border: "none", cursor: "pointer", padding: "8px 16px",
              fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600,
              color: "#8B6F5E", letterSpacing: 1.5,
            }}>
              NAIL STUDIO
            </button>
            <div style={{ width: 1, height: 20, background: "rgba(139,111,94,0.12)", margin: "0 4px" }} className="nav-sep" />
            {links.map(l => (
              <button key={l.id} onClick={() => go(l.id)} style={{
                background: active === l.id ? "rgba(139,111,94,0.1)" : "transparent",
                border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: 100,
                fontFamily: "'Heebo', sans-serif", fontSize: 13, fontWeight: active === l.id ? 500 : 300,
                color: active === l.id ? "#8B6F5E" : "rgba(60,50,40,0.55)",
                transition: "all 0.35s",
                letterSpacing: 0.3,
              }}
              className="nav-link">
                {l.l}
              </button>
            ))}
          </div>

          {/* Mobile burger */}
          <button className="burger" onClick={() => setOpen(!open)} style={{
            position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.4)", borderRadius: 14, cursor: "pointer",
            width: 44, height: 44, display: "none", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: open ? 0 : 4, alignItems: "center" }}>
              <div style={{ width: 18, height: 1.5, background: "#8B6F5E", borderRadius: 2, transition: "all 0.3s",
                transform: open ? "rotate(45deg) translate(0px, 0px)" : "none" }} />
              <div style={{ width: 18, height: 1.5, background: "#8B6F5E", borderRadius: 2, transition: "all 0.3s",
                opacity: open ? 0 : 1 }} />
              <div style={{ width: 18, height: 1.5, background: "#8B6F5E", borderRadius: 2, transition: "all 0.3s",
                transform: open ? "rotate(-45deg) translate(0px, 0px)" : "none" }} />
            </div>
          </button>

          {/* Mobile logo */}
          <div className="mobile-logo" style={{
            display: "none", position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
            fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600,
            color: "#8B6F5E", letterSpacing: 1.5,
          }}>
            NAIL STUDIO
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 99,
        background: "rgba(254,249,244,0.85)",
        backdropFilter: "blur(50px) saturate(2)",
        WebkitBackdropFilter: "blur(50px) saturate(2)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {links.map((l, i) => (
          <button key={l.id} onClick={() => go(l.id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "16px 40px",
            fontFamily: "'Heebo', sans-serif", fontSize: 22, fontWeight: 300,
            color: active === l.id ? "#8B6F5E" : "rgba(60,50,40,0.55)",
            transform: open ? "translateY(0)" : "translateY(20px)",
            opacity: open ? 1 : 0,
            transition: `all 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s`,
            letterSpacing: 1,
          }}>
            {l.l}
          </button>
        ))}
      </div>
    </>
  );
}

/* ─── Hero ─── */
function Hero({ mouse }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setTimeout(() => setLoaded(true), 80)); }, []);

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <MeshGradient mouse={mouse} scroll={0} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 800, direction: "rtl" }}>
        {/* Stagger-revealed badge */}
        <div style={{
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: "all 1s cubic-bezier(0.22,1,0.36,1) 0.1s",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.5)", borderRadius: 100,
            padding: "8px 22px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C4A882" }} />
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: "#8B6F5E", fontWeight: 400, letterSpacing: 2 }}>
              BEAUTY & NAIL ART STUDIO
            </span>
          </div>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(44px, 9vw, 96px)",
          fontWeight: 300, color: "#3C3228", lineHeight: 1.05,
          margin: "28px 0 0",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(40px)",
          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1) 0.25s",
          letterSpacing: -1,
        }}>
          <span style={{ display: "block", fontWeight: 300 }}>ציפורניים</span>
          <span style={{
            display: "block", fontStyle: "italic", fontWeight: 500,
            background: "linear-gradient(135deg, #C4A882 0%, #A8876E 50%, #C4A882 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            ברמה אחרת
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: "'Heebo', sans-serif", fontSize: "clamp(15px, 2.2vw, 18px)",
          color: "rgba(60,50,40,0.5)", fontWeight: 300, lineHeight: 1.9,
          maxWidth: 440, margin: "24px auto 40px",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1) 0.45s",
        }}>
          מניקור, ג׳ל, אקריל ועיצובים ייחודיים — בסטודיו בוטיק עם חוויה מפנקת ותוצאה מושלמת
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1) 0.6s",
        }}>
          <a href={WA("היי, אשמח לקבוע תור")} target="_blank" rel="noopener noreferrer"
            className="cta-primary"
            style={{
              padding: "16px 38px", borderRadius: 100,
              background: "linear-gradient(135deg, #8B6F5E 0%, #A8876E 100%)",
              color: "#FFFBF7", fontFamily: "'Heebo', sans-serif", fontSize: 15, fontWeight: 400,
              textDecoration: "none", letterSpacing: 0.5,
              boxShadow: "0 4px 20px rgba(139,111,94,0.25), 0 1px 4px rgba(139,111,94,0.1)",
              transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}>
            קביעת תור
          </a>
          <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            className="cta-secondary"
            style={{
              padding: "16px 38px", borderRadius: 100,
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              color: "#8B6F5E", fontFamily: "'Heebo', sans-serif", fontSize: 15, fontWeight: 400,
              border: "1px solid rgba(139,111,94,0.15)",
              cursor: "pointer", letterSpacing: 0.5,
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}>
            לשירותים שלי
          </button>
        </div>

        {/* Trust strip */}
        <div style={{
          display: "flex", gap: 32, justifyContent: "center", marginTop: 56, flexWrap: "wrap",
          opacity: loaded ? 1 : 0,
          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1) 0.8s",
        }}>
          {[
            { v: "5.0 ★", l: "דירוג גוגל" },
            { v: "2,000+", l: "לקוחות מרוצות" },
            { v: "X+ שנים", l: "ניסיון מקצועי" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#8B6F5E", fontWeight: 600 }}>
                {s.v}
              </div>
              <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: 11, color: "rgba(60,50,40,0.35)", fontWeight: 300, marginTop: 2, letterSpacing: 0.5 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        opacity: loaded ? 0.4 : 0, transition: "all 1.5s 1.2s",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 24, height: 38, borderRadius: 12, border: "1.5px solid rgba(139,111,94,0.3)",
          display: "flex", justifyContent: "center", paddingTop: 8,
        }}>
          <div style={{
            width: 3, height: 8, borderRadius: 2, background: "#8B6F5E",
            animation: "scrollDot 2s ease-in-out infinite",
          }} />
        </div>
      </div>
    </section>
  );
}

/* ─── Services ─── */
function Services() {
  const [ref, vis] = useInView();
  return (
    <section id="services" ref={ref} style={{ padding: "100px 24px", position: "relative", direction: "rtl" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <SectionHeader vis={vis} tag="SERVICES" title="השירותים שלי" />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}
             className="services-grid">
          {services.map((s, i) => (
            <GlassCard key={i} style={{
              padding: "32px 28px",
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(30px)",
              transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#C4A882", marginLeft: 8 }}>
                    {s.icon}
                  </span>
                  <h3 style={{ fontFamily: "'Heebo', sans-serif", fontSize: 17, color: "#3C3228", fontWeight: 500, margin: 0, display: "inline" }}>
                    {s.name}
                  </h3>
                </div>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#8B6F5E", fontWeight: 500,
                  lineHeight: 1,
                }}>
                  ₪{s.price}
                </span>
              </div>
              <p style={{
                fontFamily: "'Heebo', sans-serif", fontSize: 14, color: "rgba(60,50,40,0.5)",
                lineHeight: 1.7, fontWeight: 300, margin: "0 0 16px",
              }}>
                {s.desc}
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(139,111,94,0.06)", borderRadius: 100, padding: "5px 14px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B6F5E" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: "#8B6F5E", fontWeight: 400 }}>
                  {s.time}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Gallery ─── */
function Gallery() {
  const [ref, vis] = useInView();
  return (
    <section id="gallery" ref={ref} style={{ padding: "100px 24px", position: "relative", direction: "rtl" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionHeader vis={vis} tag="GALLERY" title="העבודות שלי" />
        <p style={{
          textAlign: "center", fontFamily: "'Heebo', sans-serif", fontSize: 13,
          color: "rgba(60,50,40,0.35)", fontWeight: 300, marginTop: -40, marginBottom: 48,
          opacity: vis ? 1 : 0, transition: "all 0.6s 0.3s",
        }}>
          * החליפי עם תמונות אמיתיות של העבודות שלך
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="gal-grid">
          {galleryColors.map(([c1, c2], i) => (
            <GlassCard key={i} blur={12} opacity={0.35} style={{
              aspectRatio: i === 0 || i === 4 ? "1/1.25" : "1/1",
              gridRow: (i === 0 || i === 4) ? "span 2" : "span 1",
              padding: 0, overflow: "hidden", cursor: "pointer",
              opacity: vis ? 1 : 0, transform: vis ? "scale(1)" : "scale(0.92)",
              transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s`,
            }}>
              <div style={{
                width: "100%", height: "100%",
                background: `linear-gradient(145deg, ${c1}, ${c2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {/* Nail silhouette */}
                <div style={{
                  width: "42%", height: "58%",
                  borderRadius: "45% 45% 42% 42% / 22% 22% 55% 55%",
                  background: "rgba(255,255,255,0.35)",
                  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04), inset 0 2px 0 rgba(255,255,255,0.5)",
                }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "rgba(255,255,255,0.7)",
                    fontWeight: 300,
                  }}>
                    {i + 1}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About ─── */
function About() {
  const [ref, vis] = useInView();
  return (
    <section id="about" ref={ref} style={{ padding: "100px 24px", position: "relative", direction: "rtl" }}>
      <div style={{ maxWidth: 950, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 48, alignItems: "center" }} className="about-grid">
          {/* Photo placeholder */}
          <GlassCard hover={false} blur={20} opacity={0.3} style={{
            aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
            opacity: vis ? 1 : 0, transform: vis ? "translateX(0) rotate(0deg)" : "translateX(-40px) rotate(-2deg)",
            transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(139,111,94,0.08)", border: "1.5px solid rgba(139,111,94,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(139,111,94,0.4)" strokeWidth="1.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span style={{
              position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap",
              fontFamily: "'Heebo', sans-serif", fontSize: 12, color: "rgba(139,111,94,0.35)", fontWeight: 300,
            }}>
              הוסיפי תמונה שלך
            </span>
          </GlassCard>

          {/* Text */}
          <div style={{
            opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(40px)",
            transition: "all 1s cubic-bezier(0.22,1,0.36,1) 0.15s",
          }}>
            <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 11, color: "#C4A882", letterSpacing: 4, fontWeight: 400 }}>
              ABOUT
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 42px)",
              color: "#3C3228", fontWeight: 400, margin: "10px 0 24px", lineHeight: 1.2,
            }}>
              <span style={{ fontStyle: "italic" }}>קצת</span> עליי
            </h2>
            <p style={{
              fontFamily: "'Heebo', sans-serif", fontSize: 15, color: "rgba(60,50,40,0.55)",
              lineHeight: 2, fontWeight: 300, marginBottom: 16,
            }}>
              שמי <strong style={{ color: "#3C3228", fontWeight: 500 }}>[שם]</strong>, ואני מאמינה שציפורניים מטופחות הן לא רק עניין של יופי — הן ביטוי אישי, ביטחון עצמי, ורגע של פינוק שמגיע לכל אחת.
            </p>
            <p style={{
              fontFamily: "'Heebo', sans-serif", fontSize: 15, color: "rgba(60,50,40,0.55)",
              lineHeight: 2, fontWeight: 300, marginBottom: 32,
            }}>
              עם ניסיון של למעלה מ-X שנים, אני מתמחה בבניית ציפורניים, ג׳ל, ועיצובי נייל ארט ייחודיים. הסטודיו שלי הוא מקום שקט, נקי ואישי — כי החוויה חשובה לא פחות מהתוצאה.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { icon: "♡", text: "תשומת לב לכל פרט" },
                { icon: "✦", text: "חומרים באיכות פרימיום" },
                { icon: "◇", text: "סביבה סטרילית ונקייה" },
              ].map((f, i) => (
                <GlassCard key={i} blur={12} opacity={0.35} hover={false} style={{
                  padding: "12px 20px", borderRadius: 16,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ color: "#C4A882", fontSize: 14 }}>{f.icon}</span>
                  <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 13, color: "#8B6F5E", fontWeight: 400 }}>
                    {f.text}
                  </span>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Reviews ─── */
function Reviews() {
  const [ref, vis] = useInView();
  return (
    <section id="reviews" ref={ref} style={{ padding: "100px 24px", position: "relative", direction: "rtl" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <SectionHeader vis={vis} tag="REVIEWS" title="מה אומרות עליי" />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}
             className="reviews-grid">
          {reviews.map((r, i) => (
            <GlassCard key={i} style={{
              padding: 28,
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(25px)",
              transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
            }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {Array.from({ length: r.stars }).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#C4A882" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p style={{
                fontFamily: "'Heebo', sans-serif", fontSize: 14, color: "rgba(60,50,40,0.6)",
                lineHeight: 1.8, fontWeight: 300, marginBottom: 20,
              }}>
                "{r.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(196,168,130,0.2), rgba(196,168,130,0.1))",
                  border: "1px solid rgba(196,168,130,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#8B6F5E", fontWeight: 600,
                }}>
                  {r.name.charAt(0)}
                </div>
                <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 14, color: "#3C3228", fontWeight: 400 }}>
                  {r.name}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ─── */
function ContactSection() {
  const [ref, vis] = useInView();
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" ref={ref} style={{ padding: "100px 24px", position: "relative", direction: "rtl" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionHeader vis={vis} tag="CONTACT" title="בואי נקבע תור" />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 40,
          opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s 0.15s",
        }} className="contact-cards">
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B6F5E" strokeWidth="1.3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
              l: "050-123-4567", sub: "התקשרי", href: "tel:0501234567" },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#8B6F5E"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.616l4.54-1.47A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.31-.726-5.993-1.957l-.42-.312-2.694.872.895-2.65-.342-.443A9.953 9.953 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>,
              l: "וואטסאפ", sub: "הדרך הכי מהירה", href: WA("היי, אשמח לקבוע תור") },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B6F5E" strokeWidth="1.3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
              l: "[כתובת]", sub: "הסטודיו", href: "#" },
          ].map((c, i) => (
            <a key={i} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <GlassCard style={{ padding: 24, textAlign: "center" }}>
                <div style={{ marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: 15, color: "#3C3228", fontWeight: 500 }}>{c.l}</div>
                <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: "rgba(60,50,40,0.4)", fontWeight: 300, marginTop: 4 }}>{c.sub}</div>
              </GlassCard>
            </a>
          ))}
        </div>

        {/* Hours card */}
        <GlassCard hover={false} blur={20} opacity={0.4} style={{
          padding: 36, maxWidth: 400, margin: "0 auto",
          opacity: vis ? 1 : 0, transition: "all 0.7s 0.3s",
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#8B6F5E",
            fontWeight: 500, marginBottom: 20, textAlign: "center", fontStyle: "italic",
          }}>
            שעות פעילות
          </h3>
          {[
            { d: "ראשון — חמישי", h: "09:00 – 20:00" },
            { d: "שישי", h: "09:00 – 14:00" },
            { d: "שבת", h: "סגור" },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "10px 0",
              borderBottom: i < 2 ? "1px solid rgba(139,111,94,0.08)" : "none",
            }}>
              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 14, color: "rgba(60,50,40,0.5)", fontWeight: 300 }}>{row.d}</span>
              <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 14, color: "#3C3228", fontWeight: 500 }}>{row.h}</span>
            </div>
          ))}
        </GlassCard>
      </div>
    </section>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ vis, tag, title }) {
  return (
    <div style={{
      textAlign: "center", marginBottom: 56,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(25px)",
      transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: 11, color: "#C4A882", letterSpacing: 5, fontWeight: 400 }}>
        {tag}
      </span>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 50px)",
        color: "#3C3228", fontWeight: 400, marginTop: 10, lineHeight: 1.2,
      }}>
        {title}
      </h2>
      <div style={{
        width: 36, height: 1.5, borderRadius: 2,
        background: "linear-gradient(to right, transparent, #C4A882, transparent)",
        margin: "18px auto 0",
      }} />
    </div>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{
      padding: "48px 24px 32px", textAlign: "center", direction: "rtl",
      borderTop: "1px solid rgba(139,111,94,0.08)",
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#8B6F5E", letterSpacing: 2, fontWeight: 600, marginBottom: 20 }}>
        NAIL STUDIO
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 24 }}>
        {[
          { href: "#", d: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> },
          { href: "#", d: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 10.86 4.46V13a8.28 8.28 0 0 0 5.58 2.15v-3.44a4.85 4.85 0 0 1-3.59-1.43V6.69h3.59z"/></svg> },
          { href: "#", d: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
        ].map((s, i) => (
          <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
             className="social-link"
             style={{ color: "rgba(60,50,40,0.3)", transition: "color 0.3s, transform 0.3s", display: "flex" }}>
            {s.d}
          </a>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {["מדיניות פרטיות", "הצהרת נגישות", "תקנון"].map((l, i) => (
          <a key={i} href="#" style={{
            fontFamily: "'Heebo', sans-serif", fontSize: 12, color: "rgba(60,50,40,0.3)",
            textDecoration: "none", fontWeight: 300, transition: "color 0.3s",
          }}
          onMouseEnter={e => e.target.style.color = "#8B6F5E"}
          onMouseLeave={e => e.target.style.color = "rgba(60,50,40,0.3)"}>
            {l}
          </a>
        ))}
      </div>
      <div style={{ fontFamily: "'Heebo', sans-serif", fontSize: 11, color: "rgba(60,50,40,0.2)", fontWeight: 300 }}>
        &copy; {new Date().getFullYear()} Nail Studio — כל הזכויות שמורות
      </div>
    </footer>
  );
}

/* ─── WhatsApp Float ─── */
function WhatsApp() {
  const [show, setShow] = useState(false);
  const [pulse, setPulse] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 2000); }, []);
  useEffect(() => { const t = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 1200); }, 5000); return () => clearInterval(t); }, []);

  return (
    <a href={WA("היי, אשמח לקבוע תור")} target="_blank" rel="noopener noreferrer"
       aria-label="צ׳אט בוואטסאפ"
       style={{
         position: "fixed", bottom: 24, left: 24, zIndex: 999,
         width: 56, height: 56, borderRadius: "50%",
         background: "#25D366",
         display: "flex", alignItems: "center", justifyContent: "center",
         boxShadow: pulse
           ? "0 0 0 14px rgba(37,211,102,0.12), 0 4px 24px rgba(37,211,102,0.3)"
           : "0 4px 24px rgba(37,211,102,0.25)",
         transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
         opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.5)",
         cursor: "pointer",
       }}
       className="wa-float">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.616l4.54-1.47A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.31-.726-5.993-1.957l-.42-.312-2.694.872.895-2.65-.342-.443A9.953 9.953 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
      </svg>
    </a>
  );
}

/* ─── App ─── */
export default function NailStudioPremium() {
  const [active, setActive] = useState("hero");
  const mouse = useMouse();

  useEffect(() => {
    const ids = ["hero", "services", "gallery", "about", "reviews", "contact"];
    const o = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-40% 0px -40% 0px" }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) o.observe(el); });
    return () => o.disconnect();
  }, []);

  return (
    <div style={{ background: "#FEF9F4", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Heebo:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { overflow-x: hidden; }

        ::selection { background: rgba(196,168,130,0.25); color: #3C3228; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #FEF9F4; }
        ::-webkit-scrollbar-thumb { background: rgba(196,168,130,0.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(196,168,130,0.45); }

        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(10px); opacity: 1; }
        }

        .cta-primary:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 32px rgba(139,111,94,0.35), 0 2px 8px rgba(139,111,94,0.15) !important;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.7) !important;
          border-color: rgba(139,111,94,0.3) !important;
          transform: translateY(-2px);
        }

        .social-link:hover {
          color: #8B6F5E !important;
          transform: translateY(-2px);
        }
        .wa-float:hover {
          transform: scale(1.08) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-pill > .nav-link { display: none !important; }
          .nav-pill > .nav-sep { display: none !important; }
          .nav-pill > button:first-child { display: none !important; }
          .nav-pill { background: transparent !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; padding: 0 !important; }
          .burger { display: flex !important; }
          .mobile-logo { display: block !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .gal-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .gal-grid > div { grid-row: span 1 !important; }
          .contact-cards { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .burger { display: none !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>

      {/* Full-page mesh that reacts to mouse */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <MeshGradient mouse={mouse} scroll={0} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav active={active} />
        <Hero mouse={mouse} />
        <Services />
        <Gallery />
        <About />
        <Reviews />
        <ContactSection />
        <Footer />
      </div>
      <WhatsApp />
    </div>
  );
}
