/* RustQuest — a small, dependency-free Rust syntax highlighter.
   Tokenizes source with sticky regexes and wraps each token in a span.
   Exposes window.highlightRust(src) -> HTML string. */
(function () {
  const KEYWORDS = new Set([
    "as", "async", "await", "break", "const", "continue", "crate", "dyn",
    "else", "enum", "extern", "false", "fn", "for", "if", "impl", "in",
    "let", "loop", "match", "mod", "move", "mut", "pub", "ref", "return",
    "self", "Self", "static", "struct", "super", "trait", "true", "type",
    "unsafe", "use", "where", "while", "union",
  ]);

  const PRIMITIVES = new Set([
    "i8", "i16", "i32", "i64", "i128", "isize",
    "u8", "u16", "u32", "u64", "u128", "usize",
    "f32", "f64", "bool", "char", "str",
  ]);

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // [class, sticky regex] — order matters: first match at the cursor wins.
  const SPECS = [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ["string", /"([^"\\]|\\.)*"/y],
    ["char", /'(\\.|[^'\\])'/y],
    ["lifetime", /'[a-zA-Z_]\w*/y],
    ["attribute", /#!?\[[^\]]*\]/y],
    ["macro", /\b[a-zA-Z_]\w*!/y],
    ["number", /\b\d[\d_]*(\.\d+)?(?:[iuf](?:8|16|32|64|128|size))?\b/y],
    ["ident", /[a-zA-Z_]\w*/y],
    ["operator", /->|=>|::|\.\.=?|[-+*/%=&|<>!.?:^@~]/y],
    ["punct", /[{}()\[\];,]/y],
    ["ws", /\s+/y],
  ];

  function classify(word) {
    if (KEYWORDS.has(word)) return "keyword";
    if (PRIMITIVES.has(word)) return "type";
    if (/^[A-Z]/.test(word)) return "type";
    return "ident";
  }

  window.highlightRust = function (src) {
    let out = "";
    let i = 0;
    const n = src.length;
    while (i < n) {
      let matched = false;
      for (let s = 0; s < SPECS.length; s++) {
        const cls = SPECS[s][0];
        const re = SPECS[s][1];
        re.lastIndex = i;
        const m = re.exec(src);
        if (m && m.index === i) {
          const text = m[0];
          if (cls === "ws") {
            out += esc(text);
          } else if (cls === "ident") {
            const real = classify(text);
            // function call?  ident immediately followed by '('
            const next = src[i + text.length];
            const realClass = real === "ident" && next === "(" ? "fn" : real;
            out += `<span class="tok-${realClass}">${esc(text)}</span>`;
          } else {
            out += `<span class="tok-${cls}">${esc(text)}</span>`;
          }
          i += text.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        out += esc(src[i]);
        i++;
      }
    }
    return out;
  };
})();
