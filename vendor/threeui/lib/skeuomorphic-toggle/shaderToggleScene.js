import { SHADER_TOGGLE_VERTEX as K, buildShaderToggleFragment as V } from "./shaderToggleGlsl.js";
const N = 1.35, h = 1, W = 0.13, v = 0.18;
function X(t, l, u) {
  const i = t.createShader(l);
  if (!i) throw new Error("Shader could not be created.");
  if (t.shaderSource(i, u), t.compileShader(i), !t.getShaderParameter(i, t.COMPILE_STATUS)) {
    const c = t.getShaderInfoLog(i);
    throw t.deleteShader(i), new Error(`Shader failed to compile: ${c ?? "unknown error"}`);
  }
  return i;
}
function J({
  canvas: t,
  mode: l,
  speed: u,
  size: i,
  on: c
}) {
  const T = t.getContext("webgl", { antialias: !0, alpha: !1 }) ?? t.getContext("experimental-webgl", { antialias: !0, alpha: !1 });
  if (!T) throw new Error("WebGL is unavailable.");
  const e = T, Y = !!e.getExtension("OES_standard_derivatives"), r = e.createProgram();
  if (!r) throw new Error("Program could not be created.");
  const L = X(e, e.VERTEX_SHADER, K), P = X(e, e.FRAGMENT_SHADER, V(Y));
  if (e.attachShader(r, L), e.attachShader(r, P), e.linkProgram(r), !e.getProgramParameter(r, e.LINK_STATUS)) {
    const o = e.getProgramInfoLog(r);
    throw new Error(`Program failed to link: ${o ?? "unknown error"}`);
  }
  e.deleteShader(L), e.deleteShader(P), e.useProgram(r);
  const _ = e.createBuffer();
  e.bindBuffer(e.ARRAY_BUFFER, _), e.bufferData(e.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), e.STATIC_DRAW);
  const x = e.getAttribLocation(r, "aPosition");
  e.enableVertexAttribArray(x), e.vertexAttribPointer(x, 2, e.FLOAT, !1, 0, 0);
  const a = {
    res: e.getUniformLocation(r, "uRes"),
    unit: e.getUniformLocation(r, "uUnit"),
    time: e.getUniformLocation(r, "uTime"),
    on: e.getUniformLocation(r, "uOn"),
    progress: e.getUniformLocation(r, "uProgress"),
    mode: e.getUniformLocation(r, "uMode"),
    pointer: e.getUniformLocation(r, "uPointer")
  }, g = Math.min(typeof window > "u" ? 1 : window.devicePixelRatio || 1, 2), b = typeof window < "u" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let s = 1, f = 1, m = 1, U = i, F = l, y = u, d = c ? 1 : 0, w = d, p = 0, S = d, H = 0, I = 0, A = 0, E = 0, D = 0, G = typeof performance > "u" ? 0 : performance.now(), B = !1, R = 0;
  function C() {
    m = Math.min(
      f * W / (h * 2),
      s * v / ((N + h) * 2)
    ) * U;
  }
  function $(o, n) {
    s = Math.max(1, Math.round(o)), f = Math.max(1, Math.round(n)), t.width = Math.round(s * g), t.height = Math.round(f * g), t.style.width = `${s}px`, t.style.height = `${f}px`, e.viewport(0, 0, t.width, t.height), C();
  }
  function q() {
    return {
      width: m * (N + h) * 2,
      height: m * h * 2
    };
  }
  function O(o) {
    if (B) return;
    const n = Math.min(0.05, (o - G) / 1e3);
    G = o, D += n * y;
    const k = b ? 420 : 165, z = 2 * Math.sqrt(k), M = b ? Math.min(n, 0.016) : n;
    p += (d - w) * k * M - p * z * M, w += p * M, S += (d - S) * Math.min(1, n * 5.5), A += (H - A) * Math.min(1, n * 3.4), E += (I - E) * Math.min(1, n * 3.4), e.uniform2f(a.res, t.width, t.height), e.uniform1f(a.unit, m * g), e.uniform1f(a.time, D), e.uniform1f(a.on, S), e.uniform1f(a.progress, w), e.uniform1f(a.mode, F === "dark" ? 1 : 0), e.uniform2f(a.pointer, A, E), e.drawArrays(e.TRIANGLES, 0, 3), R = window.requestAnimationFrame(O);
  }
  return R = window.requestAnimationFrame(O), {
    setMode(o) {
      F = o;
    },
    setSpeed(o) {
      y = o;
    },
    setSize(o) {
      U = o, C();
    },
    setOn(o) {
      d = o ? 1 : 0;
    },
    setPointer(o, n) {
      H = o, I = n;
    },
    resize: $,
    measureSwitch: q,
    dispose() {
      B = !0, window.cancelAnimationFrame(R), e.deleteBuffer(_), e.deleteProgram(r);
    }
  };
}
export {
  J as createShaderToggleScene
};
