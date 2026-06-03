/* RustQuest progress store. Exposes ProgressProvider, useProgress, RouteProvider, useRoute. */

const RQ = window.RUSTQUEST;
const AVAILABLE = RQ.modules.flatMap((m) => m.lessons.filter((l) => !l.locked).map((l) => l.id));
// lesson ids per realm, keyed by module id — used for realm-completion badges
const REALM_LESSONS = Object.fromEntries(
  RQ.modules.map((m) => [m.id, m.lessons.filter((l) => !l.locked).map((l) => l.id)])
);
const realmDone = (s, modId) => {
  const ids = REALM_LESSONS[modId] || [];
  return ids.length > 0 && ids.every((id) => s.done.includes(id));
};
window.RQ_AVAILABLE = AVAILABLE;

const PROG_KEY = "rustquest:v3";
const ROUTE_KEY = "rustquest:route:v3";
const todayStr = () => new Date().toISOString().slice(0, 10);

function loadProg() {
  const base = { xp: 0, done: [], badges: [], streak: 1, lastDay: todayStr(), perfectQuiz: false, ranOnce: false };
  try {
    const s = JSON.parse(localStorage.getItem(PROG_KEY));
    if (!s) return base;
    // streak bookkeeping
    const last = s.lastDay || todayStr();
    const dayDiff = Math.round((Date.parse(todayStr()) - Date.parse(last)) / 86400000);
    let streak = s.streak || 1;
    if (dayDiff === 1) streak += 1;
    else if (dayDiff > 1) streak = 1;
    return { ...base, ...s, streak, lastDay: todayStr() };
  } catch { return base; }
}

function levelFor(xp) {
  const L = RQ.levels;
  let idx = 0;
  for (let i = 0; i < L.length; i++) if (xp >= L[i].min) idx = i;
  const cur = L[idx];
  const next = L[idx + 1] || null;
  const into = xp - cur.min;
  const span = next ? next.min - cur.min : 1;
  return { idx, name: cur.name, next, pct: next ? into / span : 1, toNext: next ? next.min - xp : 0 };
}

function badgesFor(s) {
  const completion = s.done.filter((d) => AVAILABLE.includes(d)).length / AVAILABLE.length;
  const earned = [];
  if (s.ranOnce) earned.push("first-blood");
  if (realmDone(s, "first-steps")) earned.push("module-1");
  if (realmDone(s, "ownership")) earned.push("borrow-checker");
  if (s.perfectQuiz) earned.push("quiz-ace");
  if (s.streak >= 3) earned.push("streak-3");
  if (realmDone(s, "closures-iterators")) earned.push("iterator-adept");
  if (realmDone(s, "macros-unsafe")) earned.push("unsafe-initiate");
  if (realmDone(s, "async-real-world")) earned.push("async-adept");
  if (completion >= 0.5) earned.push("halfway");
  if (completion >= 1) earned.push("hero");
  return earned;
}

const ProgressContext = React.createContext(null);

function ProgressProvider({ children }) {
  const [state, setState] = useState(loadProg);

  useEffect(() => { localStorage.setItem(PROG_KEY, JSON.stringify(state)); }, [state]);

  // apply a state patch, then recompute badges & toast newly earned
  const apply = useCallback((patch) => {
    setState((prev) => {
      const merged = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      const before = new Set(prev.badges);
      const nowBadges = badgesFor(merged);
      const fresh = nowBadges.filter((b) => !before.has(b));
      if (fresh.length) {
        setTimeout(() => {
          fresh.forEach((id) => {
            const b = RQ.badges.find((x) => x.id === id);
            if (b) window.toast("Badge unlocked — " + b.name, { icon: b.icon });
          });
          window.emberBurst(window.innerWidth / 2, window.innerHeight / 2);
        }, 400);
      }
      return { ...merged, badges: nowBadges };
    });
  }, []);

  const api = {
    state,
    isDone: (id) => state.done.includes(id),
    level: levelFor(state.xp),
    completion: state.done.filter((d) => AVAILABLE.includes(d)).length / AVAILABLE.length,
    doneCount: state.done.filter((d) => AVAILABLE.includes(d)).length,
    totalCount: AVAILABLE.length,
    completeLesson: (id, xp, perfect) => {
      apply((prev) => {
        if (prev.done.includes(id)) return perfect ? { ...prev, perfectQuiz: true } : prev;
        return { ...prev, done: [...prev.done, id], xp: prev.xp + xp, perfectQuiz: prev.perfectQuiz || !!perfect };
      });
    },
    recordPerfect: () => apply((prev) => ({ ...prev, perfectQuiz: true })),
    recordRun: () => apply((prev) => prev.ranOnce ? prev : { ...prev, ranOnce: true, xp: prev.xp + 20 }),
    reset: () => { localStorage.removeItem(PROG_KEY); setState(loadProg()); },
  };
  return React.createElement(ProgressContext.Provider, { value: api }, children);
}
const useProgress = () => React.useContext(ProgressContext);

/* ---- routing ---- */
const RouteContext = React.createContext(null);
function loadRoute() {
  try { return JSON.parse(localStorage.getItem(ROUTE_KEY)) || { view: "dashboard" }; }
  catch { return { view: "dashboard" }; }
}
function RouteProvider({ children }) {
  const [route, setRoute] = useState(loadRoute);
  const nav = useCallback((r) => {
    const next = typeof r === "string" ? { view: r } : r;
    localStorage.setItem(ROUTE_KEY, JSON.stringify(next));
    setRoute(next);
    const sc = document.querySelector(".scroll");
    if (sc) sc.scrollTop = 0;
  }, []);
  return React.createElement(RouteContext.Provider, { value: { route, nav } }, children);
}
const useRoute = () => React.useContext(RouteContext);

Object.assign(window, { ProgressProvider, useProgress, RouteProvider, useRoute, levelFor, RQ_DATA: RQ });
