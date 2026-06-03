# Content Authoring Guide

All learning content is plain data in `js/realms/realm-*.js`. To add a lesson,
edit a realm file; to add a realm, create a new file and register it. No React
or build step involved.

## Realm file shape

Each file appends exactly one module to the global curriculum:

```js
/* Realm N — Title. Appends one module to window.RUSTQUEST.modules. */
window.RUSTQUEST.modules.push({
  id: "kebab-id",          // unique across all realms
  n: N,                    // realm number; must equal its load position
  title: "Realm Title",
  subtitle: "One-line description shown on the Quest Map.",
  color: "#RRGGBB",        // hex; tints the hex badge + progress ring
  icon: "iconName",        // a key in js/icons.jsx ICON_PATHS
  lessons: [ /* lesson objects */ ],
});
```

Files load in numeric order via `<script>` tags in `index.html`. To add a realm:
1. Create `js/realms/realm-10-your-topic.js`.
2. Add a `<script src="js/realms/realm-10-your-topic.js"></script>` line in
   `index.html`, after realm 9 and before the `text/babel` component scripts.

## Lesson shape

```js
{
  id: "lesson-id",         // unique across the whole app
  title: "Lesson Title",
  tag: "Short subtitle shown under the title",
  min: 10,                 // estimated minutes
  xp: 150,                 // XP awarded on completion
  blocks: [ /* content blocks, in order */ ],
  quiz:   [ /* quiz items */ ],
  takeaways: ["short string", "..."],   // 3 is the convention
}
```

> A lesson may carry `locked: true` to appear as a "coming soon" stub (empty
> `blocks`/`quiz`/`takeaways`). Locked lessons are excluded from progress totals
> and badge math.

## Block types (the `blocks` array)

| `t` | Fields | Renders as |
|-----|--------|------------|
| `text` | `html` | Prose. Inline `<code>`, `<strong>`, `<em>` allowed. |
| `code` | `code`, `caption` | Read-only, syntax-highlighted snippet. |
| `callout` | `kind` (`tip`\|`warn`\|`note`), `html` | Colored aside. |
| `play` | `prompt`, `code`, `output`, `need[]` | Interactive editor + simulated runner. |
| `fib` | `prompt`, `before`, `blank`, `after`, `answer`, `hint` | Fill-in-the-blank. |

### Quiz item

```js
{ q: "Question?", opts: ["A", "B", "C"], a: 1, why: "Explanation shown after answering." }
```

`a` is the **0-based index** of the correct option.

## Critical rules (enforced by the validator)

1. **`play` tokens:** every string in `need[]` must already appear **literally**
   in the starter `code`, so the first Run succeeds. `output` must be the exact
   stdout the program produces (whitespace and newlines matter). The runner is a
   simulation — it shows `output` verbatim, it does not compile Rust.
2. **`play` determinism:** never depend on thread/async interleaving for the
   shown output. Join threads / collect channels and print a final, fixed result.
3. **`fib`:** `answer` is a single short token; `before + answer + after` must
   read as valid Rust. Keep `blank` equal to `answer`.
4. **HTML escaping:** escape `&` as `&amp;` **only** inside `html` fields
   (`text`, `callout`). Never escape inside `code` / `play.code` / `fib` fields.
5. **JS string escaping:** a Rust newline escape (`\n` in a `println!`) is written
   `\\n` in the JS source string. Prefer single-quoted JS strings when the Rust
   contains many double quotes.

## Validate

```bash
node scripts/validate-curriculum.js
```

Prints module/lesson counts and fails on any structural problem: missing fields,
duplicate ids, out-of-range quiz answers, malformed blocks, and `play` blocks
whose `need` tokens are missing from the starter code.

## Levels & badges

Edit `js/curriculum-core.js`:
- `levels[]` — `{ name, min }` XP thresholds (lowest to highest).
- `badges[]` — `{ id, icon, name, desc }`. The **award logic** lives in
  `badgesFor()` in `js/store.jsx`; realm-completion badges call
  `realmDone(state, "<module-id>")`. Add a line there for a new badge.
