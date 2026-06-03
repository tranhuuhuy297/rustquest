/* RustQuest playground + fill-in-the-blank. Depends on window.highlightRust, Icon. */

function CodeEditor({ value, onChange }) {
  const taRef = useRef(null);
  const preRef = useRef(null);
  const sync = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };
  const onKey = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const s = el.selectionStart, en = el.selectionEnd;
      const next = value.slice(0, s) + "    " + value.slice(en);
      onChange(next);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
    }
  };
  // keep textarea & highlight the same height
  const lines = value.split("\n").length;
  const minH = Math.max(lines * 22.3 + 32, 90);
  return (
    <div className="editor-host" style={{ minHeight: minH }}>
      <pre ref={preRef} className="code" aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: window.highlightRust(value) + "\n" }} />
      <textarea ref={taRef} value={value} spellCheck={false} wrap="off"
        onChange={(e) => onChange(e.target.value)} onScroll={sync} onKeyDown={onKey} />
    </div>
  );
}

function Playground({ block, onFirstRun }) {
  const [code, setCode] = useState(block.code);
  const [lines, setLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const timers = useRef([]);
  const firstRun = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const stream = (seq) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLines([]);
    let t = 0;
    seq.forEach((ln, i) => {
      t += ln.d || 220;
      timers.current.push(setTimeout(() => {
        setLines((prev) => [...prev, ln]);
        if (i === seq.length - 1) setRunning(false);
      }, t));
    });
  };

  const run = () => {
    setOpen(true);
    setRunning(true);
    if (!firstRun.current) { firstRun.current = true; onFirstRun && onFirstRun(); }

    const need = block.need || [];
    const missing = need.filter((n) => !code.includes(n));

    if (missing.length === 0) {
      const out = (block.output || "").split("\n").map((o) => ({ cls: "con-out", text: o }));
      stream([
        { cls: "con-dim", text: "$ cargo run", d: 100 },
        { cls: "con-dim", text: "   Compiling rustquest v0.1.0 (/playground)", d: 520 },
        { cls: "con-ok", text: "    Finished `dev` profile [unoptimized] in 0.38s", d: 640 },
        { cls: "con-dim", text: "     Running `target/debug/rustquest`", d: 300 },
        ...out.map((o, i) => ({ ...o, d: i === 0 ? 380 : 160 })),
      ]);
    } else {
      const tok = missing[0];
      stream([
        { cls: "con-dim", text: "$ cargo run", d: 100 },
        { cls: "con-dim", text: "   Compiling rustquest v0.1.0 (/playground)", d: 520 },
        { cls: "con-err", text: `error: this challenge expects your code to use \`${tok}\``, d: 560 },
        { cls: "con-dim", text: "  --> src/main.rs", d: 140 },
        { cls: "con-warn", text: `help: make sure \`${tok}\` appears in your solution, then run again`, d: 200 },
        { cls: "con-err", text: "error: could not compile `rustquest` (bin) due to 1 hint", d: 220 },
      ]);
    }
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setCode(block.code); setLines([]); setRunning(false);
  };

  return (
    <div className="play">
      {block.prompt && (
        <div className="play-prompt">
          <Icon name="terminal" size={16} />
          <span>{block.prompt}</span>
        </div>
      )}
      <CodeEditor value={code} onChange={setCode} />
      <div className="play-bar">
        <button className="btn btn-primary" onClick={run} disabled={running}>
          <Icon name={running ? "refresh" : "play"} size={15}
            style={running ? { animation: "spin 1s linear infinite" } : {}} />
          {running ? "Compiling…" : "Run"}
        </button>
        <button className="btn btn-ghost" onClick={reset}>
          <Icon name="refresh" size={15} /> Reset
        </button>
        <span className="play-hint">edit freely · Tab inserts spaces</span>
      </div>
      <div className={"console" + (open ? " open" : "")}>
        <div className="console-inner">
          {lines.map((l, i) => (
            <div key={i} className={"con-line " + l.cls}>{l.text}</div>
          ))}
          {running && <div className="con-line con-cursor con-dim"> </div>}
        </div>
      </div>
    </div>
  );
}

function FillBlank({ block }) {
  const [val, setVal] = useState("");
  const [state, setState] = useState(""); // "", ok, bad
  const [revealed, setRevealed] = useState(false);
  const check = (v) => {
    setVal(v);
    if (v.trim() === block.answer) { setState("ok"); }
    else if (state === "ok") setState("");
  };
  const submit = () => {
    if (val.trim() === block.answer) setState("ok");
    else { setState("bad"); setTimeout(() => setState(""), 400); }
  };
  return (
    <div className="fib">
      {block.prompt && (
        <div className="play-prompt">
          <Icon name="zap" size={16} />
          <span>{block.prompt}</span>
        </div>
      )}
      <div className="fib-code">
        <span className="tok-comment" style={{ opacity: 0 }}></span>
        <span dangerouslySetInnerHTML={{ __html: window.highlightRust(block.before) }} />
        <input
          className={"fib-input " + (state === "ok" ? "ok" : state === "bad" ? "bad" : "")}
          value={state === "ok" || revealed ? block.answer : val}
          onChange={(e) => check(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={state === "ok"}
          placeholder="?"
          style={{ width: Math.max(block.answer.length + 2, 4) + "ch" }}
        />
        <span dangerouslySetInnerHTML={{ __html: window.highlightRust(block.after) }} />
      </div>
      <div className="play-bar">
        {state === "ok" ? (
          <span className="btn btn-ghost" style={{ color: "var(--ok)", borderColor: "var(--ok-dim)" }}>
            <Icon name="check" size={15} /> Correct!
          </span>
        ) : (
          <button className="btn btn-primary" onClick={submit}><Icon name="checkSmall" size={15} /> Check</button>
        )}
        {state !== "ok" && (
          <button className="btn btn-ghost" onClick={() => setRevealed((r) => !r)}>
            <Icon name="lightbulb" size={15} /> {revealed ? "Hide" : "Hint"}
          </button>
        )}
        {revealed && state !== "ok" && <span className="play-hint">{block.hint}</span>}
      </div>
    </div>
  );
}

Object.assign(window, { Playground, FillBlank, CodeEditor });
