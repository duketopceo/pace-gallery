import * as o from "three128";
const N = 34, F = "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }", L = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;

vec3 bloom(vec2 uv, vec2 centre, float radius, vec3 tint){
  float aspect = uRes.x / max(uRes.y, 1.0);
  float d = length((uv - centre) * vec2(aspect, 1.0));
  float falloff = smoothstep(radius, 0.0, d);
  return tint * falloff * falloff;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime * 0.17;
  /* the base tone matters more than the blooms: refraction samples the whole
     frame, so a backdrop with black regions makes beads read as dark holes */
  vec3 col = vec3(0.085, 0.095, 0.125);
  col += mix(vec3(0.0), vec3(0.05, 0.06, 0.10), uv.y);
  col += bloom(uv, vec2(0.23 + 0.055 * sin(t * 0.9), 0.76 + 0.045 * cos(t * 0.7)), 0.86, vec3(0.24, 0.42, 0.96)) * 0.92;
  col += bloom(uv, vec2(0.82 + 0.05 * cos(t * 0.8), 0.34 + 0.055 * sin(t * 1.1)), 0.80, vec3(0.66, 0.30, 0.88)) * 0.80;
  col += bloom(uv, vec2(0.50 + 0.07 * sin(t * 0.6 + 1.7), 0.10 + 0.04 * cos(t * 0.9)), 0.74, vec3(0.14, 0.68, 0.70)) * 0.60;
  col += bloom(uv, vec2(0.10 + 0.04 * cos(t * 1.2), 0.16 + 0.05 * sin(t * 0.8)), 0.58, vec3(0.98, 0.60, 0.40)) * 0.34;
  col += bloom(uv, vec2(0.5 + uPointer.x * 0.20, 0.56 + uPointer.y * 0.16), 0.46, vec3(0.74, 0.78, 0.96)) * 0.30;
  float vignette = smoothstep(1.34, 0.30, length((uv - 0.5) * vec2(1.05, 1.0)));
  col *= mix(0.62, 1.0, vignette);
  gl_FragColor = vec4(col, 1.0);
}`, _ = `varying vec3 vNormalView;
varying vec3 vViewPos;
varying vec4 vScreen;

void main(){
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vNormalView = normalize(normalMatrix * normal);
  vViewPos = mvPosition.xyz;
  vScreen = projectionMatrix * mvPosition;
  gl_Position = vScreen;
}`, A = `precision highp float;
uniform sampler2D uBackdrop;
uniform float uThickness;
uniform float uDispersion;
uniform float uSpecular;
uniform float uRim;
uniform vec3 uTint;
uniform vec3 uLight;
varying vec3 vNormalView;
varying vec3 vViewPos;
varying vec4 vScreen;

