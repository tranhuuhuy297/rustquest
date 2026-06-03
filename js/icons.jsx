/* RustQuest icons + brand mark. Exports window.Icon, window.BrandMark.
   NOTE: this is the first Babel script loaded — it declares the shared React
   hook bindings used by every later .jsx file (Babel scripts share global scope,
   so these must be declared exactly once, here). */
const { useState, useEffect, useRef, useCallback, useMemo } = React;

const ICON_PATHS = {
  // nav
  dashboard: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  trophy: '<path d="M6 4h12v4a6 6 0 0 1-12 0V4z"/><path d="M6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3M9 18h6M10 18l1-4h2l1 4M8 22h8"/>',
  // module icons
  sprout: '<path d="M12 22V11M12 11C12 7 9 4 4 4c0 5 3 7 8 7zM12 13c0-3 2-6 7-6 0 4-3 6-7 6z"/>',
  key: '<circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M17 17l2-2M14 14l2-2"/>',
  blocks: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="8" y="13" width="8" height="8" rx="1"/>',
  stack: '<path d="m12 3 9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/>',
  shapes: '<circle cx="7" cy="7" r="4"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="m13 3 4 7h-8z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  // stats / misc
  flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-3-9 0 0-2 2-3 5-1-2-1-5-3-7C5 7 5 10 5 15c0 4 3 7 7 7z"/>',
  spark: '<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  checkSmall: '<path d="m5 12 4 4 10-10"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  flag: '<path d="M5 22V4M5 4h13l-2 4 2 4H5"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/>',
  mountain: '<path d="m3 20 6-12 4 7 2-3 6 8z"/>',
  crown: '<path d="m3 7 4 4 5-7 5 7 4-4-2 13H5L3 7z"/>',
  lightbulb: '<path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z"/>',
  alert: '<path d="M12 3 2 20h20L12 3zM12 9v5M12 17v.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  book: '<path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4zM4 18a2 2 0 0 1 2-2h13"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  lessons: '<path d="M4 5h16M4 12h16M4 19h10"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2z"/>',
  graduation: '<path d="m2 8 10-4 10 4-10 4-10-4zM6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
};

function Icon({ name, size = 20, stroke = 2, fill = false, className = "", style = {} }) {
  const filled = name === "play" || name === "bolt" || name === "zap" || name === "flame" || name === "star" || fill;
  return React.createElement("svg", {
    className, width: size, height: size, viewBox: "0 0 24 24", style,
    fill: filled ? "currentColor" : "none",
    stroke: filled ? "none" : "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    dangerouslySetInnerHTML: { __html: ICON_PATHS[name] || "" },
  });
}

/* Original abstract mark: a molten hex "core" with two crab claws.
   Not the Rust trademark — a custom crustacean-in-a-gear motif. */
function BrandMark({ size = 38, className = "" }) {
  return React.createElement("svg", {
    width: size, height: size, viewBox: "0 0 48 48", className, fill: "none",
  }, React.createElement("defs", null,
      React.createElement("linearGradient", { id: "bm-grad", x1: "0", y1: "0", x2: "1", y2: "1" },
        React.createElement("stop", { offset: "0", stopColor: "#FF7A45" }),
        React.createElement("stop", { offset: "1", stopColor: "#C8451B" }))),
    // hex gear core
    React.createElement("path", {
      d: "M24 3 41 13V33L24 43 7 33V13L24 3Z",
      fill: "url(#bm-grad)", stroke: "#FFB089", strokeWidth: "1", strokeOpacity: ".5",
    }),
    // inner negative-space crab: body + two claws + eyes
    React.createElement("g", { fill: "#1a0f08" },
      React.createElement("ellipse", { cx: "24", cy: "27", rx: "7", ry: "5" }),
      React.createElement("circle", { cx: "21", cy: "18", r: "2" }),
      React.createElement("circle", { cx: "27", cy: "18", r: "2" })),
    React.createElement("g", { stroke: "#1a0f08", strokeWidth: "2.4", strokeLinecap: "round", fill: "none" },
      React.createElement("path", { d: "M21 16.5 19 13" }),
      React.createElement("path", { d: "M27 16.5 29 13" }),
      // claws
      React.createElement("path", { d: "M17 25c-4 0-6-2-6-5" }),
      React.createElement("path", { d: "M31 25c4 0 6-2 6-5" }),
      // legs
      React.createElement("path", { d: "M18 29l-4 3M19 31l-3 4M30 29l4 3M29 31l3 4" })));
}

Object.assign(window, { Icon, BrandMark });
