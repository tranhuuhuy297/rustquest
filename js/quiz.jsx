/* RustQuest quiz block. Multi-question, scored, with explanations.
   Calls onComplete(perfect:boolean) once all answered. Depends on Icon. */
function Quiz({ items, onComplete }) {
  const [answers, setAnswers] = useState(() => items.map(() => null));
  const firedRef = useRef(false);

  const choose = (qi, oi) => {
    if (answers[qi] != null) return;
    const next = answers.slice();
    next[qi] = oi;
    setAnswers(next);
  };

  const done = answers.every((a) => a != null);
  const score = answers.reduce((s, a, i) => s + (a === items[i].a ? 1 : 0), 0);

  useEffect(() => {
    if (done && !firedRef.current) {
      firedRef.current = true;
      onComplete && onComplete(score === items.length);
    }
  }, [done]);

  const letters = ["A", "B", "C", "D", "E"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {items.map((it, qi) => {
        const picked = answers[qi];
        const answered = picked != null;
        return (
          <div key={qi}>
            <div className="quiz-q">
              <span className="faint mono" style={{ fontSize: 13, marginRight: 8 }}>
                {String(qi + 1).padStart(2, "0")}
              </span>
              {it.q}
            </div>
            <div className="quiz-opts">
              {it.opts.map((opt, oi) => {
                let cls = "quiz-opt";
                if (answered) {
                  if (oi === it.a) cls += " correct";
                  else if (oi === picked) cls += " wrong";
                }
                return (
                  <button key={oi} className={cls} disabled={answered} onClick={() => choose(qi, oi)}>
                    <span className="dot">
                      {answered && oi === it.a ? <Icon name="checkSmall" size={13} />
                        : answered && oi === picked ? <Icon name="x" size={12} />
                        : letters[oi]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="quiz-why">
                <b>{picked === it.a ? "Correct. " : "Not quite. "}</b>{it.why}
              </div>
            )}
          </div>
        );
      })}
      {done && (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14,
          borderColor: score === items.length ? "var(--ok-dim)" : "var(--line)" }}>
          <Ring size={48} stroke={5} pct={score / items.length}>
            <span style={{ fontSize: 12 }}>{score}/{items.length}</span>
          </Ring>
          <div>
            <div className="h3" style={{ fontSize: 17 }}>
              {score === items.length ? "Perfect score!" : "Quiz complete"}
            </div>
            <div className="dim" style={{ fontSize: 14 }}>
              {score === items.length
                ? "Flawless — you've earned the Sharp Mind badge."
                : `You got ${score} of ${items.length}. Review the explanations above.`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.Quiz = Quiz;
