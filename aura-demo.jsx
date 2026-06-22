import { useState, useEffect, useMemo } from "react";
import { Sparkles, UtensilsCrossed, Clock, Flame, ChevronDown, ShieldCheck, Leaf } from "lucide-react";

/* ------------------------------------------------------------------ *
 * AURA — Vibe Matcher (demo)
 * Pick a mood + flavors -> terpene-driven match -> strains + a munchie.
 * Education only. No sales. 21+. The scoring engine below is real:
 * each strain's effect vector is derived from its terpene profile,
 * then ranked against the desired mood by cosine similarity.
 * ------------------------------------------------------------------ */

const C = {
  bg: "#17120F",
  surface: "#1F1813",
  surface2: "#271E17",
  line: "#3A2E25",
  text: "#F2E9DE",
  muted: "#A89B8C",
  gold: "#D9A441",
  goldSoft: "#3a2f1c",
};

// flavor family -> color (terpenes carry both aroma and effect)
const FLAVOR = {
  citrus: "#E8B04B",
  pine: "#6BA463",
  earthy: "#B07A4E",
  sweet: "#E0896B",
  berry: "#A878C8",
  diesel: "#8C9AA4",
  floral: "#C58BB8",
  herbal: "#6FB6A0",
};

const EFFECTS = ["relax", "sleep", "focus", "energy", "creative", "social", "relief"];
const EFFECT_LABEL = {
  relax: "Relaxed", sleep: "Sleepy", focus: "Focused", energy: "Energized",
  creative: "Creative", social: "Social", relief: "Relief",
};

// terpene -> { flavor family, effect contributions (can be negative) }
const TERPENES = {
  myrcene:      { name: "Myrcene", flavor: "earthy", e: { relax: 0.9, sleep: 0.8, relief: 0.5, focus: -0.3, energy: -0.4 } },
  limonene:     { name: "Limonene", flavor: "citrus", e: { social: 0.6, creative: 0.5, relief: 0.4, energy: 0.5, relax: 0.2, sleep: -0.3 } },
  pinene:       { name: "Pinene", flavor: "pine", e: { focus: 0.8, energy: 0.5, creative: 0.3, sleep: -0.4 } },
  caryophyllene:{ name: "Caryophyllene", flavor: "diesel", e: { relief: 0.8, relax: 0.5, sleep: 0.3 } },
  linalool:     { name: "Linalool", flavor: "floral", e: { relax: 0.7, sleep: 0.7, relief: 0.5, energy: -0.3 } },
  terpinolene:  { name: "Terpinolene", flavor: "herbal", e: { creative: 0.7, energy: 0.6, social: 0.4, focus: 0.3 } },
  humulene:     { name: "Humulene", flavor: "earthy", e: { relief: 0.5, relax: 0.4 } },
  ocimene:      { name: "Ocimene", flavor: "sweet", e: { energy: 0.5, creative: 0.4, social: 0.3 } },
};

