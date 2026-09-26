const l0 = {
  terminal: {
    curve: [0.115, 0.165],
    scanDensity: 0.44,
    scanDepth: 0.3,
    triadCss: 3.2,
    grille: 0.34,
    chroma: 1,
    bar: 0.045,
    flicker: 0.028,
    grain: 0.022,
    noise: 0,
    vignette: 0.58,
    mono: 0,
    gain: 1.34,
    halo: 0.1,
    sheen: [0.55, 1, 0.78],
    room: [0.012, 0.03, 0.022],
    background: "#03100a",
    filtering: "linear",
    surface: { mode: "buffer" },
    redrawMs: 0
  },
  cinematic: {
    curve: [0.085, 0.125],
    scanDensity: 0.4,
    scanDepth: 0.22,
    triadCss: 3.6,
    grille: 0.14,
    chroma: 0.7,
    bar: 0.022,
    flicker: 0.02,
    grain: 0.055,
    noise: 0,
    vignette: 0.74,
    mono: 1,
    gain: 1.16,
    halo: 0.2,
    sheen: [0.86, 0.9, 1],
    room: [0.016, 0.016, 0.018],
    background: "#07070a",
    filtering: "linear",
    surface: { mode: "cap", width: 1280 },
    redrawMs: 33
  },
  "blue-screen": {
    curve: [0.13, 0.18],
    scanDensity: 0.46,
    scanDepth: 0.34,
    triadCss: 3,
    grille: 0.3,
    chroma: 1.9,
    bar: 0.055,
    flicker: 0.042,
    grain: 0.038,
    noise: 1,
    vignette: 0.6,
    mono: 0,
    gain: 1.22,
    halo: 0.16,
    sheen: [0.62, 0.76, 1],
    room: [0.014, 0.02, 0.046],
    background: "#050a24",
    filtering: "linear",
    surface: { mode: "cap", width: 1600 },
    redrawMs: 96
  },
  nintendo: {
    curve: [0.07, 0.1],
    scanDensity: 0.34,
    scanDepth: 0.26,
    triadCss: 3.4,
    grille: 0.2,
    chroma: 0.55,
    bar: 0.018,
    flicker: 0.014,
    grain: 0.014,
    noise: 0,
    vignette: 0.46,
    mono: 0,
    gain: 1.2,
    halo: 0.06,
    sheen: [0.72, 0.84, 1],
    room: [0.02, 0.024, 0.04],
    background: "#0a1030",
    filtering: "nearest",
    surface: { mode: "fixed", width: 320, height: 180 },
    redrawMs: 16
  }
}, N = 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace', B = '"Helvetica Neue", "Inter", Helvetica, Arial, sans-serif', P = (l, r = 2) => String(Math.floor(l)).padStart(r, "0"), I = 8, G = [
  { text: "PICTURE START", corner: "tl" },
  { text: "MONO · ACADEMY", corner: "bl" },
  { text: "REEL 02 OF 04", corner: "br" }
];
function U(l, r, a, f) {
  l.beginPath(), l.moveTo(r - f, a), l.lineTo(r + f, a), l.moveTo(r, a - f), l.lineTo(r, a + f), l.stroke(), l.beginPath(), l.arc(r, a, f * 0.52, 0, Math.PI * 2), l.stroke();
}
const $ = (l, r, a, f) => {
  const e = a * 0.112, i = e, s = a - e, d = s - i, t = r / 2, n = i + d / 2, h = d * 0.325, m = (f % I + I) % I, b = m < 7, C = Math.max(2, 9 - Math.ceil(m || 1e-4)), p = l.createLinearGradient(0, i, 0, s);
  p.addColorStop(0, "#101013"), p.addColorStop(0.55, "#08080a"), p.addColorStop(1, "#0d0d10"), l.setTransform(1, 0, 0, 1, 0, 0), l.fillStyle = p, l.fillRect(0, 0, r, a), l.fillStyle = "rgba(236,236,240,0.20)";
  const M = d / 9, T = f * M * 2.4 % M, R = r * 0.011, o = M * 0.34;
  for (let S = i - M + T; S < s + M; S += M)
    l.fillRect(r * 0.022, S, R, o), l.fillRect(r - r * 0.022 - R, S, R, o);
  l.strokeStyle = "rgba(238,238,244,0.16)", l.lineWidth = Math.max(1, a * 16e-4), l.beginPath(), l.moveTo(t, i), l.lineTo(t, s), l.moveTo(r * 0.06, n), l.lineTo(r * 0.94, n), l.stroke(), l.strokeStyle = "rgba(238,238,244,0.30)";
  for (const S of ["tl", "tr", "bl", "br"]) {
    const u = S.endsWith("l") ? r * 0.085 : r * 0.915, y = S.startsWith("t") ? i + d * 0.16 : s - d * 0.16;
    U(l, u, y, a * 0.024);
  }
  if (b) {
    l.strokeStyle = "rgba(240,240,246,0.42)", l.lineWidth = Math.max(1.4, a * 32e-4), l.beginPath(), l.arc(t, n, h, 0, Math.PI * 2), l.stroke(), l.strokeStyle = "rgba(240,240,246,0.22)", l.beginPath(), l.arc(t, n, h * 0.845, 0, Math.PI * 2), l.stroke();
    const S = m % 1 * Math.PI * 2, u = -Math.PI / 2;
    l.fillStyle = "rgba(244,244,250,0.085)", l.beginPath(), l.moveTo(t, n), l.arc(t, n, h, u, u + S), l.closePath(), l.fill(), l.strokeStyle = "rgba(248,248,252,0.70)", l.lineWidth = Math.max(1.2, a * 26e-4), l.beginPath(), l.moveTo(t, n), l.lineTo(t + Math.cos(u + S) * h, n + Math.sin(u + S) * h), l.stroke(), l.strokeStyle = "rgba(238,238,244,0.34)", l.lineWidth = Math.max(1, a * 2e-3);
    for (let y = 0; y < 12; y += 1) {
      const A = u + y / 12 * Math.PI * 2, W = y % 3 === 0 ? h * 1.055 : h * 1.028;
      l.beginPath(), l.moveTo(t + Math.cos(A) * W, n + Math.sin(A) * W), l.lineTo(t + Math.cos(A) * h * 1.1, n + Math.sin(A) * h * 1.1), l.stroke();
    }
    l.textAlign = "center", l.textBaseline = "middle", l.shadowColor = "rgba(255,255,255,0.55)", l.shadowBlur = a * 0.03, l.fillStyle = "#f6f6fa", l.font = `700 ${(h * 1.28).toFixed(2)}px ${B}`, l.fillText(String(C), t, n + h * 0.02), l.shadowBlur = 0;
  } else {
    const S = Math.max(0, 1 - (m - 7) / 0.1);
    S > 0 && (l.fillStyle = `rgba(250,250,252,${(S * 0.62).toFixed(3)})`, l.fillRect(0, i, r, d)), l.textAlign = "center", l.textBaseline = "middle", l.fillStyle = "rgba(244,244,248,0.92)";
    const u = a * 0.052;
    l.font = `500 ${u.toFixed(2)}px ${N}`;
    const y = "T H E   L O N G   Q U I E T";
    l.shadowColor = "rgba(255,255,255,0.45)", l.shadowBlur = a * 0.02, l.fillText(y, t, n - u * 0.78), l.shadowBlur = 0, l.font = `400 ${(u * 0.42).toFixed(2)}px ${N}`, l.fillStyle = "rgba(232,232,238,0.60)", l.fillText("S C E N E   1 4   ·   T A K E   0 3", t, n + u * 0.62);
  }
  const g = a * 0.0255;
  l.font = `500 ${g.toFixed(2)}px ${N}`, l.textBaseline = "middle", l.fillStyle = "rgba(226,226,232,0.66)";
  for (const S of G) {
    l.textAlign = S.corner.endsWith("l") ? "left" : "right";
    const u = S.corner.endsWith("l") ? r * 0.055 : r * 0.945;
    l.fillText(S.text, u, S.corner.startsWith("t") ? i + d * 0.055 : s - d * 0.055);
  }
  const E = Math.floor(f * 24);
  l.textAlign = "right", l.fillStyle = "rgba(240,240,246,0.82)", l.fillText(`01:${P(E / 1440 % 60)}:${P(E / 24 % 60)}:${P(E % 24)}`, r * 0.945, i + d * 0.055), l.fillStyle = "#000", l.fillRect(0, 0, r, e), l.fillRect(0, s, r, e + 1);
}, H = [
  { text: "SIGNAL HALTED", tone: "head" },
  { text: "" },
  { text: "A fault was detected in the video subsystem and the raster" },
  { text: "driver was stopped to prevent damage to the display." },
  { text: "" },
  { text: "*  If this screen appears again, power the unit down and let" },
  { text: "   the flyback transformer discharge before restarting." },
  { text: "" },
  { text: "*  Horizontal deflection module HD-04 reported a bad sync" },
  { text: "   pulse on line 312 of field 2." },
  { text: "" },
  { text: "Technical information:", tone: "bright" },
  { text: "" },
  { text: "***  STOP: 0x0000CA7E  (0x0F13D0C0, 0x00000002, 0xC0000005)" },
  { text: "***  RASTER.SYS  -  address 8C1FA00E  base at 8C1F0000" },
  { text: "" }
], O = (l, r, a, f) => {
  const e = l.createLinearGradient(0, 0, 0, a);
  e.addColorStop(0, "#212ec0"), e.addColorStop(0.62, "#1a22a4"), e.addColorStop(1, "#141a86"), l.setTransform(1, 0, 0, 1, 0, 0), l.fillStyle = e, l.fillRect(0, 0, r, a);
  const i = 62, s = H.length + 4, d = Math.min(a * 0.88 / (s * 1.44), r * 0.82 / (i * 0.6));
  l.font = `600 ${d.toFixed(2)}px ${N}`;
  const t = l.measureText("M").width || d * 0.6, n = d * 1.44, h = t * i, m = Math.round((r - h) / 2), b = Math.round((a - s * n) / 2);
  l.textBaseline = "top", l.textAlign = "left";
  const C = H[0].text, p = t * (C.length + 4);
  l.fillStyle = "#e9ecff", l.fillRect(Math.round((r - p) / 2), b - d * 0.2, p, n), l.fillStyle = "#161d92", l.fillText(C, Math.round((r - p) / 2) + t * 2, b), l.shadowColor = "rgba(196,214,255,0.55)", l.shadowBlur = d * 0.3;
  let M = b + n;
  for (const o of H.slice(1))
    o.text && (l.fillStyle = o.tone === "bright" ? "#ffffff" : o.tone === "dim" ? "#aab6f0" : "#dfe5ff", l.fillText(o.text, m, M)), M += n;
  const T = Math.min(100, Math.floor((f % 12 + 12) % 12 * 22));
  l.fillStyle = "#dfe5ff", l.fillText(T >= 100 ? "Dump of video memory complete." : `Beginning dump of video memory: ${P(T, 2)}%`, m, M), M += n * 2;
  const R = "Press any key to restart the deflection stage ";
  l.fillText(R, m, M), Math.floor(f * 2) % 2 === 0 && l.fillRect(m + t * R.length, M + d * 0.08, t * 0.9, d * 0.96), l.shadowBlur = 0;
}, F = {
  0: ".###.#...##..###.#.###..##...#.###.",
  1: "..#...##....#....#....#....#...###.",
  2: ".###.#...#....#...#...#...#...#####",
  3: "####.....#....#.###.....#....#####.",
  4: "#..#.#..#.#..#.#####...#....#....#.",
  5: "######....####.....#....##...#.###.",
  6: ".###.#....#....####.#...##...#.###.",
  7: "#####....#...#...#...#....#....#...",
  8: ".###.#...##...#.###.#...##...#.###.",
  9: ".###.#...##...#.####....#....#.###.",
  A: ".###.#...##...#######...##...##...#",
  B: "####.#...##...#####.#...##...#####.",
  C: ".#####....#....#....#....#.....####",
  D: "####.#...##...##...##...##...#####.",
  E: "######....#....####.#....#....#####",
  F: "######....#....####.#....#....#....",
  G: ".#####....#....#..###...##...#.####",
  H: "#...##...##...#######...##...##...#",
  I: "#####..#....#....#....#....#..#####",
  J: "....#....#....#....##...##...#.###.",
  K: "#...##..#.#.#..##...#.#..#..#.#...#",
  L: "#....#....#....#....#....#....#####",
  M: "#...###.###.#.##...##...##...##...#",
  N: "#...###..##.#.##..###...##...##...#",
  O: ".###.#...##...##...##...##...#.###.",
  P: "####.#...##...#####.#....#....#....",
  Q: ".###.#...##...##...##.#.##..#..##.#",
  R: "####.#...##...#####.#.#..#..#.#...#",
  S: ".#####....#.....###.....#....#####.",
  T: "#####..#....#....#....#....#....#..",
  U: "#...##...##...##...##...##...#.###.",
  V: "#...##...##...##...##...#.#.#...#..",
  W: "#...##...##...##...##.#.###.###...#",
  X: "#...##...#.#.#...#...#.#.#...##...#",
  Y: "#...##...#.#.#...#....#....#....#..",
  Z: "#####....#...#...#...#...#....#####",
  " ": "...................................",
  "-": "...............#####...............",
  ".": "..........................##...##..",
  ":": "......##...##........##...##.......",
  "!": "..#....#....#....#....#.........#..",
  "?": ".###.#...#....#..##...#.........#..",
  "(": "..##..#....#....#....#....#.....##.",
  ")": ".##.....#....#....#....#....#..##..",
  "/": "....#....#...#...#...#...#....#....",
  "*": ".....#.#.#.###.#####.###.#.#.#.....",
  "'": "..#....#..........................."
}, v = 5, Y = 7;
function L(l, r) {
  return l.length ? (l.length * (v + 1) - 1) * r : 0;
}
function c(l, r, a, f, e, i) {
  l.fillStyle = i;
  let s = a;
  for (const d of r.toUpperCase()) {
    const t = F[d];
    if (t)
      for (let n = 0; n < Y; n += 1)
        for (let h = 0; h < v; h += 1)
          t[n * v + h] === "#" && l.fillRect(s + h * e, f + n * e, e, e);
    s += (v + 1) * e;
  }
}
const X = { 1: "#1a1028", 2: "#e0402c", 3: "#f4f4f4", 4: "#2ec4e8", 5: "#22304a" }, w = [
  "....111111....",
  "...13333331...",
  "..1333333331..",
  "..1355555531..",
  "..1355555531..",
  "..1333333331..",
  "...13333331...",
  "....111111....",
  "...12222221...",
  ".122222222221.",
  ".124444444421.",
  ".122222222221.",
  "..1222222221.."
], J = {
  a: ["...122..221...", "...122..221...", "..1111..1111.."],
  b: ["..122....221..", ".122......221.", "1111......1111"],
  jump: ["..122....221..", ".1221....1221.", ".111......111."]
};
function K(l, r, a, f, e) {
  const i = [...w, ...J[f]];
  for (let s = 0; s < i.length; s += 1) {
    const d = i[s];
    for (let t = 0; t < d.length; t += 1) {
      const n = X[d[t]];
      n && (l.fillStyle = n, l.fillRect(r + t, a + s, 1, 1));
    }
  }
}
function Q(l, r, a, f) {
  l.fillStyle = "#f4f8ff";
  const e = [[0, 4, 22, 6], [4, 1, 14, 4], [11, 2, 12, 5], [2, 8, 20, 3]];
  for (const [i, s, d, t] of e) l.fillRect(Math.round(r + i * f), Math.round(a + s * f), Math.round(d * f), Math.round(t * f));
}
function D(l, r, a, f, e) {
  l.fillStyle = e;
  for (let i = 0; i < f; i += 1) {
    const s = (f - i) * 4;
    l.fillRect(Math.round(r - s / 2), a - (i + 1) * 3, s, 3);
  }
}
const k = 10, _ = [118, 208], j = 154, V = 50, Z = 22;
function q(l, r, a) {
  l.fillStyle = "#20140c", l.fillRect(r, a, 16, 16), l.fillStyle = "#d8902c", l.fillRect(r + 1, a + 1, 14, 14), l.fillStyle = "#f0c060", l.fillRect(r + 1, a + 1, 14, 3), l.fillStyle = "#8a5414", l.fillRect(r + 1, a + 11, 14, 3), l.fillStyle = "#20140c", l.fillRect(r + 6, a + 5, 4, 2), l.fillRect(r + 5, a + 7, 6, 2), l.fillRect(r + 6, a + 9, 4, 2);
}
function z(l, r, a, f) {
  const e = [8, 6, 2, 6][f], i = e / 2, s = e > 3 ? 1 : 0;
  l.fillStyle = "#20140c", l.fillRect(r - i - 1, a + 1, e + 2, 8), l.fillRect(r - i, a - 1, e, 12), l.fillStyle = "#ffe070", l.fillRect(r - i, a + 1, e, 8), l.fillRect(r - i + s, a, e - s * 2, 10), l.fillStyle = "#fff8c8", l.fillRect(r - i + s, a + 2, Math.max(1, i - s), 4);
}
const x = (l, r, a, f) => {
  const e = j, i = (f % k + k) % k, s = l.createLinearGradient(0, 0, 0, e);
  s.addColorStop(0, "#2440b8"), s.addColorStop(0.55, "#5c94fc"), s.addColorStop(1, "#9ecbff"), l.setTransform(1, 0, 0, 1, 0, 0), l.fillStyle = s, l.fillRect(0, 0, r, a);
  for (let o = 0; o < 22; o += 1) {
    const g = o * 61 % r, E = 2 + o * 29 % 16;
    l.fillStyle = (o + Math.floor(f * 3)) % 5 === 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.30)", l.fillRect(g, E, 1, 1);
  }
  for (const [o, g, E] of [[6, 18, 1.25], [3.5, 32, 0.85]]) {
    const S = r + 80;
    for (let u = 0; u < 3; u += 1) Q(l, (f * o + u * S / 3) % S - 50, g + u % 2 * 5, E);
  }
  D(l, 48, e, 9, "#2f7a3a"), D(l, 268, e, 11, "#2f7a3a"), D(l, 160, e, 6, "#3e9a48"), l.fillStyle = "#3ca03c", l.fillRect(0, e, r, 4), l.fillStyle = "#2c7a2c", l.fillRect(0, e + 4, r, 2), l.fillStyle = "#a05a28", l.fillRect(0, e + 6, r, a - e - 6), l.fillStyle = "#7c4018";
  for (let o = e + 6; o < a; o += 6) {
    l.fillRect(0, o, r, 1);
    for (let g = o % 12 === 0 ? 0 : 6; g < r; g += 12) l.fillRect(g, o, 1, 6);
  }
  const d = Math.floor(f * 8) % 4, t = [0, 1, 1, 0][Math.floor(f * 6) % 4];
  for (const o of _)
    q(l, o, e - 16), z(l, o + 8, e - 32 - t, d);
  const n = Math.round(-24 + i / k * (r + 60));
  let h = 0;
  for (const o of _) {
    const g = (n - (o - 28)) / V;
    g > 0 && g < 1 && (h = Math.max(h, Math.sin(g * Math.PI) * Z));
  }
  const m = h > 0.5 ? "jump" : Math.floor(f * 9) % 2 === 0 ? "a" : "b";
  l.fillStyle = "rgba(20,16,10,0.20)", l.fillRect(n + 2, e - 1, 10, 2), K(l, n, e - 16 - Math.round(h), m);
  for (const [o, g] of [["PLAYER-1", 10], ["GEMS 0" + (2 + Math.floor(i / 4)), 96], ["WORLD 1-1", 174], ["TIME " + P(Math.max(0, 384 - Math.floor(f * 2)) % 1e3, 3), 254]])
    c(l, String(o), Number(g), 7, 1, "#141428"), c(l, String(o), Number(g), 6, 1, "#ffffff");
  const b = "RASTER RUN", C = L(b, 3), p = Math.round((r - C) / 2);
  c(l, b, p + 3, 53, 3, "#141028"), c(l, b, p, 50, 3, "#f8e038");
  const M = p + f * 130 % (C + 110) - 55;
  l.save(), l.beginPath(), l.rect(M, 50, 24, 21), l.clip(), c(l, b, p, 50, 3, "#fffce0"), l.restore();
  const T = "(C) 1987 DEMO", R = Math.round((r - L(T, 1)) / 2);
  if (c(l, T, R, 79, 1, "#0e1430"), c(l, T, R, 78, 1, "#dfe8ff"), Math.floor(f * 1.6) % 2 === 0) {
    const o = "PUSH START", g = Math.round((r - L(o, 2)) / 2);
    c(l, o, g + 2, 100, 2, "#141028"), c(l, o, g, 98, 2, "#ffffff");
  }
}, r0 = {
  cinematic: $,
  "blue-screen": O,
  nintendo: x
};
export {
  r0 as CRT_SCREENS,
  l0 as CRT_STYLES
};
