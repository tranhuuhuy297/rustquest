/* RustQuest app shell + mount. */

const NAV = [
  { view: "dashboard", icon: "dashboard", label: "Dashboard" },
  { view: "map", icon: "map", label: "Quest Map" },
  // { view: "playground", icon: "terminal", label: "Playground" }, // standalone Playground page hidden for now
  { view: "achievements", icon: "trophy", label: "Achievements" },
];

function Sidebar() {
  const { route, nav } = useRoute();
  const prog = useProgress();
  const lvl = prog.level;
  return (
    <aside className="sidebar">
      <div className="brand" style={{ cursor: "pointer" }} onClick={() => nav("dashboard")}>
        <BrandMark size={38} className="brand-mark" />
        <div>
          <div className="brand-name">Rust<b>Quest</b></div>
          <div className="brand-tag">zero → hero</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map((n) => (
          <button key={n.view} className={"nav-item" + (route.view === n.view ? " on" : "")}
            onClick={() => nav(n.view)}>
            <Icon name={n.icon} size={19} />
            {n.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="level-card">
          <div className="level-row">
            <Ring size={40} stroke={4.5} pct={lvl.pct}>
              <span style={{ fontSize: 11 }}>{lvl.idx + 1}</span>
            </Ring>
            <div style={{ minWidth: 0 }}>
              <div className="level-name">{lvl.name}</div>
              <div className="level-sub">{prog.state.xp} XP</div>
            </div>
          </div>
          <div className="xp-track"><div className="xp-fill" style={{ width: (lvl.pct * 100) + "%" }} /></div>
          <div className="xp-meta">
            <span>Lv {lvl.idx + 1}</span>
            <span>{lvl.next ? `${lvl.toNext} to go` : "MAX"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { route } = useRoute();
  const prog = useProgress();
  const RQ = window.RUSTQUEST;
  let crumb = <><b>RustQuest</b></>;
  if (route.view === "lesson") {
    const m = RQ.modules.find((x) => x.id === route.moduleId);
    const l = m && m.lessons.find((x) => x.id === route.lessonId);
    crumb = <>Realm {m ? m.n : "?"} <span style={{ opacity: .4, margin: "0 6px" }}>/</span> <b>{l ? l.title : ""}</b></>;
  } else {
    const map = { dashboard: "Dashboard", map: "Quest Map", playground: "Playground", achievements: "Achievements" };
    crumb = <b>{map[route.view] || "Dashboard"}</b>;
  }
  return (
    <header className="topbar">
      <span className="crumb">{crumb}</span>
      <span className="topbar-spacer" />
      <span className="stat-chip flame"><Icon name="flame" size={15} /> <b>{prog.state.streak}</b> day</span>
      <span className="stat-chip"><Icon name="spark" size={15} /> <b>{prog.state.xp}</b> XP</span>
      <span className="stat-chip"><Icon name="compass" size={15} /> <b>{Math.round(prog.completion * 100)}%</b></span>
    </header>
  );
}

function Router() {
  const { route } = useRoute();
  switch (route.view) {
    case "map": return <QuestMap />;
    // case "playground": return <PlaygroundPage />; // standalone Playground page hidden for now
    case "achievements": return <Achievements />;
    case "lesson": return <LessonView />;
    default: return <Dashboard />;
  }
}

function App() {
  return (
    <ProgressProvider>
      <RouteProvider>
        <GradientDefs />
        <ToastHost />
        <div className="shell">
          <Sidebar />
          <div className="main">
            <Topbar />
            <div className="scroll">
              <Router />
            </div>
          </div>
        </div>
      </RouteProvider>
    </ProgressProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
