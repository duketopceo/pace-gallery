import { jsx as g } from "react/jsx-runtime";
import { useRef as a, useEffect as R } from "react";
import { CRT_DEFAULTS as p, createCrtRenderer as A, crtStyle as F } from "./crtRenderer.js";
function z({ className: u = "", ...f }) {
  const m = a(null), d = a(null), o = a({ ...p, ...f });
  o.current = { ...p, ...f }, R(() => {
    const t = m.current, v = d.current;
    if (!t || !v) return;
    const n = A(t, v, () => o.current);
    let e = 0, i = !0;
    const l = () => {
      n.resize(), n.render(performance.now());
    }, s = (c) => {
      n.render(c), e = i && !document.hidden ? requestAnimationFrame(s) : 0;
    }, b = new ResizeObserver(l), h = new IntersectionObserver(([c]) => {
      i = c?.isIntersecting ?? !0, i && !e && (e = requestAnimationFrame(s)), !i && e && (cancelAnimationFrame(e), e = 0);
    });
    return b.observe(t), h.observe(t), l(), e = requestAnimationFrame(s), () => {
      e && cancelAnimationFrame(e), b.disconnect(), h.disconnect(), n.dispose();
    };
  }, []);
  const r = o.current;
  return /* @__PURE__ */ g("div", { ref: m, className: `pg-background crt crt-${r.variant}${u ? ` ${u}` : ""}`, style: { background: F(r.variant).background, opacity: r.opacity, filter: `hue-rotate(${r.hue}deg) saturate(${r.saturation}) brightness(${r.brightness})` }, children: /* @__PURE__ */ g("canvas", { ref: d }) });
}
export {
  z as CrtBackground
};