// raw strain data — terpene proportions sum ~1
const RAW = [
  { slug: "gdp", name: "Granddaddy Purple", type: "indica", thc: [17, 23], cbd: [0, 1], terps: { myrcene: 0.5, linalool: 0.3, caryophyllene: 0.2 }, note: "A heavy, dreamy evening fade." },
  { slug: "northern-lights", name: "Northern Lights", type: "indica", thc: [16, 21], cbd: [0, 1], terps: { myrcene: 0.55, caryophyllene: 0.25, pinene: 0.2 }, note: "Couch-leaning calm, classic nightcap." },
  { slug: "lavender", name: "Lavender Kush", type: "indica", thc: [15, 19], cbd: [0, 1], terps: { linalool: 0.45, myrcene: 0.3, caryophyllene: 0.25 }, note: "Soft floral wind-down." },
  { slug: "blue-dream", name: "Blue Dream", type: "hybrid", thc: [17, 24], cbd: [0, 2], terps: { myrcene: 0.35, pinene: 0.3, limonene: 0.2, caryophyllene: 0.15 }, note: "Balanced, gently buoyant." },
  { slug: "gsc", name: "Girl Scout Cookies", type: "hybrid", thc: [19, 25], cbd: [0, 1], terps: { caryophyllene: 0.35, limonene: 0.3, humulene: 0.2, linalool: 0.15 }, note: "Warm body ease with a lift." },
  { slug: "og-kush", name: "OG Kush", type: "hybrid", thc: [19, 26], cbd: [0, 1], terps: { caryophyllene: 0.35, myrcene: 0.35, limonene: 0.3 }, note: "Mellow, grounding, a touch heady." },
  { slug: "pineapple-express", name: "Pineapple Express", type: "hybrid", thc: [17, 24], cbd: [0, 1], terps: { ocimene: 0.3, limonene: 0.3, caryophyllene: 0.2, pinene: 0.2 }, note: "Bright, chatty, good company." },
  { slug: "sour-diesel", name: "Sour Diesel", type: "sativa", thc: [19, 25], cbd: [0, 1], terps: { limonene: 0.35, caryophyllene: 0.3, myrcene: 0.2, pinene: 0.15 }, note: "Fast, talkative, get-things-done." },
  { slug: "green-crack", name: "Green Crack", type: "sativa", thc: [17, 24], cbd: [0, 1], terps: { limonene: 0.4, ocimene: 0.25, pinene: 0.2, caryophyllene: 0.15 }, note: "Daytime spark and drive." },
  { slug: "jack-herer", name: "Jack Herer", type: "sativa", thc: [18, 23], cbd: [0, 1], terps: { terpinolene: 0.35, pinene: 0.3, caryophyllene: 0.2, limonene: 0.15 }, note: "Clear, inventive, lightly energizing." },
  { slug: "harlequin", name: "Harlequin", type: "hybrid", thc: [7, 10], cbd: [8, 12], terps: { myrcene: 0.4, pinene: 0.3, caryophyllene: 0.3 }, note: "Gentle relief, clear head. Beginner-friendly." },
  { slug: "acdc", name: "ACDC", type: "hybrid", thc: [1, 6], cbd: [12, 20], terps: { myrcene: 0.45, pinene: 0.3, caryophyllene: 0.25 }, note: "Very low THC, calm and functional." },
];

