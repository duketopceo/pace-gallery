import { jsxs as R, jsx as a } from "react/jsx-runtime";
import { useRef as p, useState as O, useCallback as A, useEffect as u } from "react";
/* empty css                 */
import { createGlassToggleScene as F } from "./glassToggleScene.js";
import { useToggleMode as W, clamp as r } from "./toggleMode.js";
const o = {
  mode: "auto",
  defaultOn: !0,
  label: "Live Sync",
  speed: 1,
  size: 1,
  opacity: 1,
  hue: 0,
  saturation: 1,
  brightness: 1
};
function Y({
  mode: $ = o.mode,
  defaultOn: v = o.defaultOn,
  label: w = o.label,
  speed: f = o.speed,
  size: y = o.size,
  opacity: G = o.opacity,
  hue: L = o.hue,
  saturation: P = o.saturation,
  brightness: T = o.brightness,
  onChange: S,
  className: x,
  style: k
}) {
  const h = W($), m = p(null), _ = p(null), b = p(null), s = p(null), [i, z] = O(v), [N, C] = O(!0), M = A(() => {
    z((t) => {
      const e = !t;
      return S?.(e), e;
    });
  }, [S]);
  u(() => {
    const t = m.current, e = _.current;
    if (!t || !e) return;
    let n;
    try {
      n = F({ canvas: e, mode: h, speed: f, on: v });
    } catch {
      C(!1);
      return;
    }
    s.current = n;
    const g = () => {
      const l = b.current;
      if (!l) return;
      const c = n.measureSwitch();
      l.style.width = `${Math.round(c.width)}px`, l.style.height = `${Math.round(c.height)}px`;
    }, d = new ResizeObserver((l) => {
      const c = l[0]?.contentRect;
      c && (n.resize(c.width, c.height), g());
    });
    return d.observe(t), n.resize(t.clientWidth, t.clientHeight), g(), () => {
      d.disconnect(), n.dispose(), s.current = null;
    };
  }, []), u(() => {
    s.current?.setMode(h);
  }, [h]), u(() => {
    s.current?.setSpeed(r(f, 0, 3));
  }, [f]), u(() => {
    s.current?.setSize(r(y, 0.35, 2.5));
    const t = b.current, e = s.current?.measureSwitch();
    !t || !e || (t.style.width = `${Math.round(e.width)}px`, t.style.height = `${Math.round(e.height)}px`);
  }, [y]), u(() => {
    s.current?.setOn(i);
  }, [i]);
  const E = (t) => {
    const e = m.current;
    if (!e) return;
    const n = e.getBoundingClientRect(), g = (t.clientX - n.left) / n.width * 2 - 1, d = (t.clientY - n.top) / n.height * 2 - 1;
    s.current?.setPointer(r(g, -1, 1), r(-d, -1, 1));
  }, j = {
    "--glass-toggle-hue": `${r(L, -180, 180)}deg`,
    "--glass-toggle-saturation": r(P, 0, 2),
    "--glass-toggle-brightness": r(T, 0.35, 1.65),
    opacity: r(G, 0.05, 1),
    ...k
  };
  return /* @__PURE__ */ R(
    "div",
    {
      ref: m,
      className: `glass-toggle${x ? ` ${x}` : ""}`,
      "data-mode": h,
      "data-state": i ? "on" : "off",
      style: j,
      onPointerMove: E,
      onPointerLeave: () => s.current?.setPointer(0, 0),
      onClick: M,
      children: [
        /* @__PURE__ */ a("canvas", { ref: _, className: "glass-toggle__canvas" }),
        /* @__PURE__ */ a(
          "button",
          {
            ref: b,
            type: "button",
            className: "glass-toggle__switch",
            role: "switch",
            "aria-checked": i,
            "aria-label": w,
            onClick: (t) => {
              t.stopPropagation(), M();
            }
          }
        ),
        /* @__PURE__ */ R("p", { className: "glass-toggle__caption", children: [
          /* @__PURE__ */ a("span", { children: w }),
          /* @__PURE__ */ a("b", { children: i ? "On" : "Off" })
        ] }),
        N ? null : /* @__PURE__ */ a("p", { className: "glass-toggle__fallback", children: "This variant needs WebGL, which this browser did not provide." })
      ]
    }
  );
}
export {
  o as GLASS_TOGGLE_DEFAULTS,
  Y as GlassToggle
};
