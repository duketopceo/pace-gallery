import { jsxs as M, jsx as i } from "react/jsx-runtime";
import { useRef as d, useState as O, useCallback as P, useEffect as a } from "react";
/* empty css                  */
import { createShaderToggleScene as D } from "./shaderToggleScene.js";
import { useToggleMode as F, clamp as o } from "./toggleMode.js";
const s = {
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
  mode: T = s.mode,
  defaultOn: v = s.defaultOn,
  label: S = s.label,
  speed: g = s.speed,
  size: p = s.size,
  opacity: k = s.opacity,
  hue: z = s.hue,
  saturation: L = s.saturation,
  brightness: $ = s.brightness,
  onChange: w,
  className: y,
  style: E
}) {
  const l = F(T), f = d(null), _ = d(null), R = d(null), r = d(null), [c, N] = O(v), [C, G] = O(!0), x = P(() => {
    N((e) => {
      const t = !e;
      return w?.(t), t;
    });
  }, [w]), h = P(() => {
    const e = R.current, t = r.current?.measureSwitch();
    !e || !t || (e.style.width = `${Math.round(t.width)}px`, e.style.height = `${Math.round(t.height)}px`);
  }, []);
  a(() => {
    const e = f.current, t = _.current;
    if (!e || !t) return;
    let n;
    try {
      n = D({
        canvas: t,
        mode: l,
        speed: g,
        size: o(p, 0.35, 2.5),
        on: v
      });
    } catch {
      G(!1);
      return;
    }
    r.current = n;
    const u = new ResizeObserver((m) => {
      const b = m[0]?.contentRect;
      b && (n.resize(b.width, b.height), h());
    });
    return u.observe(e), n.resize(e.clientWidth, e.clientHeight), h(), () => {
      u.disconnect(), n.dispose(), r.current = null;
    };
  }, []), a(() => {
    r.current?.setMode(l);
  }, [l]), a(() => {
    r.current?.setSpeed(o(g, 0, 3));
  }, [g]), a(() => {
    r.current?.setSize(o(p, 0.35, 2.5)), h();
  }, [p, h]), a(() => {
    r.current?.setOn(c);
  }, [c]);
  const j = (e) => {
    const t = f.current;
    if (!t) return;
    const n = t.getBoundingClientRect(), u = (e.clientX - n.left) / n.width * 2 - 1, m = (e.clientY - n.top) / n.height * 2 - 1;
    r.current?.setPointer(o(u, -1, 1), o(-m, -1, 1));
  }, A = {
    "--shader-toggle-hue": `${o(z, -180, 180)}deg`,
    "--shader-toggle-saturation": o(L, 0, 2),
    "--shader-toggle-brightness": o($, 0.35, 1.65),
    opacity: o(k, 0.05, 1),
    ...E
  };
  return /* @__PURE__ */ M(
    "div",
    {
      ref: f,
      className: `shader-toggle${y ? ` ${y}` : ""}`,
      "data-mode": l,
      "data-state": c ? "on" : "off",
      style: A,
      onPointerMove: j,
      onPointerLeave: () => r.current?.setPointer(0, 0),
      onClick: x,
      children: [
        /* @__PURE__ */ i("canvas", { ref: _, className: "shader-toggle__canvas" }),
        /* @__PURE__ */ i(
          "button",
          {
            ref: R,
            type: "button",
            className: "shader-toggle__switch",
            role: "switch",
            "aria-checked": c,
            "aria-label": S,
            onClick: (e) => {
              e.stopPropagation(), x();
            }
          }
        ),
        /* @__PURE__ */ M("p", { className: "shader-toggle__caption", children: [
          /* @__PURE__ */ i("span", { children: S }),
          /* @__PURE__ */ i("b", { children: c ? "On" : "Off" })
        ] }),
        C ? null : /* @__PURE__ */ i("p", { className: "shader-toggle__fallback", children: "This variant needs WebGL, which this browser did not provide." })
      ]
    }
  );
}
export {
  s as SHADER_TOGGLE_DEFAULTS,
  Y as ShaderToggle
};
