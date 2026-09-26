import { jsxs as d, jsx as t } from "react/jsx-runtime";
import { useState as D, useRef as x, useEffect as G, useCallback as W } from "react";
/* empty css                  */
import { useToggleMode as C, clamp as c } from "./toggleMode.js";
const a = {
  mode: "auto",
  defaultOn: !0,
  label: "Live Sync",
  size: 1,
  opacity: 1,
  hue: 0,
  saturation: 1,
  brightness: 1
};
function I({
  mode: N = a.mode,
  defaultOn: k = a.defaultOn,
  label: f = a.label,
  size: O = a.size,
  opacity: S = a.opacity,
  hue: F = a.hue,
  saturation: $ = a.saturation,
  brightness: A = a.brightness,
  onChange: p,
  className: v,
  style: E
}) {
  const L = C(N), [r, R] = D(k), b = x(null), y = x(null);
  G(() => {
    const l = b.current, e = y.current;
    if (!l || !e) return;
    const q = typeof window < "u" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, n = r ? 1 : 0;
    let s = Number(e.dataset.progress ?? (r ? 1 : 0)), o = Number(e.dataset.velocity ?? 0), g = 0, _ = performance.now();
    const h = (m, i) => {
      const M = Math.max(0, l.clientWidth - e.offsetLeft * 2 - e.offsetWidth), u = Math.min(1, Math.abs(i) / 6), z = 1 + u * 0.16, B = 1 - u * 0.1;
      e.style.transformOrigin = i >= 0 ? "right center" : "left center", e.style.transform = `translate3d(${(m * M).toFixed(2)}px, 0, 0) scale(${z.toFixed(4)}, ${B.toFixed(4)})`;
    };
    if (q) {
      e.dataset.progress = String(n), e.dataset.velocity = "0", h(n, 0);
      return;
    }
    const w = (m) => {
      const i = Math.min(0.032, (m - _) / 1e3);
      if (_ = m, o += ((n - s) * 210 - o * 19.5) * i, s += o * i, e.dataset.progress = String(s), e.dataset.velocity = String(o), h(s, o), Math.abs(n - s) < 6e-4 && Math.abs(o) < 6e-3) {
        s = n, o = 0, e.dataset.progress = String(n), e.dataset.velocity = "0", h(n, 0);
        return;
      }
      g = window.requestAnimationFrame(w);
    };
    return g = window.requestAnimationFrame(w), () => window.cancelAnimationFrame(g);
  }, [r]);
  const T = W(() => {
    R((l) => {
      const e = !l;
      return p?.(e), e;
    });
  }, [p]), j = {
    "--modern-toggle-scale": c(O, 0.35, 2.5),
    "--modern-toggle-hue": `${c(F, -180, 180)}deg`,
    "--modern-toggle-saturation": c($, 0, 2),
    "--modern-toggle-brightness": c(A, 0.35, 1.65),
    opacity: c(S, 0.05, 1),
    ...E
  };
  return /* @__PURE__ */ d(
    "div",
    {
      className: `modern-toggle${v ? ` ${v}` : ""}`,
      "data-mode": L,
      "data-state": r ? "on" : "off",
      style: j,
      children: [
        /* @__PURE__ */ t("div", { className: "modern-toggle__halo", "aria-hidden": "true" }),
        /* @__PURE__ */ d("div", { className: "modern-toggle__stack", children: [
          /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              ref: b,
              className: "modern-toggle__switch",
              role: "switch",
              "aria-checked": r,
              "aria-label": f,
              onClick: T,
              children: [
                /* @__PURE__ */ t("span", { className: "modern-toggle__track", "aria-hidden": "true" }),
                /* @__PURE__ */ t("span", { ref: y, className: "modern-toggle__thumb", "aria-hidden": "true", children: /* @__PURE__ */ d("span", { className: "modern-toggle__mark", children: [
                  /* @__PURE__ */ t("svg", { viewBox: "0 0 24 24", "data-mark": "check", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M5 12.8 9.6 17.4 19 8" }) }),
                  /* @__PURE__ */ t("svg", { viewBox: "0 0 24 24", "data-mark": "dash", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M6.5 12h11" }) })
                ] }) })
              ]
            }
          ),
          /* @__PURE__ */ d("p", { className: "modern-toggle__caption", children: [
            /* @__PURE__ */ t("span", { children: f }),
            /* @__PURE__ */ t("b", { children: r ? "On" : "Off" })
          ] })
        ] })
      ]
    }
  );
}
export {
  a as MODERN_TOGGLE_DEFAULTS,
  I as ModernToggle
};
