/* Structural validator for the RustQuest curriculum data.
   Loads curriculum-core.js + every realm file under a fake `window`, then
   asserts the schema invariants the React views and playground depend on.
   Run: node scripts/validate-curriculum.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {}, console };
vm.createContext(sandbox);

const files = [
  "js/curriculum-core.js",
  // sort by the realm number embedded in the filename (realm-N-*.js) so realm-10
  // loads after realm-9, not after realm-1 — matching the <script> order in index.html
  ...fs.readdirSync(path.join(root, "js/realms"))
    .sort((a, b) => (parseInt(a.match(/realm-(\d+)/)[1], 10)) - (parseInt(b.match(/realm-(\d+)/)[1], 10)))
    .map((f) => "js/realms/" + f),
];
for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), "utf8");
  vm.runInContext(src, sandbox, { filename: f });
}

const RQ = sandbox.window.RUSTQUEST;
const errors = [];
const warn = [];
let lessonTotal = 0;
let playTotal = 0;
let fibTotal = 0;
const seenLesson = new Set();
const seenModule = new Set();

if (!RQ) throw new Error("window.RUSTQUEST not defined");

RQ.modules.forEach((m, mi) => {
  const where = `module[${mi}] ${m.id}`;
  ["id", "n", "title", "subtitle", "color", "icon"].forEach((k) => {
    if (m[k] == null) errors.push(`${where}: missing ${k}`);
  });
  if (m.n !== mi + 1) warn.push(`${where}: n=${m.n} but position=${mi + 1}`);
  if (seenModule.has(m.id)) errors.push(`duplicate module id: ${m.id}`);
  seenModule.add(m.id);

  (m.lessons || []).forEach((l) => {
    lessonTotal++;
    const lw = `${where} / lesson ${l.id}`;
    ["id", "title", "tag", "min", "xp"].forEach((k) => {
      if (l[k] == null) errors.push(`${lw}: missing ${k}`);
    });
    if (seenLesson.has(l.id)) errors.push(`duplicate lesson id: ${l.id}`);
    seenLesson.add(l.id);
    if (l.locked) return; // locked lessons may be empty stubs

    if (!Array.isArray(l.blocks) || l.blocks.length === 0)
      errors.push(`${lw}: no blocks`);

    (l.blocks || []).forEach((b, bi) => {
      const bw = `${lw} block[${bi}] t=${b.t}`;
      switch (b.t) {
        case "text":
        case "callout":
          if (typeof b.html !== "string" || !b.html) errors.push(`${bw}: bad html`);
          if (b.t === "callout" && !["tip", "warn", "note"].includes(b.kind))
            errors.push(`${bw}: bad callout kind ${b.kind}`);
          break;
        case "code":
          if (typeof b.code !== "string" || !b.code) errors.push(`${bw}: bad code`);
          break;
        case "play": {
          playTotal++;
          if (typeof b.code !== "string") { errors.push(`${bw}: missing code`); break; }
          if (typeof b.output !== "string") errors.push(`${bw}: output must be a string`);
          const need = b.need || [];
          need.forEach((tok) => {
            if (!b.code.includes(tok))
              errors.push(`${bw}: need token "${tok}" NOT in starter code (first Run would fail)`);
          });
          break;
        }
        case "fib": {
          fibTotal++;
          ["before", "after", "answer", "hint"].forEach((k) => {
            if (typeof b[k] !== "string") errors.push(`${bw}: missing ${k}`);
          });
          if (b.blank !== b.answer) warn.push(`${bw}: blank("${b.blank}") != answer("${b.answer}")`);
          break;
        }
        default:
          errors.push(`${bw}: unknown block type`);
      }
    });

    (l.quiz || []).forEach((q, qi) => {
      const qw = `${lw} quiz[${qi}]`;
      if (!q.q) errors.push(`${qw}: missing q`);
      if (!Array.isArray(q.opts) || q.opts.length < 2) errors.push(`${qw}: needs >=2 opts`);
      if (typeof q.a !== "number" || q.a < 0 || q.a >= (q.opts || []).length)
        errors.push(`${qw}: answer index out of range`);
      if (!q.why) errors.push(`${qw}: missing why`);
    });
    if (!l.quiz || l.quiz.length === 0) warn.push(`${lw}: no quiz`);
    if (!l.takeaways || l.takeaways.length === 0) warn.push(`${lw}: no takeaways`);
  });
});

console.log(`modules: ${RQ.modules.length}`);
console.log(`lessons: ${lessonTotal}  (play blocks: ${playTotal}, fib blocks: ${fibTotal})`);
console.log(`levels: ${RQ.levels.length}, badges: ${RQ.badges.length}`);
console.log(`module order: ${RQ.modules.map((m) => m.id).join(" → ")}`);

if (warn.length) {
  console.log(`\n${warn.length} warning(s):`);
  warn.forEach((w) => console.log("  ⚠ " + w));
}
if (errors.length) {
  console.log(`\n${errors.length} ERROR(s):`);
  errors.forEach((e) => console.log("  ✗ " + e));
  process.exit(1);
}
console.log("\n✓ curriculum is structurally valid");
