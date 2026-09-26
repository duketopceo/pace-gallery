import * as t from "three";
const c = {
  light: {
    backdrop: 15330545,
    backdropFloor: 14672874,
    shadow: 0.3,
    glass: 16054527,
    attenuationOff: 14674165,
    attenuationOn: 3107839,
    knob: 16645887,
    knobTransmission: 0.78,
    knobEnv: 1.3,
    shellEmissive: 0.02,
    filamentOn: 3107839,
    filamentOff: 12897496,
    key: 16777215,
    keyIntensity: 0.18,
    ambient: 0.015,
    envSkyTop: 16777215,
    envSkyBottom: 10134708,
    envFloor: 2764864,
    envSoftbox: 16777215,
    envIntensity: 1
  },
  dark: {
    backdrop: 658191,
    backdropFloor: 395018,
    shadow: 0.55,
    glass: 15265531,
    attenuationOff: 8360888,
    attenuationOn: 3107839,
    knob: 15922943,
    knobTransmission: 0.58,
    knobEnv: 2.3,
    shellEmissive: 0.62,
    filamentOn: 3898367,
    filamentOff: 1448484,
    key: 14214399,
    keyIntensity: 0.12,
    ambient: 6e-3,
    envSkyTop: 14542581,
    envSkyBottom: 1712176,
    envFloor: 263434,
    envSoftbox: 16777215,
    envIntensity: 0.9
  }
}, P = 0.6, _ = 1.2, nt = P - 0.225, ot = _ / 2 * 0.8, at = _ + P * 2, st = P * 2 / 0.13, it = 0.18;
function a(k) {
  return new t.Color(k).convertSRGBToLinear();
}
const rt = [
  /* Broad key, high and camera-left. */
  { u: 0.3, v: 0.2, halfWidth: 0.155, halfHeight: 0.135, intensity: 19, feather: 0.86, warm: 0.04 },
  /* Narrow strip: the hard highlight that runs the length of the shoulder. */
  { u: 0.52, v: 0.115, halfWidth: 0.17, halfHeight: 0.04, intensity: 15, feather: 0.9, warm: 0 },
  /* Cool rim from behind camera-right. */
  { u: 0.86, v: 0.31, halfWidth: 0.085, halfHeight: 0.09, intensity: 10, feather: 0.92, warm: -0.06 },
  /* Backlight, directly behind the subject at u=0.25. At the silhouette the
     reflection vector points straight away from the camera, so this is the
     source that draws the clean border all the way round — and it lights the
     transmission through the body at the same time. A ring around the horizon
     instead reflects onto the equator and paints a bar across the middle. */
  { u: 0.25, v: 0.5, halfWidth: 0.1, halfHeight: 0.2, intensity: 6.5, feather: 0.8, warm: 0 },
  /* A small hard source high and camera-left: the crisp catchlight on the
     sphere, which a broad softbox alone can never give. */
  { u: 0.95, v: 0.21, halfWidth: 0.028, halfHeight: 0.032, intensity: 70, feather: 0.45, warm: 0.02 },
  /* Low bounce so the underside is not dead black. */
  { u: 0.5, v: 0.82, halfWidth: 0.5, halfHeight: 0.22, intensity: 0.5, feather: 1, warm: 0.02 }
];
function $(k, o, W) {
  const f = o * (1 - W);
  if (k <= f) return 1;
  if (k >= o) return 0;
  const r = (k - f) / (o - f);
  return 1 - r * r * (3 - 2 * r);
}
function ct(k) {
  const f = new Float32Array(524288), r = a(k.envSkyTop), u = a(k.envSkyBottom), l = a(k.envFloor), z = a(k.envSoftbox);
  for (let y = 0; y < 256; y += 1) {
    const h = 1 - y / 255, O = $(Math.max(0, 0.62 - h), 0.34, 1), M = Math.min(1, h / 0.56), p = r.r + (u.r - r.r) * M, n = r.g + (u.g - r.g) * M, s = r.b + (u.b - r.b) * M, S = 1 - Math.max(0, h - 0.62) * 1.1, v = p + (l.r * S - p) * O, d = n + (l.g * S - n) * O, E = s + (l.b * S - s) * O;
    for (let b = 0; b < 512; b += 1) {
      const F = b / 511;
      let R = v, A = d, x = E;
      for (const g of rt) {
        let w = Math.abs(F - g.u);
        w > 0.5 && (w = 1 - w);
        const B = Math.abs(h - g.v), G = Math.sqrt(
          w / g.halfWidth * (w / g.halfWidth) + B / g.halfHeight * (B / g.halfHeight)
        );
        if (G >= 1) continue;
        const C = $(G, 1, g.feather) * g.intensity;
        R += z.r * C * (1 + g.warm), A += z.g * C, x += z.b * C * (1 - g.warm);
      }
      const I = (y * 512 + b) * 4;
      f[I] = R, f[I + 1] = A, f[I + 2] = x, f[I + 3] = 1;
    }
  }
  const m = new t.DataTexture(f, 512, 256, t.RGBAFormat, t.FloatType);
  return m.mapping = t.EquirectangularReflectionMapping, m.minFilter = t.LinearFilter, m.magFilter = t.LinearFilter, m.generateMipmaps = !1, m.needsUpdate = !0, m;
}
function lt() {
  const o = document.createElement("canvas");
  o.width = 512, o.height = 512;
  const W = o.getContext("2d");
  if (!W) return null;
  const f = W.createImageData(512, 512), r = new Float32Array(512 * 512);
  let u = 2654435769;
  const l = () => (u ^= u << 13, u ^= u >>> 17, u ^= u << 5, (u >>> 0) % 1e5 / 1e5), z = new Float32Array(4096);
  for (let n = 0; n < z.length; n += 1) z[n] = l();
  for (let n = 0; n < 512; n += 1)
    for (let s = 0; s < 512; s += 1) {
      const S = s / 512 * 64, v = n / 512 * 64, d = Math.floor(S), E = Math.floor(v), b = S - d, F = v - E, R = b * b * (3 - 2 * b), A = F * F * (3 - 2 * F), x = (L, U) => z[(U & 63) * 64 + (L & 63)], I = x(d, E), g = x(d + 1, E), w = x(d, E + 1), B = x(d + 1, E + 1), G = (I * (1 - R) + g * R) * (1 - A) + (w * (1 - R) + B * R) * A, C = Math.sin(s * 12.9898 + n * 78.233) * 43758.5453;
      r[n * 512 + s] = G * 0.86 + (C - Math.floor(C)) * 0.14;
    }
  for (let n = 0; n < r.length; n += 1) {
    const s = 168 + r[n] * 78;
    f.data[n * 4] = s, f.data[n * 4 + 1] = s, f.data[n * 4 + 2] = s, f.data[n * 4 + 3] = 255;
  }
  W.putImageData(f, 0, 0);
  const m = new t.CanvasTexture(o);
  m.wrapS = t.RepeatWrapping, m.wrapT = t.RepeatWrapping;
  const y = document.createElement("canvas");
  y.width = 512, y.height = 512;
  const h = y.getContext("2d");
  if (!h) return { roughness: m, normal: null };
  const O = h.createImageData(512, 512), M = (n, s) => r[(s + 512) % 512 * 512 + (n + 512) % 512];
  for (let n = 0; n < 512; n += 1)
    for (let s = 0; s < 512; s += 1) {
      const S = M(s + 1, n) - M(s - 1, n), v = M(s, n + 1) - M(s, n - 1), d = (n * 512 + s) * 4;
      O.data[d] = 128 + S * 110, O.data[d + 1] = 128 - v * 110, O.data[d + 2] = 255, O.data[d + 3] = 255;
    }
  h.putImageData(O, 0, 0);
  const p = new t.CanvasTexture(y);
  return p.wrapS = t.RepeatWrapping, p.wrapT = t.RepeatWrapping, { roughness: m, normal: p };
}
const ht = (
  /* glsl */
  `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
), pt = (
  /* glsl */
  `
precision highp float;
varying vec2 vUv;
uniform float uAspect;
uniform float uShadow;
uniform vec3 uBackdrop;
uniform vec3 uFloor;

void main() {
  vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
  vec3 color = mix(uFloor, uBackdrop, smoothstep(-0.42, 0.16, p.y));

  /* Contact shadow, baked into the opaque sweep so the glass refracts it. */
  vec2 core = (p - vec2(0.0, -0.052)) / vec2(0.148, 0.038);
  vec2 spread = (p - vec2(0.0, -0.062)) / vec2(0.28, 0.1);
  float occlusion = exp(-dot(core, core) * 0.9) * 0.72 + exp(-dot(spread, spread) * 0.8) * 0.42;
  color *= 1.0 - clamp(occlusion, 0.0, 1.0) * uShadow;

  /* A dither step wide enough to kill banding on a near-flat sweep. */
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (dither - 0.5) * 0.0035;

  gl_FragColor = vec4(color, 1.0);
}
`
);
function ut({
  canvas: k,
  mode: o,
  speed: W,
  on: f
}) {
  const r = new t.WebGLRenderer({ canvas: k, antialias: !0, alpha: !1 });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), r.outputEncoding = t.sRGBEncoding, r.toneMapping = t.ACESFilmicToneMapping, r.toneMappingExposure = 1;
  const u = new t.Scene(), l = new t.PerspectiveCamera(26, 1, 0.1, 40);
  l.position.set(0, 0.22, 9.4), l.lookAt(0, 0, 0);
  const z = new t.PMREMGenerator(r);
  z.compileEquirectangularShader();
  const m = {
    uAspect: { value: 1 },
    uShadow: { value: c[o].shadow },
    uBackdrop: { value: a(c[o].backdrop) },
    uFloor: { value: a(c[o].backdropFloor) }
  }, y = new t.Mesh(
    new t.PlaneGeometry(1, 1),
    new t.ShaderMaterial({
      uniforms: m,
      vertexShader: ht,
      fragmentShader: pt,
      depthWrite: !1
    })
  );
  y.position.z = -3.2, y.renderOrder = -1, u.add(y);
  const h = lt(), O = r.capabilities.getMaxAnisotropy();
  h?.roughness && (h.roughness.anisotropy = O, h.roughness.repeat.set(3, 2)), h?.normal && (h.normal.anisotropy = O, h.normal.repeat.set(3, 2));
  const M = new t.Group();
  M.rotation.set(-0.05, 0.13, 0), u.add(M);
  const p = new t.MeshPhysicalMaterial({
    color: a(c[o].glass),
    metalness: 0,
    roughness: 0.115,
    transmission: 1,
    ior: 1.62,
    clearcoat: 1,
    clearcoatRoughness: 8e-3,
    attenuationColor: a(c[o].attenuationOff),
    attenuationDistance: 6,
    envMapIntensity: c[o].envIntensity,
    specularIntensity: 1,
    roughnessMap: h?.roughness ?? null,
    clearcoatNormalMap: h?.normal ?? null,
    clearcoatNormalScale: new t.Vector2(0.13, 0.13)
  });
  p.thickness = 1.25, p.iridescence = 0.2, p.iridescenceIOR = 1.3, p.iridescenceThicknessRange = [120, 420], p.emissive = a(c[o].filamentOn), p.emissiveIntensity = 0;
  const n = new t.Mesh(
    new t.CapsuleGeometry(P, _, 64, 192),
    p
  );
  n.rotation.z = Math.PI / 2, n.scale.set(1, 1, 0.82), M.add(n);
  const s = new t.MeshStandardMaterial({
    color: a(c[o].filamentOff),
    emissive: a(c[o].filamentOn),
    emissiveIntensity: f ? 1 : 0,
    roughness: 0.34,
    metalness: 0
  }), S = new t.Mesh(
    new t.CapsuleGeometry(0.105, _ + 0.16, 16, 64),
    s
  );
  S.rotation.z = Math.PI / 2, S.position.set(0, -0.31, -0.04), M.add(S);
  const v = new t.MeshPhysicalMaterial({
    color: a(c[o].knob),
    metalness: 0,
    roughness: 0.125,
    transmission: c[o].knobTransmission,
    ior: 1.47,
    clearcoat: 1,
    clearcoatRoughness: 0.01,
    attenuationColor: a(c[o].attenuationOff),
    attenuationDistance: 3,
    envMapIntensity: c[o].envIntensity * c[o].knobEnv,
    roughnessMap: h?.roughness ?? null,
    clearcoatNormalMap: h?.normal ?? null,
    clearcoatNormalScale: new t.Vector2(0.1, 0.1)
  });
  v.thickness = 0.62, v.iridescence = 0.12, v.iridescenceIOR = 1.25, v.iridescenceThicknessRange = [100, 380];
  const d = new t.Mesh(new t.SphereGeometry(nt, 160, 96), v);
  d.position.z = P * 0.82, M.add(d);
  const E = new t.AmbientLight(a(16777215), c[o].ambient);
  u.add(E);
  const b = new t.DirectionalLight(a(c[o].key), c[o].keyIntensity);
  b.position.set(2.2, 3.4, 4), u.add(b);
  let F = null;
  function R(i) {
    const e = ct(c[i]);
    if (!e) return;
    const T = z.fromEquirectangular(e);
    e.dispose(), F?.dispose(), F = T, u.environment = T.texture;
  }
  R(o);
  let A = o, x = f ? 1 : 0, I = x, g = 0, w = x;
  const B = a(c[o].attenuationOff), G = a(c[o].attenuationOn), C = a(c[o].filamentOff), L = a(c[o].filamentOn), U = new t.Vector2(0, 0), q = new t.Vector2(0, 0);
  let D = 1, V = 1, N = l.position.z, K = 1, X = !1, J = performance.now();
  const Q = typeof window < "u" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tt(i) {
    const e = c[i];
    m.uBackdrop.value = a(e.backdrop), m.uFloor.value = a(e.backdropFloor), m.uShadow.value = e.shadow, p.color = a(e.glass), p.envMapIntensity = e.envIntensity, v.color = a(e.knob), v.attenuationColor = a(e.attenuationOff), v.transmission = e.knobTransmission, v.envMapIntensity = e.envIntensity * e.knobEnv, B.copy(a(e.attenuationOff)), G.copy(a(e.attenuationOn)), C.copy(a(e.filamentOff)), L.copy(a(e.filamentOn)), s.emissive = a(e.filamentOn), p.emissive = a(e.filamentOn), E.intensity = e.ambient, b.color = a(e.key), b.intensity = e.keyIntensity, R(i);
  }
  function Y(i, e) {
    D = Math.max(1, Math.round(i)), V = Math.max(1, Math.round(e)), r.setSize(D, V, !1), l.aspect = D / V;
    const T = l.fov * Math.PI / 360;
    N = Math.max(st, at / (it * l.aspect)) / K / (2 * Math.tan(T)), l.position.z = N, l.updateProjectionMatrix();
    const H = 2 * (N - y.position.z) * Math.tan(T);
    y.scale.set(H * l.aspect * 1.08, H * 1.08, 1), m.uAspect.value = l.aspect;
  }
  function et() {
    const i = _ / 2 + P, e = new t.Vector3(-i, 0, 0).project(l), T = new t.Vector3(i, 0, 0).project(l), j = new t.Vector3(0, P, 0).project(l), H = new t.Vector3(0, -P, 0).project(l);
    return {
      width: Math.abs(T.x - e.x) * 0.5 * D,
      height: Math.abs(j.y - H.y) * 0.5 * V
    };
  }
  function Z(i) {
    if (X) return;
    const e = Math.min(0.05, (i - J) / 1e3);
    J = i;
    const T = Q ? 400 : 150, j = 2 * Math.sqrt(T), H = Q ? Math.min(e, 0.016) : e;
    g += (x - I) * T * H - g * j * H, I += g * H, w += (x - w) * Math.min(1, e * 6), q.lerp(U, Math.min(1, e * 3.2)), d.position.x = (I * 2 - 1) * ot, d.rotation.z = -I * Math.PI * 0.9, d.rotation.y = q.x * 0.3, s.emissiveIntensity = w * (A === "dark" ? 3.2 : 1.4), s.color.copy(C).lerp(L, w * 0.85), p.attenuationColor.copy(B).lerp(G, w), p.attenuationDistance = 6 - w * 4.8, p.emissiveIntensity = w * c[A].shellEmissive, l.position.set(
      q.x * 0.5,
      0.22 + q.y * 0.32,
      N
    ), l.lookAt(0, 0, 0), r.render(u, l), window.requestAnimationFrame(Z);
  }
  return window.requestAnimationFrame(Z), {
    setMode(i) {
      i !== A && (A = i, tt(i));
    },
    setSpeed(i) {
    },
    setSize(i) {
      K = i, Y(D, V);
    },
    setOn(i) {
      x = i ? 1 : 0;
    },
    setPointer(i, e) {
      U.set(i, e);
    },
    resize: Y,
    measureSwitch: et,
    dispose() {
      X = !0, F?.dispose(), z.dispose(), h?.roughness?.dispose(), h?.normal?.dispose(), u.traverse((i) => {
        if (!(i instanceof t.Mesh)) return;
        i.geometry.dispose();
        const e = i.material;
        Array.isArray(e) ? e.forEach((T) => T.dispose()) : e.dispose();
      }), r.dispose();
    }
  };
}
export {
  ut as createGlassToggleScene
};
