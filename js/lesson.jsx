/* RustQuest lesson view. Depends on store, ui, playground, quiz, icons. */

function LessonBlock({ block, onFirstRun }) {
  switch (block.t) {
    case "text":
      return <div className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />;
    case "code":
      return (
        <div>
          <div className="block-label"><Icon name="book" size={14} /> Example</div>
          <div style={{ marginTop: 12 }}><CodeBlock code={block.code} caption={block.caption} /></div>
        </div>
      );
    case "callout":
      return <Callout kind={block.kind} html={block.html} />;
    case "play":
      return (
        <div>
          <div className="block-label"><Icon name="terminal" size={14} /> Try it yourself</div>
          <div style={{ marginTop: 12 }}><Playground block={block} onFirstRun={onFirstRun} /></div>
        </div>
      );
    case "fib":
      return (
        <div>
          <div className="block-label"><Icon name="zap" size={14} /> Fill the blank</div>
          <div style={{ marginTop: 12 }}><FillBlank block={block} /></div>
        </div>
      );
    default:
      return null;
  }
}

function LessonView() {
  const { route, nav } = useRoute();
  const prog = useProgress();
  const RQ = window.RUSTQUEST;

  const mod = RQ.modules.find((m) => m.id === route.moduleId) || RQ.modules[0];
  const lesson = mod.lessons.find((l) => l.id === route.lessonId) || mod.lessons[0];
  const [perfect, setPerfect] = useState(false);

  useEffect(() => { setPerfect(false); }, [lesson.id]);

  // flat list of available lessons (for prev/next)
  const flat = [];
  RQ.modules.forEach((m) => m.lessons.forEach((l) => { if (!l.locked) flat.push({ m, l }); }));
  const idx = flat.findIndex((x) => x.l.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  const goLesson = (m, l) => nav({ view: "lesson", moduleId: m.id, lessonId: l.id });
  const alreadyDone = prog.isDone(lesson.id);

  const complete = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    window.emberBurst(b.left + b.width / 2, b.top);
    if (!alreadyDone) {
      prog.completeLesson(lesson.id, lesson.xp, perfect);
      window.toast("Lesson complete", { icon: "check", xp: lesson.xp });
    } else if (perfect) {
      prog.recordPerfect();
    }
    setTimeout(() => {
      if (next) goLesson(next.m, next.l);
      else nav("achievements");
    }, 650);
  };

  if (lesson.locked) {
    return (
      <div className="page">
        <button className="btn btn-ghost" onClick={() => nav("map")} style={{ marginBottom: 28 }}>
          <Icon name="arrowLeft" size={15} /> Back to Quest Map
        </button>
        <div className="card rise" style={{ textAlign: "center", padding: "60px 30px" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 18px", borderRadius: 18, display: "grid",
            placeItems: "center", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
            <Icon name="lock" size={28} style={{ color: "var(--ink-faint)" }} />
          </div>
          <div className="h2">{lesson.title}</div>
          <p className="lede" style={{ margin: "10px auto 0" }}>
            This lesson lives in <strong style={{ color: "var(--ink)" }}>{mod.title}</strong> — a realm still being forged.
            Finish the unlocked realms to keep your momentum; new content drops here soon.
          </p>
        </div>
      </div>
    );
  }

  const lessonNo = mod.lessons.findIndex((l) => l.id === lesson.id) + 1;

  return (
    <div className="page page-wide" key={lesson.id}>
      {/* header */}
      <div className="rise" style={{ animationDelay: "0s" }}>
        <button className="nav-item" onClick={() => nav("map")}
          style={{ width: "auto", display: "inline-flex", padding: "6px 12px 6px 6px", marginBottom: 18, marginLeft: -6 }}>
          <Icon name="arrowLeft" size={16} />
          <span className="mono" style={{ fontSize: 12 }}>Realm {mod.n} · {mod.title}</span>
        </button>
        <h1 className="h1" style={{ maxWidth: "20ch" }}>{lesson.title}</h1>
        <p className="lede" style={{ marginTop: 12 }}>{lesson.tag}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <Pill icon="clock">{lesson.min} min</Pill>
          <Pill icon="spark" kind="xp">{lesson.xp} XP</Pill>
          {alreadyDone && <Pill icon="checkSmall" kind="done">Completed</Pill>}
        </div>
      </div>

      <div className="lesson-grid" style={{ marginTop: 36 }}>
        <div className="lesson-body">
          {lesson.blocks.map((b, i) => (
            <div className="rise" style={{ animationDelay: Math.min(i * 0.04, 0.3) + "s" }} key={i}>
              <LessonBlock block={b} onFirstRun={prog.recordRun} />
            </div>
          ))}

          {/* quiz */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="block-label"><Icon name="target" size={14} /> Check your understanding</div>
              <div style={{ marginTop: 16 }}>
                <Quiz items={lesson.quiz} onComplete={(p) => setPerfect(p)} />
              </div>
            </div>
          )}

          {/* takeaways */}
          {lesson.takeaways && lesson.takeaways.length > 0 && (
            <div className="takeaways" style={{ marginTop: 14 }}>
              <div className="block-label" style={{ marginTop: 0, marginBottom: 8 }}>
                <Icon name="star" size={14} /> Takeaways
              </div>
              <ul style={{ margin: 0, padding: 0 }}>
                {lesson.takeaways.map((t, i) => (
                  <li key={i}>
                    <Icon name="checkSmall" size={18} />
                    <span dangerouslySetInnerHTML={{ __html: t.replace(/`([^`]+)`/g, "<code>$1</code>") }} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* footer nav */}
          <div className="lesson-foot">
            {prev ? (
              <button className="btn btn-ghost" onClick={() => goLesson(prev.m, prev.l)}>
                <Icon name="arrowLeft" size={15} /> Previous
              </button>
            ) : <span />}
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary btn-lg" onClick={complete}>
              <Icon name={alreadyDone ? "arrowRight" : "check"} size={17} />
              {alreadyDone ? (next ? "Next lesson" : "Finish") : (next ? "Complete & continue" : "Complete lesson")}
            </button>
          </div>
        </div>

        {/* right rail */}
        <aside className="lesson-rail">
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Ring size={44} stroke={5}
                pct={mod.lessons.filter((l) => !l.locked && prog.isDone(l.id)).length /
                     Math.max(mod.lessons.filter((l) => !l.locked).length, 1)}>
                <span style={{ fontSize: 11 }}>{mod.n}</span>
              </Ring>
              <div>
                <div className="h3" style={{ fontSize: 16 }}>{mod.title}</div>
                <div className="faint mono" style={{ fontSize: 11 }}>
                  {mod.lessons.filter((l) => !l.locked && prog.isDone(l.id)).length}/{mod.lessons.filter((l) => !l.locked).length} done
                </div>
              </div>
            </div>
            <hr className="hr" style={{ marginBottom: 10 }} />
            <div className="rail-list">
              {mod.lessons.map((l, i) => {
                const done = prog.isDone(l.id);
                const on = l.id === lesson.id;
                return (
                  <button key={l.id} disabled={l.locked}
                    className={"rail-item" + (on ? " on" : "") + (done ? " done" : "") + (l.locked ? " locked" : "")}
                    onClick={() => !l.locked && goLesson(mod, l)}>
                    <span className="rail-num">
                      {done ? <Icon name="checkSmall" size={12} /> : l.locked ? <Icon name="lock" size={11} /> : i + 1}
                    </span>
                    <span style={{ flex: 1 }}>{l.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="faint mono" style={{ fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
            {alreadyDone ? "Revisit anytime — progress is saved." : `Complete to earn ${lesson.xp} XP`}
          </div>
        </aside>
      </div>
    </div>
  );
}

window.LessonView = LessonView;