// derive effect vector from terpene profile + flavor tags
function buildStrain(s) {
  const v = Object.fromEntries(EFFECTS.map((e) => [e, 0]));
  const flavorSet = new Set();
  for (const [id, prop] of Object.entries(s.terps)) {
    const t = TERPENES[id];
    if (prop >= 0.2) flavorSet.add(t.flavor);
    for (const e of EFFECTS) v[e] += prop * (t.e[e] || 0);
  }
  const topTerps = Object.entries(s.terps).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  return { ...s, vec: v, flavors: [...flavorSet], topTerps };
}
const STRAINS = RAW.map(buildStrain);

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const e of EFFECTS) { const x = a[e] || 0, y = b[e] || 0; dot += x * y; na += x * x; nb += y * y; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

function rankStrains(effects, flavors, experience) {
  if (effects.length === 0) return [];
  const desired = Object.fromEntries(EFFECTS.map((e) => [e, effects.includes(e) ? 1 : 0]));
  const cap = experience === "new" ? 18 : experience === "some" ? 24 : 99;
  return STRAINS
    .filter((s) => s.thc[0] <= cap)
    .map((s) => {
      const eScore = Math.max(0, cosine(desired, s.vec));
      const overlap = s.flavors.filter((f) => flavors.includes(f)).length;
      const fScore = flavors.length ? overlap / flavors.length : 0;
      const score = 0.72 * eScore + 0.28 * fScore;
      return { s, score, pct: Math.round(score * 100) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// recipe pairing
const CRAVING_FOR = { relax: "sweet", sleep: "sweet", relief: "savory", focus: "crunchy", energy: "crunchy", creative: "fruity", social: "salty" };

const RECIPES = [
  { id: "pb", title: "3-Ingredient PB Cookies", min: 15, diff: "easy", crave: ["sweet"], ing: ["1 cup peanut butter", "1 cup sugar", "1 egg"], steps: ["Heat oven to 180°C / 350°F.", "Mix everything into a dough.", "Roll balls, press with a fork.", "Bake 10 min. Cool — they firm up."] },
  { id: "nacho", title: "Loaded Nacho Pile", min: 10, diff: "easy", crave: ["salty", "savory", "crunchy"], ing: ["Tortilla chips", "Shredded cheese", "Salsa", "Jalapeños"], steps: ["Spread chips on a tray.", "Blanket with cheese.", "Broil 3–4 min until bubbling.", "Drown in salsa and jalapeños."] },
  { id: "toast", title: "Cinnamon Sugar Toast", min: 5, diff: "easy", crave: ["sweet", "crunchy"], ing: ["2 slices bread", "Butter", "Sugar + cinnamon"], steps: ["Toast the bread.", "Butter while hot.", "Shower with cinnamon sugar.", "Eat immediately, standing up."] },
  { id: "brownie", title: "Microwave Mug Brownie", min: 4, diff: "easy", crave: ["sweet"], ing: ["4 tbsp flour", "4 tbsp sugar", "2 tbsp cocoa", "3 tbsp milk", "2 tbsp oil"], steps: ["Stir everything in a mug.", "Microwave 60–90 sec.", "Stop when the top sets.", "Spoon. No plate needed."] },
  { id: "ques", title: "Everything Quesadilla", min: 8, diff: "easy", crave: ["salty", "savory"], ing: ["Tortilla", "Cheese", "Whatever's in the fridge"], steps: ["Cheese on half a tortilla.", "Add leftovers, fold.", "Pan-fry both sides till crisp.", "Cut into triangles."] },
  { id: "grape", title: "Frozen Chocolate Grapes", min: 5, diff: "easy", crave: ["fruity", "sweet"], ing: ["Grapes", "Melted chocolate"], steps: ["Dunk grapes in chocolate.", "Lay on parchment.", "Freeze 30 min.", "Cold, snappy, addictive."] },
  { id: "ramen", title: "Garlic Butter Ramen Upgrade", min: 7, diff: "easy", crave: ["savory", "salty"], ing: ["Instant ramen", "Butter", "Garlic", "An egg"], steps: ["Cook ramen, save a splash of water.", "Melt butter with garlic.", "Toss noodles in it.", "Top with a soft egg."] },
  { id: "chips", title: "Crispy Cheese Chips", min: 6, diff: "easy", crave: ["crunchy", "salty"], ing: ["Hard cheese", "Black pepper"], steps: ["Small cheese mounds on parchment.", "Bake 200°C / 400°F, 5–6 min.", "Cool until crisp.", "Pepper and devour."] },
];

function pairRecipe(strain, idx) {
  const dom = EFFECTS.filter((e) => strain.vec[e] > 0).sort((a, b) => strain.vec[b] - strain.vec[a])[0] || "relax";
  const crave = CRAVING_FOR[dom];
  const matches = RECIPES.filter((r) => r.crave.includes(crave));
  const pool = matches.length ? matches : RECIPES;
  return pool[idx % pool.length];
}

function reasonFor(strain, effects) {
  const t1 = TERPENES[strain.topTerps[0]].name;
  const t2 = strain.topTerps[1] ? TERPENES[strain.topTerps[1]].name : null;
  const matched = effects
    .filter((e) => strain.vec[e] > 0)
    .sort((a, b) => strain.vec[b] - strain.vec[a])
    .slice(0, 2)
    .map((e) => EFFECT_LABEL[e].toLowerCase());
  const terps = t2 ? `${t1} and ${t2}` : t1;
  const leans = matched.length ? matched.join(" & ") : "a balanced feel";
  return `Rich in ${terps} — leans ${leans}.`;
}

/* --------------------------- UI bits --------------------------- */

function Ring({ pct }) {
  const r = 30, circ = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(pct), 60); return () => clearTimeout(t); }, [pct]);
  const off = circ * (1 - shown / 100);
  return (
    <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
      <svg width="76" height="76" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke={C.line} strokeWidth="5" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={C.gold} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span style={{ fontFamily: "var(--display)", fontSize: 20, color: C.gold, lineHeight: 1 }}>{shown}<span style={{ fontSize: 11 }}>%</span></span>
      </div>
    </div>
  );
}

function TerpeneBar({ strain }) {
  const entries = Object.entries(strain.terps).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, p]) => a + p, 0);
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", background: C.surface2 }}>
        {entries.map(([id, p]) => (
          <div key={id} title={`${TERPENES[id].name} ${Math.round((p / total) * 100)}%`}
            style={{ width: `${(p / total) * 100}%`, background: FLAVOR[TERPENES[id].flavor] }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
        {entries.map(([id]) => (
          <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: FLAVOR[TERPENES[id].flavor] }} />
            {TERPENES[id].name}
          </span>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, color, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{
        padding: "9px 15px", borderRadius: 99, cursor: "pointer", fontSize: 14, fontWeight: 500,
        border: `1px solid ${active ? (color || C.gold) : C.line}`,
        background: active ? (color ? `${color}22` : C.goldSoft) : "transparent",
        color: active ? (color || C.gold) : C.text,
        transition: "all 160ms ease",
      }}>
      {children}
    </button>
  );
}

function RecipeCard({ r }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, background: C.surface, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: 18 }}>{r.title}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12, color: C.muted }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={13} /> {r.min} min</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Flame size={13} /> {r.diff}</span>
            <span>{r.ing.length} ingredients</span>
          </div>
        </div>
        <ChevronDown size={18} color={C.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", display: "grid", gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {r.ing.map((i) => <span key={i} style={{ fontSize: 12, color: C.muted, background: C.surface2, padding: "5px 10px", borderRadius: 8 }}>{i}</span>)}
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7 }}>
            {r.steps.map((s, i) => <li key={i} style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{s}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

/* --------------------------- App --------------------------- */

export default function App() {
  const [ageOk, setAgeOk] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [tab, setTab] = useState("match");
  const [effects, setEffects] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [experience, setExperience] = useState("some");
  const [results, setResults] = useState(null);
  const [craveFilter, setCraveFilter] = useState("all");

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const ranked = useMemo(() => (results ? rankStrains(results.effects, results.flavors, results.experience) : []), [results]);

  const cravings = ["all", "sweet", "salty", "crunchy", "savory", "fruity"];
  const shownRecipes = craveFilter === "all" ? RECIPES : RECIPES.filter((r) => r.crave.includes(craveFilter));

  const styleTag = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
    :root { --display: 'Fraunces', Georgia, serif; --body: 'Inter', system-ui, sans-serif; }
    * { box-sizing: border-box; }
    .aura-fade { animation: aura-rise 520ms cubic-bezier(.2,.8,.2,1) both; }
    @keyframes aura-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .aura-card { transition: transform 200ms ease, border-color 200ms ease; }
    .aura-card:hover { transform: translateY(-3px); border-color: ${C.gold}66; }
    @media (prefers-reduced-motion: reduce) { .aura-fade { animation: none; } .aura-card:hover { transform: none; } }
  `;

  return (
    <div style={{ fontFamily: "var(--body)", background: C.bg, color: C.text, minHeight: "100vh", position: "relative" }}>
      <style>{styleTag}</style>
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: `radial-gradient(closest-side, ${C.gold}1f, transparent)`, pointerEvents: "none", zIndex: 0 }} />

      {/* Age gate */}
      {!ageOk && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#0e0a08f2", display: "grid", placeItems: "center", padding: 24, backdropFilter: "blur(6px)" }}>
          <div style={{ maxWidth: 380, textAlign: "center", border: `1px solid ${C.line}`, borderRadius: 20, padding: 32, background: C.surface }}>
            <Leaf size={28} color={C.gold} />
            <div style={{ fontFamily: "var(--display)", fontSize: 30, letterSpacing: 4, marginTop: 12 }}>AURA</div>
            {!declined ? (
              <>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginTop: 14 }}>
                  Education and pairing only — no sales. You must be of legal age in your region to continue.
                </p>
                <button onClick={() => setAgeOk(true)}
                  style={{ marginTop: 20, width: "100%", padding: "13px", borderRadius: 12, border: "none", background: C.gold, color: "#1a1208", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                  I'm 21 or older
                </button>
                <button onClick={() => setDeclined(true)}
                  style={{ marginTop: 10, width: "100%", padding: "11px", borderRadius: 12, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, fontSize: 14, cursor: "pointer" }}>
                  I'm under 21
                </button>
              </>
            ) : (
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginTop: 16 }}>
                AURA is for adults only. Come back when you're of legal age.
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "0 20px 80px" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0 10px" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 24, letterSpacing: 4 }}>AURA</div>
          <span style={{ fontSize: 11, color: C.muted, border: `1px solid ${C.line}`, padding: "4px 9px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ShieldCheck size={12} /> 21+ · education only
          </span>
        </header>

        {/* Hero */}
        <div style={{ padding: "26px 0 8px" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.gold }}>Vibe Matcher</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: "clamp(32px, 6vw, 52px)", lineHeight: 1.05, margin: "10px 0 0", maxWidth: 620 }}>
            Tell us the feeling. We'll find the flavor.
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, marginTop: 14, maxWidth: 520 }}>
            Pick a mood and a taste. AURA reads the terpene profile behind each strain and pairs it with an easy snack for after.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, margin: "26px 0 22px", borderBottom: `1px solid ${C.line}` }}>
          {[["match", "Match", Sparkles], ["munchies", "Munchies", UtensilsCrossed]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 4px", marginRight: 18, background: "none", border: "none", borderBottom: `2px solid ${tab === id ? C.gold : "transparent"}`, color: tab === id ? C.text : C.muted, fontSize: 15, fontWeight: 500, cursor: "pointer", marginBottom: -1 }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* MATCH TAB */}
        {tab === "match" && (
          <div>
            <section style={{ display: "grid", gap: 24 }}>
              <div>
                <label style={{ fontSize: 13, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>How do you want to feel?</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}>
                  {EFFECTS.map((e) => <Chip key={e} active={effects.includes(e)} onClick={() => toggle(effects, setEffects, e)}>{EFFECT_LABEL[e]}</Chip>)}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Flavors you like <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}>
                  {Object.keys(FLAVOR).map((f) => (
                    <Chip key={f} active={flavors.includes(f)} color={FLAVOR[f]} onClick={() => toggle(flavors, setFlavors, f)}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Your experience</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}>
                  {[["new", "New to it"], ["some", "Some"], ["pro", "Experienced"]].map(([id, label]) => (
                    <Chip key={id} active={experience === id} onClick={() => setExperience(id)}>{label}</Chip>
                  ))}
                </div>
              </div>
              <button
                disabled={effects.length === 0}
                onClick={() => setResults({ effects, flavors, experience })}
                style={{ justifySelf: "start", padding: "13px 26px", borderRadius: 12, border: "none", cursor: effects.length ? "pointer" : "not-allowed", background: effects.length ? C.gold : C.surface2, color: effects.length ? "#1a1208" : C.muted, fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={16} /> Find my match
              </button>
            </section>

            {/* Results */}
            {results && (
              <section style={{ marginTop: 40 }}>
                {ranked.length === 0 ? (
                  <p style={{ color: C.muted }}>Pick at least one feeling to get a match.</p>
                ) : (
                  <>
                    {results.experience === "new" && (
                      <div style={{ fontSize: 13, color: C.gold, background: C.goldSoft, border: `1px solid ${C.gold}44`, padding: "10px 14px", borderRadius: 10, marginBottom: 20 }}>
                        New to this? Start with a small amount and wait — you can always take more later.
                      </div>
                    )}
                    <div style={{ display: "grid", gap: 16 }}>
                      {ranked.map(({ s, pct }, idx) => {
                        const recipe = pairRecipe(s, idx);
                        return (
                          <div key={s.slug} className="aura-card aura-fade" style={{ border: `1px solid ${C.line}`, borderRadius: 18, background: C.surface, padding: 20, animationDelay: `${idx * 70}ms` }}>
                            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                              <Ring pct={pct} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                  <h3 style={{ fontFamily: "var(--display)", fontSize: 22, margin: 0 }}>{s.name}</h3>
                                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: C.muted, border: `1px solid ${C.line}`, padding: "3px 8px", borderRadius: 99 }}>{s.type}</span>
                                </div>
                                <p style={{ color: C.muted, fontSize: 14, margin: "7px 0 0", lineHeight: 1.5 }}>{reasonFor(s, results.effects)} {s.note}</p>
                                <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 13, color: C.text }}>
                                  <span>THC <b style={{ color: C.gold }}>{s.thc[0]}–{s.thc[1]}%</b></span>
                                  <span>CBD <b style={{ color: C.gold }}>{s.cbd[0]}–{s.cbd[1]}%</b></span>
                                </div>
                                <div style={{ marginTop: 16 }}><TerpeneBar strain={s} /></div>
                              </div>
                            </div>
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10 }}>
                              <UtensilsCrossed size={16} color={C.gold} />
                              <span style={{ fontSize: 14, color: C.muted }}>Pairs with</span>
                              <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{recipe.title}</span>
                              <span style={{ fontSize: 12, color: C.muted }}>· {recipe.min} min</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            )}
          </div>
        )}

        {/* MUNCHIES TAB */}
        {tab === "munchies" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}>
              {cravings.map((c) => <Chip key={c} active={craveFilter === c} onClick={() => setCraveFilter(c)}>{c[0].toUpperCase() + c.slice(1)}</Chip>)}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {shownRecipes.map((r) => <RecipeCard key={r.id} r={r} />)}
            </div>
          </div>
        )}

        {/* Footer / disclaimer */}
        <footer style={{ marginTop: 56, paddingTop: 22, borderTop: `1px solid ${C.line}`, color: C.muted, fontSize: 12, lineHeight: 1.7 }}>
          AURA is for adults of legal age. It offers education and pairing suggestions only — no sales, no delivery, and nothing here is medical advice. Effects vary by person, product, and dose. Know and follow your local laws.
        </footer>
      </div>
    </div>
  );
}
