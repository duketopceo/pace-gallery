import { CRT_STYLES as Y, CRT_SCREENS as be } from "./crtScreens.js";
import { CRT_VERTEX_SHADER as Le, CRT_FRAGMENT_SHADER as De } from "./crtShaders.js";
const Fe = { variant: "terminal", speed: 1, typeSpeed: 1, motion: 1, brightness: 1, opacity: 1, hue: 0, saturation: 1 }, Z = (s) => Y[s] ?? Y.terminal, t = (s, u = "p") => ({ t: s, c: u }), m = (s) => "·".repeat(s), O = [
  [t("ZION MAINFRAME  v9.1.1"), t("   (c) 2199 Nebuchadnezzar", "d")],
  [t("CONSTRUCT Broadcast  Rev M  S/N NX-0101-0011", "d")],
  [],
  [t("Hacking Matrix grid nodes "), t(`${m(14)} `, "d"), t("OK", "a")],
  [t("Neural Jack  0x000-0x0FF "), t(`${m(11)} `, "d"), t("ONLINE "), t("OK", "a")],
  [t("Pinging agent signatures "), t(`${m(6)} `, "d"), t("3 found")],
  [t("nav0  OPERATOR UPLINK SECURE ", "d"), t(`${m(6)} `, "d"), t("READY", "a")],
  [t("vis0  CODE RAIN DECRYPT 256bit ", "d"), t("READY", "a")],
  [t("net0  HARDLINE CONNECTION MAX ", "d"), t(`${m(4)} `, "d"), t("LINK", "a")],
  [t("red0  RED PILL EXTRACTION ", "d"), t(`${m(4)} `, "d"), t("READY", "a")],
  [t("Mounting /dev/mind -> ROOT: "), t(`${m(6)} `, "d"), t("OK", "a")],
  [t("Loading weapon training program "), t(`${m(4)} `, "d"), t("OK", "a")],
  [t("Starting [ jmp spd str wpn ] "), t(`${m(4)} `, "d"), t("OK", "a")],
  [t("Locating the Oracle sector "), t(`${m(6)} `, "d"), t("99.9%")],
  [],
  [t("SYSTEM ANOMALY  "), t("detected.", "h")],
  [t("subject Thomas A. Anderson   status asleep ", "d"), t("z", "d"), t("Z", "d")],
  [],
  [t("wake up: ")]
], Q = { p: { fill: "#8df0b4", glow: "rgba(28,236,132,0.95)" }, d: { fill: "#4f9a76", glow: "rgba(28,236,132,0.45)" }, a: { fill: "#ffba5e", glow: "rgba(255,150,52,0.95)" }, h: { fill: "#eafff3", glow: "rgba(120,255,190,0.95)" } }, k = (s) => s.reduce((u, I) => u + I.t.length, 0), ee = O.reduce((s, u) => s + k(u), 0), H = Math.max(...O.map(k)), Ne = 1920, Pe = 640, te = 24e5;
function re(s, u, I) {
  const e = s.createShader(u);
  if (!e) throw new Error("Unable to create CRT shader");
  if (s.shaderSource(e, I), s.compileShader(e), !s.getShaderParameter(e, s.COMPILE_STATUS)) throw new Error(s.getShaderInfoLog(e) ?? "CRT shader compilation failed");
  return e;
}
function Oe(s, u, I) {
  const e = u.getContext("webgl", { antialias: !1, alpha: !1, depth: !1, premultipliedAlpha: !1 });
  if (!e) throw new Error("CRT requires WebGL");
  const x = document.createElement("canvas"), o = x.getContext("2d");
  if (!o) throw new Error("CRT text canvas unavailable");
  const W = re(e, e.VERTEX_SHADER, Le), $ = re(e, e.FRAGMENT_SHADER, De), d = e.createProgram();
  if (!d) throw new Error("Unable to create CRT program");
  if (e.attachShader(d, W), e.attachShader(d, $), e.linkProgram(d), !e.getProgramParameter(d, e.LINK_STATUS)) throw new Error(e.getProgramInfoLog(d) ?? "CRT link failed");
  e.useProgram(d);
  const K = e.createBuffer();
  e.bindBuffer(e.ARRAY_BUFFER, K), e.bufferData(e.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), e.STATIC_DRAW);
  const z = e.getAttribLocation(d, "aPos");
  e.enableVertexAttribArray(z), e.vertexAttribPointer(z, 2, e.FLOAT, !1, 0, 0);
  const i = (n) => e.getUniformLocation(d, n), ae = i("uTex"), ne = i("uRes"), oe = i("uTime"), ie = i("uMotion"), fe = i("uCurve"), se = i("uScan"), le = i("uScanDepth"), ue = i("uTriad"), de = i("uGrille"), he = i("uChroma"), ce = i("uBar"), me = i("uFlicker"), Te = i("uGrain"), Ee = i("uNoise"), Re = i("uVignette"), ge = i("uMono"), xe = i("uGain"), Me = i("uHalo"), Ae = i("uSheen"), pe = i("uRoom"), N = e.createTexture();
  e.bindTexture(e.TEXTURE_2D, N), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.uniform1i(ae, 0);
  let M = 1, b = 1, P = 1, B = 1, c = 14, X = 20, v = 0, A = 8, y = 0, U = 0, L = 0, p = !1, S = !0, R = 0, D = -1, _ = -1, C = "terminal", a = Z(C);
  const V = performance.now(), q = () => {
    e.useProgram(d), e.uniform2f(fe, a.curve[0], a.curve[1]), e.uniform1f(le, a.scanDepth), e.uniform1f(de, a.grille), e.uniform1f(he, a.chroma), e.uniform1f(ce, a.bar), e.uniform1f(me, a.flicker), e.uniform1f(Te, a.grain), e.uniform1f(Ee, a.noise), e.uniform1f(Re, a.vignette), e.uniform1f(ge, a.mono), e.uniform1f(xe, a.gain), e.uniform1f(Me, a.halo), e.uniform3f(Ae, a.sheen[0], a.sheen[1], a.sheen[2]), e.uniform3f(pe, a.room[0], a.room[1], a.room[2]);
    const n = a.filtering === "nearest" ? e.NEAREST : e.LINEAR;
    e.bindTexture(e.TEXTURE_2D, N), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, n), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, n);
  }, Se = () => {
    v = b * 0.135, X = b * 0.74 / O.length, c = Math.max(5, Math.min(X * 0.8, M * 0.88 / (Math.max(H, 1) * 0.62))), o.font = `600 ${c.toFixed(2)}px ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`, A = o.measureText("M").width || c * 0.6;
  }, J = (n, f) => {
    const r = Q[n];
    o.fillStyle = r.fill, o.shadowColor = f ? r.glow : "transparent", o.shadowBlur = f ? c * 0.38 : 0;
  }, _e = (n) => {
    o.setTransform(1, 0, 0, 1, 0, 0), o.fillStyle = "#03100a", o.fillRect(0, 0, M, b), o.textAlign = "left", o.textBaseline = "top", o.font = `600 ${c.toFixed(2)}px ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`;
    let f = n, r = v;
    y = Math.floor((M - H * A) / 2), U = v;
    for (const l of O) {
      const T = k(l), h = n === 1 / 0 ? 1 / 0 : Math.min(f, T);
      let E = Math.floor((M - H * A) / 2), w = 0;
      for (const F of l) {
        let g = F.t;
        if (h !== 1 / 0) {
          const G = h - w;
          if (G <= 0) break;
          G < g.length && (g = g.slice(0, G));
        }
        if (g.length && (J(F.c, !0), o.fillText(g, E, r), J(F.c, !1), o.fillText(g, E, r), E += A * g.length), w += F.t.length, h !== 1 / 0 && w >= h) break;
      }
      if (y = E, U = r, h !== 1 / 0 && (f -= h), r += X, h !== 1 / 0 && f <= 0) break;
    }
  }, Ce = () => {
    o.shadowColor = Q.p.glow, o.shadowBlur = c * 0.42, o.fillStyle = "#bdf8d2", o.fillRect(y, U + c * 0.06, Math.max(A * 0.92, 4), c * 0.96), o.shadowBlur = 0, o.fillRect(y, U + c * 0.06, Math.max(A * 0.92, 4), c * 0.96);
  }, we = () => {
    e.bindTexture(e.TEXTURE_2D, N), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !0), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, x), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !1), S = !1;
  }, j = () => {
    const n = s.getBoundingClientRect();
    P = Math.max(1, n.width), B = Math.max(1, n.height);
    const f = Math.min(typeof window > "u" ? 1 : window.devicePixelRatio || 1, 2);
    let r = Math.max(Pe, Math.round(Math.min(P * f, Ne))), l = Math.max(1, Math.round(r * B / P));
    if (r * l > te) {
      const w = Math.sqrt(te / (r * l));
      r = Math.round(r * w), l = Math.round(l * w);
    }
    const T = a.surface, h = T.mode === "fixed" ? T.width : T.mode === "cap" ? Math.min(r, T.width) : r, E = T.mode === "fixed" ? T.height : Math.max(1, Math.round(h * l / r));
    (u.width !== r || u.height !== l) && (u.width = r, u.height = l), (x.width !== h || x.height !== E) && (x.width = h, x.height = E, M = h, b = E, Se(), D = -1, _ = -1, R = 0, S = !0), e.useProgram(d), e.viewport(0, 0, r, l), e.uniform2f(ne, r, l), e.uniform1f(se, Math.max(120, Math.min(B * a.scanDensity, 900))), e.uniform1f(ue, Math.max(2, a.triadCss * r / P));
  }, Ie = (n) => {
    const f = p ? 1 / 0 : Math.floor(L), r = Math.floor((n - V) / 420) % 2 === 0 ? 1 : 0, l = p ? r !== _ : n - R > 42;
    f === D && r === _ && !l || !p && n - R <= 42 && f === D && r === _ || (_e(f), r && Ce(), R = n, D = f, _ = r, S = !0);
  };
  return q(), {
    resize: j,
    render(n) {
      const f = I(), r = Y[f.variant] ? f.variant : "terminal";
      r !== C && (C = r, a = Z(C), q(), L = 0, p = !1, D = -1, _ = -1, R = 0, j());
      const l = (n - V) * 1e-3 * f.speed;
      C === "terminal" ? (p || (L += 4.4 * f.typeSpeed, L >= ee && (L = ee, p = !0)), Ie(n)) : (n - R >= a.redrawMs || S) && (be[C](o, M, b, l), R = n, S = !0), S && we(), e.useProgram(d), e.uniform1f(oe, l), e.uniform1f(ie, f.motion), e.drawArrays(e.TRIANGLES, 0, 3);
    },
    dispose() {
      e.deleteBuffer(K), e.deleteTexture(N), e.deleteProgram(d), e.deleteShader(W), e.deleteShader($);
    }
  };
}
export {
  Fe as CRT_DEFAULTS,
  Oe as createCrtRenderer,
  Z as crtStyle
};
