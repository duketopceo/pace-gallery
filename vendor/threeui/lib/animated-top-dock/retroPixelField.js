const R = `attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`, S = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uNoise;
uniform float uLevels;

float hash(vec2 p){ p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 34.23); return fract(p.x * p.y); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p){
  float sum = 0.0, amp = 0.5;
  for (int i = 0; i < 5; i++){ sum += amp * vnoise(p); p = p * 2.03 + 11.7; amp *= 0.5; }
  return sum;
}

/* the classic recursive Bayer construction: each level halves the cell and adds a
   quarter of the coarser threshold, which is cheaper than indexing a matrix and
   avoids the dynamic array access GLSL ES 1.0 will not guarantee */
float bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a){ return bayer2(a * 0.5) * 0.25 + bayer2(a); }
float bayer8(vec2 a){ return bayer4(a * 0.5) * 0.25 + bayer2(a); }

vec3 stop(float index){
  if (index < 0.5) return vec3(0.043, 0.035, 0.109);
  if (index < 1.5) return vec3(0.106, 0.063, 0.220);
  if (index < 2.5) return vec3(0.212, 0.090, 0.325);
  if (index < 3.5) return vec3(0.396, 0.129, 0.376);
  if (index < 4.5) return vec3(0.612, 0.180, 0.376);
  if (index < 5.5) return vec3(0.827, 0.298, 0.325);
  if (index < 6.5) return vec3(0.945, 0.502, 0.286);
  return vec3(0.988, 0.784, 0.494);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime;

  /* two counter-drifting noise sheets read as slow weather rather than as a
     single scrolling texture */
  vec2 cloud = vec2(uv.x * 3.4, uv.y * 2.1);
  float weather = fbm(cloud + vec2(t * 0.055, t * -0.021));
  weather = mix(weather, fbm(cloud * 1.9 + vec2(-t * 0.032, t * 0.044)), 0.42);

  /* the composition is three bands: a deep sky that warms downward, a hot
     horizon at y=0.30, and a dark ground the readout chrome can sit on. The
     falloffs are deliberately wide — a steep ramp stacks the palette steps into
     thin horizontal bars the ordered dither is too small to break up */
  float sky = smoothstep(0.98, 0.20, uv.y) * 0.36;
  float heat = smoothstep(0.60, 0.16, uv.y) * 0.32;
  float ground = smoothstep(0.26, 0.08, uv.y);
  float sun = smoothstep(0.38, 0.0, length((uv - vec2(0.5, 0.29)) * vec2(0.70, 1.5))) * 0.20;
  /* the three terms sum to just under 1.0 at the horizon: pushing past it clips
     the whole band to the last palette stop and the dither texture disappears */
  float field = 0.11 + sky + heat + sun - ground * 0.80 + (weather - 0.5) * 0.82 * uNoise;

  /* static lives before quantisation so it moves the pixel across a palette step
     instead of tinting it */
  float grain = hash(floor(gl_FragCoord.xy) + floor(t * 12.0)) - 0.5;
  field += grain * 0.055 * uNoise;
  field *= 1.0 - 0.34 * smoothstep(0.45, 1.05, length((uv - vec2(0.5, 0.46)) * vec2(1.06, 1.0)));

  float levels = max(uLevels, 2.0);
  float dither = bayer8(gl_FragCoord.xy) - 0.5;
  float quantised = clamp(field + dither / levels, 0.0, 0.9999);
  /* no scanline here: one drawing-buffer row is pixelSize screen rows tall,
     so darkening alternate rows draws chunky bars rather than a raster. The CRT
     line structure is a screen-resolution CSS overlay instead. */
  gl_FragColor = vec4(stop(floor(quantised * levels) * (7.0 / (levels - 1.0))), 1.0);
}`;
function v(r, n, e) {
  const t = r.createShader(n);
  return t ? (r.shaderSource(t, e), r.compileShader(t), r.getShaderParameter(t, r.COMPILE_STATUS) ? t : (console.warn("Retro pixel field shader failed to compile.", r.getShaderInfoLog(t)), r.deleteShader(t), null)) : null;
}
const h = { resize: () => {
}, render: () => {
}, dispose: () => {
} };
function L(r, n) {
  const e = r.getContext("webgl", { antialias: !1, alpha: !1, depth: !1, preserveDrawingBuffer: !1 });
  if (!e) return h;
  const t = e.createProgram(), l = v(e, e.VERTEX_SHADER, R), f = v(e, e.FRAGMENT_SHADER, S);
  if (!t || !l || !f) return h;
  if (e.attachShader(t, l), e.attachShader(t, f), e.linkProgram(t), !e.getProgramParameter(t, e.LINK_STATUS))
    return console.warn("Retro pixel field program failed to link.", e.getProgramInfoLog(t)), h;
  e.useProgram(t);
  const c = e.createBuffer();
  e.bindBuffer(e.ARRAY_BUFFER, c), e.bufferData(e.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), e.STATIC_DRAW);
  const u = e.getAttribLocation(t, "aPos"), g = e.getUniformLocation(t, "uRes"), x = e.getUniformLocation(t, "uTime"), y = e.getUniformLocation(t, "uNoise"), b = e.getUniformLocation(t, "uLevels");
  let a = 1, o = 1;
  const w = performance.now();
  let d = 0, m = w;
  return { resize: (s, i) => {
    const p = n();
    a = Math.max(2, Math.round(s / Math.max(1, p.pixelSize))), o = Math.max(2, Math.round(i / Math.max(1, p.pixelSize))), !(r.width === a && r.height === o) && (r.width = a, r.height = o, e.viewport(0, 0, a, o));
  }, render: (s = performance.now()) => {
    const i = n();
    d += Math.min(96, s - m) * 1e-3 * i.speed, m = s, e.useProgram(t), e.bindBuffer(e.ARRAY_BUFFER, c), e.enableVertexAttribArray(u), e.vertexAttribPointer(u, 2, e.FLOAT, !1, 0, 0), e.uniform2f(g, a, o), e.uniform1f(x, d), e.uniform1f(y, i.noise), e.uniform1f(b, i.levels), e.drawArrays(e.TRIANGLES, 0, 3);
  }, dispose: () => {
    e.deleteBuffer(c), e.deleteProgram(t), e.deleteShader(l), e.deleteShader(f);
  } };
}
export {
  L as createRetroPixelField
};
