/* RustQuest curriculum core — defines window.RUSTQUEST and the level/badge tables.
   Per-realm content lives in js/realms/realm-*.js, each of which appends one
   module to RUSTQUEST.modules (loaded in realm order after this file).

   Block types rendered by the lesson view:
     {t:'text', html}                          prose (inline <code> allowed)
     {t:'code', code, caption?}                 read-only annotated snippet
     {t:'callout', kind:'tip'|'warn'|'note', html}
     {t:'play', prompt, code, output, need?[]}  interactive playground
     {t:'fib', prompt, before, blank, after, answer, hint}  fill-in-the-blank
   Each lesson: {id,title,tag,min,xp,blocks,quiz,takeaways}
   quiz item: {q, opts[], a:index, why}

   For a `play` block: every token in `need[]` MUST already appear in the starter
   `code` (so the first Run succeeds), and `output` MUST be the exact stdout that
   code produces. For a `fib` block, `answer` is the single token that fills the gap.
*/
window.RUSTQUEST = {
  // thresholds span the full 12-realm curriculum (~8,980 total XP): a learner
  // climbs steadily and reaches Rust Hero during the final Async & Real-World realm.
  levels: [
    { name: "Initiate", min: 0 },
    { name: "Novice", min: 1100 },
    { name: "Apprentice", min: 2300 },
    { name: "Journeyer", min: 3500 },
    { name: "Crafter", min: 4800 },
    { name: "Artisan", min: 6000 },
    { name: "Expert", min: 7200 },
    { name: "Rust Hero", min: 8500 },
  ],
  badges: [
    { id: "first-blood", icon: "spark", name: "Hello, World", desc: "Run your very first Rust program." },
    { id: "module-1", icon: "flag", name: "First Steps", desc: "Complete the First Steps realm." },
    { id: "borrow-checker", icon: "shield", name: "Friend of the Borrow Checker", desc: "Survive the Ownership realm." },
    { id: "quiz-ace", icon: "target", name: "Sharp Mind", desc: "Ace a quiz with a perfect score." },
    { id: "streak-3", icon: "flame", name: "On Fire", desc: "Keep a 3-day learning streak." },
    { id: "iterator-adept", icon: "bolt", name: "Iterator Adept", desc: "Complete the Closures & Iterators realm." },
    { id: "unsafe-initiate", icon: "zap", name: "Into the Unsafe", desc: "Complete the Macros & Unsafe Rust realm." },
    { id: "async-adept", icon: "star", name: "Async Adept", desc: "Complete the Async & Real-World Rust realm." },
    { id: "halfway", icon: "mountain", name: "Halfway to Hero", desc: "Reach 50% total completion." },
    { id: "hero", icon: "crown", name: "Rustacean Hero", desc: "Complete every realm in RustQuest." },
  ],
  modules: [],
};
