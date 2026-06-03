/* RustQuest UI primitives. Depends on window.Icon, window.highlightRust.
   Hook bindings (useState, etc.) come from icons.jsx (shared global scope). */

/* progress ring (SVG) */
function Ring({ size = 40, stroke = 4, pct = 0, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <div style={{ position: "relative", width: size, height: size, flex: `0 0 ${size}px` }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="ring-fg" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      {children != null && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
          fontFamily: "var(--mono)", fontSize: size * 0.26, fontWeight: 600 }}>{children}</div>
      )}
    </div>
  );
}

/* shared svg gradient def for rings — mount once */
function GradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="molten-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF7A45" />
          <stop offset="1" stopColor="#C8451B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Pill({ icon, children, kind = "" }) {
  return (
    <span className={"pill " + (kind ? "pill-" + kind : "")}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* read-only highlighted code block */
function CodeBlock({ code, caption, file = "src/main.rs" }) {
  const html = window.highlightRust(code);
  return (
    <div>
      {caption && <div className="code-cap">{caption}</div>}
      <div className="code-wrap" style={{ marginTop: caption ? 6 : 0 }}>
        <div className="code-bar">
          <span className="code-dots"><i></i><i></i><i></i></span>
          <span className="code-file">{file}</span>
        </div>
        <pre className="code" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

function Callout({ kind = "note", html }) {
  const icon = kind === "tip" ? "lightbulb" : kind === "warn" ? "alert" : "info";
  return (
    <div className={"callout " + kind}>
      <Icon name={icon} size={19} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/* ----- toast + ember burst (global, via window events) ----- */
function ToastHost() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const onToast = (e) => {
      const id = Math.random();
      setToasts((t) => [...t, { id, ...e.detail }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };
    window.addEventListener("rq-toast", onToast);
    return () => window.removeEventListener("rq-toast", onToast);
  }, []);
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name={t.icon || "spark"} size={20} />
          <span>{t.text}{t.xp ? <> &nbsp;<b>+{t.xp} XP</b></> : null}</span>
        </div>
      ))}
    </div>
  );
}

function toast(text, opts = {}) {
  window.dispatchEvent(new CustomEvent("rq-toast", { detail: { text, ...opts } }));
}

/* ember confetti burst from a point */
function emberBurst(x, y) {
  const colors = ["#FF7A45", "#F6C66B", "#E8602C", "#F2A65A"];
  for (let i = 0; i < 28; i++) {
    const e = document.createElement("div");
    e.className = "ember";
    e.style.left = x + "px";
    e.style.top = y + "px";
    e.style.background = colors[i % colors.length];
    const sz = 4 + Math.random() * 7;
    e.style.width = e.style.height = sz + "px";
    document.body.appendChild(e);
    const ang = Math.random() * Math.PI * 2;
    const vel = 80 + Math.random() * 220;
    const dx = Math.cos(ang) * vel;
    const dy = Math.sin(ang) * vel - 120;
    e.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 240}px) scale(0)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)" }
    ).onfinish = () => e.remove();
  }
}

Object.assign(window, { Ring, GradientDefs, Pill, CodeBlock, Callout, ToastHost, toast, emberBurst });