void main(){
  vec2 screenUV = (vScreen.xy / vScreen.w) * 0.5 + 0.5;
  vec3 N = normalize(vNormalView);
  vec3 V = normalize(-vViewPos);
  vec3 I = -V;
  float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.4);

  vec2 offsetR = refract(I, N, 1.0 / (1.44 - uDispersion)).xy * uThickness;
  vec2 offsetG = refract(I, N, 1.0 / 1.44).xy * uThickness;
  vec2 offsetB = refract(I, N, 1.0 / (1.44 + uDispersion)).xy * uThickness;

  vec3 col;
  col.r = texture2D(uBackdrop, clamp(screenUV + offsetR, 0.002, 0.998)).r;
  col.g = texture2D(uBackdrop, clamp(screenUV + offsetG, 0.002, 0.998)).g;
  col.b = texture2D(uBackdrop, clamp(screenUV + offsetB, 0.002, 0.998)).b;
  col *= uTint;

  vec3 L = normalize(uLight);
  vec3 H = normalize(L + V);
  float ndoth = max(dot(N, H), 0.0);
  col += pow(ndoth, 150.0) * uSpecular;
  col += pow(ndoth, 16.0) * uSpecular * 0.11;
  /* a second, dimmer key from below keeps the underside of every bead alive */
  vec3 H2 = normalize(normalize(vec3(0.55, -0.7, 0.45)) + V);
  col += pow(max(dot(N, H2), 0.0), 44.0) * uSpecular * 0.22;
  col += fresnel * uRim * vec3(0.86, 0.90, 1.0);

  /* aerial perspective: the small far beads dissolve into the plate they float
     over instead of reading as hard specks */
  float haze = smoothstep(7.4, 11.4, -vViewPos.z);
  col = mix(col, texture2D(uBackdrop, screenUV).rgb, haze * 0.7);
  gl_FragColor = vec4(col, 1.0);
}`;
function E(w) {
  let h = w;
  return () => (h = (h * 1664525 + 1013904223) % 4294967296, h / 4294967296);
}
function X(w, h) {
  const i = new o.WebGLRenderer({ canvas: w, antialias: !0, alpha: !1 });
  i.setPixelRatio(Math.min(window.devicePixelRatio, 2)), i.setClearColor(658191, 1);
  const b = new o.Scene(), M = new o.OrthographicCamera(-1, 1, 1, -1, 0, 1), x = {
    uRes: { value: new o.Vector2(1, 1) },
    uTime: { value: 0 },
    uPointer: { value: new o.Vector2() }
  }, S = new o.ShaderMaterial({
    uniforms: x,
    vertexShader: F,
    fragmentShader: L,
    depthTest: !1,
    depthWrite: !1
  }), V = new o.PlaneGeometry(2, 2);
  b.add(new o.Mesh(V, S));
  const g = new o.WebGLRenderTarget(2, 2, {
    minFilter: o.LinearFilter,
    magFilter: o.LinearFilter,
    format: o.RGBAFormat
  }), R = new o.Scene(), u = new o.PerspectiveCamera(42, 1, 0.1, 100);
  u.position.set(0, 0, 7.4);
  const m = new o.Group();
  R.add(m);
  const P = [
    new o.SphereGeometry(1, 44, 30),
    new o.IcosahedronGeometry(1, 1),
    new o.TorusGeometry(0.78, 0.3, 22, 56)
  ], T = [
    new o.Color(1.04, 1, 1.02),
    new o.Color(0.97, 1, 1.06),
    new o.Color(1.05, 0.99, 0.97)
  ], n = E(20260826), d = [];
  for (let r = 0; r < N; r += 1) {
    const t = r < 8, l = t ? 0.4 + n() * 0.34 : 0.09 + n() * 0.18, s = P[t ? r === 3 ? 1 : r === 6 ? 2 : 0 : 0], e = new o.ShaderMaterial({
      uniforms: {
        uBackdrop: { value: g.texture },
        uThickness: { value: 0.1 },
        uDispersion: { value: 0.05 },
        uSpecular: { value: 0.85 },
        uRim: { value: 0.5 },
        uTint: { value: T[r % T.length] },
        uLight: { value: new o.Vector3(-0.45, 0.86, 0.62) }
      },
      vertexShader: _,
      fragmentShader: A
    }), a = new o.Mesh(s, e);
    a.scale.setScalar(l);
    const c = new o.Vector3();
    for (let C = 0; C < 48 && (c.set(
      (n() - 0.5) * 8.4,
      (n() - 0.5) * 5 - 0.25,
      t ? -1.4 + n() * 2.6 : -3.6 + n() * 2.4
    ), !(!t || d.every((k) => {
      const D = k.origin.x - c.x, B = k.origin.y - c.y;
      return Math.hypot(D, B) > (k.radius + l) * 1.25 + 0.3;
    }))); C += 1)
      ;
    a.position.copy(c), a.rotation.set(n() * 6.28, n() * 6.28, n() * 6.28), m.add(a), d.push({
      mesh: a,
      material: e,
      origin: c,
      radius: l,
      bob: 0.14 + n() * 0.34,
      phase: n() * 6.28,
      spin: new o.Vector3((n() - 0.5) * 0.28, (n() - 0.5) * 0.34, (n() - 0.5) * 0.2)
    });
  }
  const v = new o.Vector2(), z = new o.Vector2();
  let f = 1, p = 1, y = 0, G = performance.now();
  return { resize: (r, t) => {
    const l = Math.max(1, Math.round(r)), s = Math.max(1, Math.round(t));
    if (l === f && s === p) return;
    f = l, p = s;
    const e = Math.min(window.devicePixelRatio, 2);
    i.setSize(f, p, !1), g.setSize(Math.round(f * e), Math.round(p * e)), x.uRes.value.set(f * e, p * e), u.aspect = f / p, u.fov = u.aspect > 1 ? 42 : 42 / Math.max(0.62, u.aspect), u.updateProjectionMatrix();
    for (const a of d) a.material.uniforms.uBackdrop.value = g.texture;
  }, render: (r = performance.now()) => {
    const t = h();
    y += Math.min(96, r - G) * 1e-3, G = r, v.lerp(z, 0.045);
    const l = Math.max(4, Math.min(N, Math.round(t.count)));
    for (let s = 0; s < d.length; s += 1) {
      const e = d[s];
      if (e.mesh.visible = s < l, !e.mesh.visible) continue;
      const a = e.material.uniforms;
      a.uThickness.value = t.thickness * (0.55 + e.radius * 0.9), a.uDispersion.value = t.dispersion, a.uSpecular.value = t.specular, a.uRim.value = t.rim;
      const c = y * t.drift;
      e.mesh.position.set(
        e.origin.x + Math.sin(c * 0.21 + e.phase) * e.bob * 0.9,
        e.origin.y + Math.cos(c * 0.27 + e.phase * 1.3) * e.bob,
        e.origin.z + Math.sin(c * 0.17 + e.phase * 0.7) * e.bob * 0.5
      ), e.mesh.rotation.x += e.spin.x * 75e-4 * t.drift, e.mesh.rotation.y += e.spin.y * 75e-4 * t.drift, e.mesh.rotation.z += e.spin.z * 75e-4 * t.drift;
    }
    m.rotation.y = v.x * 0.14, m.rotation.x = -v.y * 0.1, m.position.x = v.x * 0.28, m.position.y = v.y * 0.2, x.uTime.value = y, x.uPointer.value.set(v.x, v.y), i.setRenderTarget(g), i.render(b, M), i.setRenderTarget(null), i.render(b, M), i.autoClear = !1, i.render(R, u), i.autoClear = !0;
  }, setPointer: (r, t) => z.set(r, t), dispose: () => {
    for (const r of d) r.material.dispose();
    for (const r of P) r.dispose();
    V.dispose(), S.dispose(), g.dispose(), i.dispose();
  } };
}
export {
  X as createGlassParticleField
};
