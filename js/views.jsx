/* RustQuest main views: Dashboard, QuestMap, Achievements, PlaygroundPage. */

function nextLesson(prog, RQ) {
  for (const m of RQ.modules) for (const l of m.lessons)
    if (!l.locked && !prog.isDone(l.id)) return { m, l };
  return null;
}

/* ---------------------------------------------------------- DASHBOARD */
function Dashboard() {
  const { nav } = useRoute();
  const prog = useProgress();
  const RQ = window.RUSTQUEST;
  const lvl = prog.level;
  const cont = nextLesson(prog, RQ);

  const stats = [
    { ic: "flame", n: prog.state.streak, lbl: "Day streak" },
    { ic: "lessons", n: `${prog.doneCount}/${prog.totalCount}`, lbl: "Lessons done" },
    { ic: "compass", n: Math.round(prog.completion * 100) + "%", lbl: "Journey complete" },
    { ic: "trophy", n: prog.state.badges.length, lbl: "Badges earned" },
  ];

  return (
    <div className="page">
      <div className="rise">
        <div className="h-eyebrow">Your forge</div>
        <h1 className="h1" style={{ marginTop: 8 }}>
          Welcome back, <span style={{ color: "var(--rust-bright)" }}>{lvl.name}</span>.
        </h1>
      </div>

      {/* hero level card */}
      <div className="hero-card rise" style={{ marginTop: 26, animationDelay: ".05s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div className="mono faint" style={{ fontSize: 12, letterSpacing: ".1em" }}>LEVEL {lvl.idx + 1} OF 8</div>
            <div className="h2" style={{ fontSize: 30, marginTop: 4 }}>{lvl.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 13, color: "var(--amber)" }}>{prog.state.xp} XP</div>
            <div className="mono faint" style={{ fontSize: 12 }}>
              {lvl.next ? `${lvl.toNext} XP to ${lvl.next.name}` : "Max level reached"}
            </div>
          </div>
        </div>
        <div className="hero-xp" style={{ marginTop: 18 }}><i style={{ width: (lvl.pct * 100) + "%" }} /></div>
      </div>

      {/* continue */}
      {cont && (
        <div className="card card-hover rise" style={{ marginTop: 24, display: "flex", alignItems: "center",
          gap: 22, animationDelay: ".1s", borderColor: "rgba(255,122,69,.25)" }}
          onClick={() => nav({ view: "lesson", moduleId: cont.m.id, lessonId: cont.l.id })}>
          <div className="hex cur" style={{ background: cont.m.color, flex: "0 0 60px" }}>
            <Icon name={cont.m.icon} size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono faint" style={{ fontSize: 11, letterSpacing: ".12em" }}>
              {prog.doneCount === 0 ? "START HERE" : "CONTINUE"} · REALM {cont.m.n} · {cont.m.title.toUpperCase()}
            </div>
            <div className="h3" style={{ marginTop: 5 }}>{cont.l.title}</div>
            <div className="dim" style={{ fontSize: 14, marginTop: 3 }}>{cont.l.tag}</div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ flex: "0 0 auto" }}>
            <Icon name="play" size={16} /> {prog.doneCount === 0 ? "Begin" : "Resume"}
          </button>
        </div>
      )}

      {/* stats */}
      <div className="stat-grid rise" style={{ marginTop: 24, animationDelay: ".15s" }}>
        {stats.map((s, i) => (
          <div className="stat-box" key={i}>
            <div className="ic"><Icon name={s.ic} size={18} /></div>
            <div className="n">{s.n}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* realms */}
      <div className="rise" style={{ marginTop: 40, animationDelay: ".2s" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 className="h2">The {NUM_WORDS[RQ.modules.length] || RQ.modules.length} realms</h2>
          <button className="btn btn-ghost" onClick={() => nav("map")}><Icon name="map" size={15} /> Quest Map</button>
        </div>
        <div className="realm-grid" style={{ marginTop: 18 }}>
          {RQ.modules.map((m) => {
            const avail = m.lessons.filter((l) => !l.locked);
            const locked = avail.length === 0;
            const done = avail.filter((l) => prog.isDone(l.id)).length;
            const pct = avail.length ? done / avail.length : 0;
            return (
              <div key={m.id} className={"card " + (locked ? "" : "card-hover")}
                onClick={() => !locked && nav({ view: "lesson", moduleId: m.id, lessonId: m.lessons[0].id })}
                style={{ display: "flex", gap: 16, alignItems: "center", opacity: locked ? 0.6 : 1, cursor: locked ? "default" : "pointer" }}>
                <div className={"hex" + (locked ? " locked" : "")} style={{ background: locked ? undefined : m.color, flex: "0 0 60px" }}>
                  <Icon name={locked ? "lock" : m.icon} size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono faint" style={{ fontSize: 11 }}>REALM {m.n}</div>
                  <div className="h3" style={{ fontSize: 17, marginTop: 2 }}>{m.title}</div>
                  <div className="dim" style={{ fontSize: 12.5, marginTop: 4 }}>
                    {locked ? "Coming soon" : `${done}/${avail.length} lessons · ${Math.round(pct * 100)}%`}
                  </div>
                </div>
                {!locked && <Ring size={42} stroke={4.5} pct={pct} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- QUEST MAP */
const NUM_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve"];
const capWord = (n) => {
  const w = NUM_WORDS[n] || String(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

function QuestMap() {
  const { nav } = useRoute();
  const prog = useProgress();
  const RQ = window.RUSTQUEST;
  const cont = nextLesson(prog, RQ);
  const realmCount = RQ.modules.length;
  const lessonCount = RQ.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="page">
      <div className="rise">
        <div className="h-eyebrow">The path from zero to hero</div>
        <h1 className="h1" style={{ marginTop: 8 }}>Quest Map</h1>
        <p className="lede" style={{ marginTop: 12 }}>
          {capWord(realmCount)} realms, {lessonCount} lessons. Master ownership and the borrow
          checker, then climb all the way to fearless concurrency. Your progress is forged into the path.
        </p>
      </div>

      <div className="quest" style={{ marginTop: 40 }}>
        {RQ.modules.map((m, mi) => {
          const avail = m.lessons.filter((l) => !l.locked);
          const locked = avail.length === 0;
          const done = avail.filter((l) => prog.isDone(l.id)).length;
          const allDone = avail.length > 0 && done === avail.length;
          const isCur = cont && cont.m.id === m.id;
          return (
            <div className="quest-stop rise" key={m.id} style={{ animationDelay: Math.min(mi * 0.07, 0.4) + "s" }}>
              <div className={"quest-rail" + (allDone ? " filled" : "")}>
                <div className={"hex" + (locked ? " locked" : "") + (isCur ? " cur" : "")}
                  style={{ background: locked ? undefined : m.color }}>
                  <Icon name={allDone ? "check" : locked ? "lock" : m.icon} size={26} stroke={2.4} />
                </div>
              </div>
              <div className={"quest-card" + (locked ? " locked" : "")}>
                <div className="qc-head">
                  <div>
                    <div className="mono faint" style={{ fontSize: 11, letterSpacing: ".14em" }}>REALM {m.n}</div>
                    <div className="h2" style={{ fontSize: 23, marginTop: 3 }}>{m.title}</div>
                  </div>
                  {!locked && (
                    <span className="pill" style={{ color: allDone ? "var(--ok)" : "var(--ink-dim)" }}>
                      {done}/{avail.length}
                    </span>
                  )}
                  {locked && <span className="pill"><Icon name="lock" size={12} /> Soon</span>}
                </div>
                <p className="dim" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{m.subtitle}</p>
                <div className="lesson-chips">
                  {m.lessons.map((l, li) => {
                    const d = prog.isDone(l.id);
                    return (
                      <button key={l.id} disabled={l.locked} className={"lchip" + (d ? " done" : "")}
                        onClick={() => !l.locked && nav({ view: "lesson", moduleId: m.id, lessonId: l.id })}>
                        <span className="lchip-num">
                          {d ? <Icon name="checkSmall" size={13} /> : l.locked ? <Icon name="lock" size={11} /> : li + 1}
                        </span>
                        <span style={{ flex: 1 }}>
                          <span className="lchip-title">{l.title}</span>
                          <span className="lchip-tag" style={{ display: "block" }}>{l.tag}</span>
                        </span>
                        {!l.locked && <span className="pill pill-xp" style={{ flex: "0 0 auto" }}>{l.xp}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- ACHIEVEMENTS */
function Achievements() {
  const prog = useProgress();
  const RQ = window.RUSTQUEST;
  const earned = new Set(prog.state.badges);

  return (
    <div className="page">
      <div className="rise">
        <div className="h-eyebrow">Trophies & milestones</div>
        <h1 className="h1" style={{ marginTop: 8 }}>Achievements</h1>
      </div>

      <h2 className="h2 rise" style={{ marginTop: 34, animationDelay: ".05s" }}>
        Badges <span className="faint mono" style={{ fontSize: 15 }}>{earned.size}/{RQ.badges.length}</span>
      </h2>
      <div className="badge-grid rise" style={{ marginTop: 18, animationDelay: ".08s" }}>
        {RQ.badges.map((b) => {
          const has = earned.has(b.id);
          return (
            <div key={b.id} className={"badge " + (has ? "earned" : "locked")}>
              <div className="badge-ic"><Icon name={has ? b.icon : "lock"} size={28} /></div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
            </div>
          );
        })}
      </div>

      <h2 className="h2 rise" style={{ marginTop: 46, animationDelay: ".12s" }}>The climb to Hero</h2>
      <div className="card rise" style={{ marginTop: 18, animationDelay: ".15s", padding: 12 }}>
        <div className="ladder">
          {RQ.levels.slice().reverse().map((L, ri) => {
            const i = RQ.levels.length - 1 - ri;
            const cur = prog.level.idx === i;
            const passed = prog.level.idx > i;
            return (
              <div key={L.name} className={"rung " + (cur ? "cur" : passed ? "passed" : "locked")}>
                <span className="rung-dot" />
                <span className="rung-name">{L.name}</span>
                <span className="mono faint" style={{ fontSize: 12 }}>{L.min} XP</span>
                {cur && <span className="pill pill-xp">You are here</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 26, textAlign: "center" }}>
        <button className="btn btn-ghost" onClick={() => { if (confirm("Reset all RustQuest progress?")) prog.reset(); }}>
          <Icon name="refresh" size={15} /> Reset progress
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- PLAYGROUND PAGE */
const SANDBOX_SAMPLES = [
  { name: "Hello", code: 'fn main() {\n    println!("Hello from the forge!");\n}', out: "Hello from the forge!" },
  { name: "Ownership", code: 'fn main() {\n    let s1 = String::from("rust");\n    let s2 = s1.clone();\n    println!("{s1} + {s2}");\n}', out: "rust + rust" },
  { name: "Iterators", code: 'fn main() {\n    let nums = [1, 2, 3, 4, 5];\n    let sum: i32 = nums.iter().sum();\n    let sq: Vec<i32> = nums.iter().map(|n| n * n).collect();\n    println!("sum = {sum}");\n    println!("squares = {sq:?}");\n}', out: "sum = 15\nsquares = [1, 4, 9, 16, 25]" },
  { name: "Pattern match", code: 'fn describe(n: i32) -> &\'static str {\n    match n {\n        0 => "zero",\n        1..=9 => "small",\n        _ => "big",\n    }\n}\n\nfn main() {\n    for n in [0, 5, 42] {\n        println!("{n} is {}", describe(n));\n    }\n}', out: "0 is zero\n5 is small\n42 is big" },
];

function PlaygroundPage() {
  const [sel, setSel] = useState(0);
  const prog = useProgress();
  const sample = SANDBOX_SAMPLES[sel];

  return (
    <div className="page">
      <div className="rise">
        <div className="h-eyebrow">Free sandbox</div>
        <h1 className="h1" style={{ marginTop: 8 }}>Playground</h1>
        <p className="lede" style={{ marginTop: 12 }}>
          Tinker with Rust freely. Pick a sample or write your own, then hit Run to watch the
          (simulated) compiler do its thing.
        </p>
      </div>

      <div className="rise" style={{ display: "flex", gap: 9, marginTop: 24, flexWrap: "wrap", animationDelay: ".05s" }}>
        {SANDBOX_SAMPLES.map((s, i) => (
          <button key={i} className={"btn " + (i === sel ? "btn-primary" : "btn-ghost")}
            style={{ padding: "9px 16px", fontSize: 13.5 }} onClick={() => setSel(i)}>
            {s.name}
          </button>
        ))}
      </div>

      <div className="rise" style={{ marginTop: 18, animationDelay: ".1s" }}>
        <Playground key={sel}
          block={{ prompt: "Edit and run — this sandbox always compiles.", code: sample.code, output: sample.out, need: [] }}
          onFirstRun={prog.recordRun} />
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, QuestMap, Achievements, PlaygroundPage });
