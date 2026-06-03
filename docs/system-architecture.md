# System Architecture

RustQuest is a client-only single-page app. There is no backend, no database,
and no build pipeline — React and Babel are loaded from a CDN and JSX is
transpiled in the browser at load time.

## Load order (`index.html`)

1. Fonts + `css/styles.css`.
2. CDN: React, ReactDOM, Babel standalone (pinned, with SRI hashes).
3. Plain JS data, in this order:
   - `js/highlight.js` → defines `window.highlightRust(src)`.
   - `js/curriculum-core.js` → defines `window.RUSTQUEST = { levels, badges, modules: [] }`.
   - `js/realms/realm-1..9-*.js` → each appends one module (order = realm order).
4. `type="text/babel"` components, in dependency order:
   `icons → ui → playground → quiz → store → views → lesson → app`.

`icons.jsx` is loaded first among the Babel scripts because it declares the
shared React hook bindings (`const { useState, ... } = React`) that every later
JSX file relies on — Babel scripts share one global scope, so these are declared
exactly once.

## Data flow

```
window.RUSTQUEST (static data)
        │
        ▼
ProgressProvider ──► useProgress()  (XP, done[], badges, streak; localStorage)
RouteProvider    ──► useRoute()     (current view; localStorage)
        │
        ▼
App shell (Sidebar + Topbar + Router)
        │
        ├─ Dashboard / QuestMap / Achievements / PlaygroundPage   (views.jsx)
        └─ LessonView (lesson.jsx)
              └─ LessonBlock → CodeBlock | Callout | Playground | FillBlank
              └─ Quiz (quiz.jsx)
```

- **State** lives in two React Contexts in `store.jsx`, each mirrored to
  `localStorage` (`rustquest:v3` for progress, `rustquest:route:v3` for the
  current view). Levels, completion %, and badges are **derived** from XP and the
  set of completed lesson ids.
- **Routing** is a tiny custom switch on `route.view` (`app.jsx` `Router`); a
  lesson route also carries `moduleId` + `lessonId`.

## The playground (simulation)

`playground.jsx` does not run Rust. On Run it checks that every token in the
block's `need[]` is present in the editor text:
- all present → it streams a realistic `cargo run` log followed by the block's
  declared `output`;
- a token missing → it streams a friendly "compiler" hint naming the token.

This keeps the app fully static while still rewarding edit-and-run interaction.
The trade-off (and the validator rule that guards it) is documented in
`content-authoring-guide.md`.

## Styling

One stylesheet, `css/styles.css`, implements the "Molten Forge" dark theme via
CSS custom properties (warm dark surfaces, rust/ember accents). Module color is
injected inline per realm. Motion respects `prefers-reduced-motion`.

## Conventions

- Curriculum is split one-file-per-realm under `js/realms/` for self-documenting
  names and small diffs; the core tables stay in `curriculum-core.js`.
- Components communicate UI events through `window` custom events for toasts
  (`rq-toast`) and the ember-burst confetti — kept out of React state on purpose.
