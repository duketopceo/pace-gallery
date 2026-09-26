import { jsxs as t, jsx as e, Fragment as a } from "react/jsx-runtime";
import { useRef as y, useState as E, useEffect as f } from "react";
import { createTopDockController as R } from "./topDockController.js";
const M = {
  variant: "sable",
  proximity: 122,
  spring: 0.19,
  damping: 0.7,
  widthGrowth: 17,
  heightGrowth: 16,
  drop: 3.5,
  pixelSize: 4,
  speed: 1,
  noise: 1,
  levels: 7,
  scanlines: 0.32,
  particles: 22,
  thickness: 0.115,
  dispersion: 0.05,
  specular: 0.85,
  rim: 0.5,
  drift: 1
}, S = [
  { id: "system", label: "SYSTEM", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "2.25", y: "2.25", width: "4.5", height: "4.5", rx: ".8" }),
    /* @__PURE__ */ e("rect", { x: "9.25", y: "2.25", width: "4.5", height: "4.5", rx: ".8" }),
    /* @__PURE__ */ e("rect", { x: "2.25", y: "9.25", width: "4.5", height: "4.5", rx: ".8" }),
    /* @__PURE__ */ e("rect", { x: "9.25", y: "9.25", width: "4.5", height: "4.5", rx: ".8" })
  ] }) },
  { id: "method", label: "METHOD", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("circle", { cx: "3", cy: "8", r: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "12.5", cy: "3.5", r: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "12.5", cy: "12.5", r: "1.5" }),
    /* @__PURE__ */ e("path", { d: "M4.5 7.3 11 4.2M4.5 8.7l6.5 3.1" })
  ] }) },
  { id: "work", label: "WORK", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "2", y: "3", width: "12", height: "10", rx: "1.5" }),
    /* @__PURE__ */ e("path", { d: "M2 6h12M5 4.5h.01M7 4.5h.01" })
  ] }) },
  { id: "access", label: "ACCESS", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("circle", { cx: "5.2", cy: "6.2", r: "2.7" }),
    /* @__PURE__ */ e("path", { d: "m7.2 8.2 5.9 5.1M10.2 10.8l1.5-1.5M12 12.4l1.4-1.4" })
  ] }) },
  { id: "notes", label: "NOTES", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("path", { d: "M4 2.25h5.4L12 4.85v8.9H4z" }),
    /* @__PURE__ */ e("path", { d: "M9.25 2.25V5h2.7M6 8h4M6 10.5h4" })
  ] }) }
], T = [
  { id: "product", label: "Product", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("path", { d: "M8 1.9 14.1 5v6L8 14.1 1.9 11V5z" }),
    /* @__PURE__ */ e("path", { d: "M1.9 5 8 8.1 14.1 5M8 8.1v6" })
  ] }) },
  { id: "solutions", label: "Solutions", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("path", { d: "M8 1.9 14.4 5.6 8 9.3 1.6 5.6z" }),
    /* @__PURE__ */ e("path", { d: "m2.6 8 5.4 3.1L13.4 8M2.6 10.7 8 13.8l5.4-3.1" })
  ] }) },
  { id: "docs", label: "Docs", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("path", { d: "M3.4 2.4h5.4l3.8 3.8v7.4H3.4z" }),
    /* @__PURE__ */ e("path", { d: "M8.8 2.4v3.8h3.8M5.9 9h4.2M5.9 11.2h3" })
  ] }) },
  { id: "pricing", label: "Pricing", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("path", { d: "M8.6 2.2H13v4.4l-6.6 6.6a1.2 1.2 0 0 1-1.7 0L2.2 10.5a1.2 1.2 0 0 1 0-1.7z" }),
    /* @__PURE__ */ e("circle", { cx: "10.6", cy: "4.6", r: ".9" })
  ] }) },
  { id: "changelog", label: "Changelog", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "5.9" }),
    /* @__PURE__ */ e("path", { d: "M8 4.6V8l2.4 1.5" })
  ] }) }
], A = [
  { id: "system", label: "SYSTEM", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "1", y: "1", width: "2", height: "2" }),
    /* @__PURE__ */ e("rect", { x: "4", y: "1", width: "2", height: "2" }),
    /* @__PURE__ */ e("rect", { x: "1", y: "4", width: "2", height: "2" }),
    /* @__PURE__ */ e("rect", { x: "4", y: "4", width: "2", height: "2" })
  ] }) },
  { id: "files", label: "FILES", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "1", y: "0", width: "4", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "1", y: "1", width: "1", height: "5" }),
    /* @__PURE__ */ e("rect", { x: "5", y: "1", width: "1", height: "5" }),
    /* @__PURE__ */ e("rect", { x: "1", y: "6", width: "5", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "2", y: "2", width: "3", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "2", y: "4", width: "3", height: "1" })
  ] }) },
  { id: "net", label: "NET", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "3", y: "0", width: "1", height: "7" }),
    /* @__PURE__ */ e("rect", { x: "0", y: "3", width: "7", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "1", y: "1", width: "1", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "5", y: "1", width: "1", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "1", y: "5", width: "1", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "1", height: "1" })
  ] }) },
  { id: "disk", label: "DISK", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "0", y: "1", width: "7", height: "5" }),
    /* @__PURE__ */ e("rect", { x: "2", y: "0", width: "3", height: "2" }),
    /* @__PURE__ */ e("rect", { x: "1", y: "4", width: "5", height: "1" })
  ] }) },
  { id: "help", label: "HELP", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "2", y: "0", width: "3", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "4", y: "1", width: "2", height: "2" }),
    /* @__PURE__ */ e("rect", { x: "3", y: "3", width: "2", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "3", y: "4", width: "1", height: "1" }),
    /* @__PURE__ */ e("rect", { x: "3", y: "6", width: "1", height: "1" })
  ] }) }
], L = [
  { id: "overview", label: "Overview", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "5.8" }),
    /* @__PURE__ */ e("path", { d: "M2.4 8c2.4-3.5 9-3.5 11.3 0" })
  ] }) },
  { id: "studio", label: "Studio", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "2.2", y: "2.2", width: "11.6", height: "11.6", rx: "3.6" }),
    /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "2.5" })
  ] }) },
  { id: "library", label: "Library", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("rect", { x: "2.1", y: "2.6", width: "3", height: "10.8", rx: "1" }),
    /* @__PURE__ */ e("rect", { x: "6.4", y: "2.6", width: "3", height: "10.8", rx: "1" }),
    /* @__PURE__ */ e("path", { d: "m10.9 3.7 2.9 1-2.4 8.6-2.2-.8" })
  ] }) },
  { id: "motion", label: "Motion", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("path", { d: "M1.8 10.6c2.6 0 3-5.2 6.2-5.2s3.6 5.2 6.2 5.2" }),
    /* @__PURE__ */ e("circle", { cx: "8", cy: "5.4", r: ".9" })
  ] }) },
  { id: "labs", label: "Labs", icon: /* @__PURE__ */ t(a, { children: [
    /* @__PURE__ */ e("path", { d: "M6.4 2.2v4L3 12.1a1.3 1.3 0 0 0 1.1 2h7.8a1.3 1.3 0 0 0 1.1-2L9.6 6.2v-4" }),
    /* @__PURE__ */ e("path", { d: "M5.6 2.2h4.8M4.9 9.6h6.2" })
  ] }) }
], I = {
  sable: S,
  modern: T,
  retro: A,
  glass: L
}, b = /* @__PURE__ */ t("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("rect", { width: "24", height: "24", rx: "4.5", fill: "#E8E8E3" }),
  /* @__PURE__ */ e("path", { d: "M6 6h8.6L18 9.35v8.15H9.15L6 14.35V6Z", fill: "#111" }),
  /* @__PURE__ */ e("path", { d: "M9 9h5.15L15 9.85V15H9.85L9 14.15V9Z", fill: "#E8E8E3" }),
  /* @__PURE__ */ e("path", { d: "M12 9v6M9 12h6", stroke: "#111", strokeWidth: ".7" })
] });
function C(n) {
  const u = y(null);
  return f(() => {
    const r = u.current;
    if (r)
      return R(r, n);
  }, []), u;
}
function N(n, u) {
  const r = y(null), c = y(null), [_, v] = E(null);
  return f(() => {
    if (!n) return;
    let d = !1;
    return u().then((s) => {
      d || v({ create: s });
    }), () => {
      d = !0;
    };
  }, [n]), f(() => {
    const d = r.current, s = c.current;
    if (!n || !_ || !d || !s) return;
    const l = _.create(s);
    let o = 0, h = !0, i = d.getBoundingClientRect();
    const m = () => {
      i = d.getBoundingClientRect(), l.resize(i.width, i.height);
    }, x = (g) => {
      l.resize(i.width, i.height), l.render(g), o = h && !document.hidden ? requestAnimationFrame(x) : 0;
    }, p = (g) => {
      l.setPointer?.(
        (g.clientX - i.left) / Math.max(1, i.width) * 2 - 1,
        -((g.clientY - i.top) / Math.max(1, i.height) * 2 - 1)
      );
    }, w = new ResizeObserver(m), k = new IntersectionObserver(([g]) => {
      h = g?.isIntersecting ?? !0, h && !o && (o = requestAnimationFrame(x)), !h && o && (cancelAnimationFrame(o), o = 0);
    });
    return w.observe(d), k.observe(d), d.addEventListener("pointermove", p, { passive: !0 }), m(), o = requestAnimationFrame(x), () => {
      o && cancelAnimationFrame(o), w.disconnect(), k.disconnect(), d.removeEventListener("pointermove", p), l.dispose();
    };
  }, [n, _]), { hostRef: r, canvasRef: c };
}
function P({ className: n = "", ...u }) {
  const r = y({ ...M, ...u });
  r.current = { ...M, ...u };
  const c = r.current.variant, _ = I[c] ?? S, [v, d] = E(_[0].id), s = C(() => ({
    ...r.current,
    axis: c === "glass" ? "y" : "x",
    distribute: c === "retro",
    lockTrack: c === "modern"
  })), l = N(c === "retro", async () => {
    const { createRetroPixelField: i } = await import("./retroPixelField.js");
    return (m) => i(m, () => ({
      pixelSize: r.current.pixelSize,
      noise: r.current.noise,
      levels: r.current.levels,
      speed: r.current.speed
    }));
  }), o = N(c === "glass", async () => {
    const { createGlassParticleField: i } = await import("./glassParticleField.js");
    return (m) => i(m, () => ({
      count: r.current.particles,
      thickness: r.current.thickness,
      dispersion: r.current.dispersion,
      specular: r.current.specular,
      rim: r.current.rim,
      drift: r.current.drift
    }));
  }), h = (i, m, x) => _.map((p) => /* @__PURE__ */ t(
    "button",
    {
      className: i,
      "data-dock-item": !0,
      type: "button",
      "aria-pressed": v === p.id,
      onClick: () => d(p.id),
      children: [
        /* @__PURE__ */ e("span", { className: m, "aria-hidden": "true", children: /* @__PURE__ */ e("svg", { viewBox: x, children: p.icon }) }),
        /* @__PURE__ */ e("span", { children: p.label })
      ]
    },
    p.id
  ));
  return c === "modern" ? /* @__PURE__ */ t("div", { className: `animated-top-dock-component atd-modern${n ? ` ${n}` : ""}`, children: [
    /* @__PURE__ */ e("div", { className: "atd-modern__aurora", "aria-hidden": "true" }),
    /* @__PURE__ */ t("header", { className: "atd-modern__bar", children: [
      /* @__PURE__ */ t("a", { className: "atd-modern__brand", href: "#top-dock", onClick: (i) => i.preventDefault(), children: [
        /* @__PURE__ */ e("span", { className: "atd-modern__mark", "aria-hidden": "true", children: b }),
        /* @__PURE__ */ e("span", { className: "atd-modern__word", children: "Lumina" })
      ] }),
      /* @__PURE__ */ e("nav", { ref: s, className: "atd-modern__dock", "aria-label": "Primary", "data-dock-state": "idle", "data-dock-max": "0.00", children: h("atd-modern__item", "atd-modern__icon", "0 0 16 16") }),
      /* @__PURE__ */ t("div", { className: "atd-modern__actions", children: [
        /* @__PURE__ */ e("button", { className: "atd-modern__ghost", type: "button", children: "Sign in" }),
        /* @__PURE__ */ t("button", { className: "atd-modern__cta", type: "button", children: [
          /* @__PURE__ */ e("span", { children: "Start building" }),
          /* @__PURE__ */ e("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M3.2 8h9.1M8.6 4.3 12.4 8l-3.8 3.7" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "atd-modern__stage", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("p", { className: "atd-modern__eyebrow", children: "Interface systems" }),
      /* @__PURE__ */ e("p", { className: "atd-modern__headline", children: "Everything above the fold" })
    ] }),
    /* @__PURE__ */ e("p", { className: "animated-top-dock-component__caption", children: "LOGO LEFT · DOCK CENTRE · ACTION RIGHT" })
  ] }) : c === "retro" ? /* @__PURE__ */ t(
    "div",
    {
      ref: l.hostRef,
      className: `animated-top-dock-component atd-retro${n ? ` ${n}` : ""}`,
      style: { "--atd-retro-scan": r.current.scanlines },
      children: [
        /* @__PURE__ */ e("canvas", { ref: l.canvasRef, className: "atd-retro__field", "aria-hidden": "true" }),
        /* @__PURE__ */ e("div", { className: "atd-retro__vignette", "aria-hidden": "true" }),
        /* @__PURE__ */ t("header", { className: "atd-retro__bar", children: [
          /* @__PURE__ */ t("div", { className: "atd-retro__brand", children: [
            /* @__PURE__ */ e("span", { className: "atd-retro__badge", "aria-hidden": "true", children: /* @__PURE__ */ t("svg", { viewBox: "0 0 7 7", children: [
              /* @__PURE__ */ e("rect", { x: "0", y: "2", width: "7", height: "3" }),
              /* @__PURE__ */ e("rect", { x: "2", y: "0", width: "3", height: "7" })
            ] }) }),
            "SABLE//OS"
          ] }),
          /* @__PURE__ */ e("nav", { ref: s, className: "atd-retro__dock", "aria-label": "Primary", "data-dock-state": "idle", "data-dock-max": "0.00", children: h("atd-retro__item", "atd-retro__icon", "0 0 7 7") }),
          /* @__PURE__ */ t("button", { className: "atd-retro__cta", type: "button", children: [
            /* @__PURE__ */ e("span", { "aria-hidden": "true", children: "▶" }),
            "RUN"
          ] })
        ] }),
        /* @__PURE__ */ t("p", { className: "atd-retro__readout", children: [
          /* @__PURE__ */ e("span", { children: "MEM 640K" }),
          /* @__PURE__ */ e("span", { children: "DITHER 8×8" }),
          /* @__PURE__ */ e("span", { children: "PAL 8" })
        ] }),
        /* @__PURE__ */ e("p", { className: "animated-top-dock-component__caption", children: "FITTED STRIP · ORDERED DITHER" })
      ]
    }
  ) : c === "glass" ? /* @__PURE__ */ t("div", { ref: o.hostRef, className: `animated-top-dock-component atd-glass${n ? ` ${n}` : ""}`, "data-dock-frame": !0, children: [
    /* @__PURE__ */ e("canvas", { ref: o.canvasRef, className: "atd-glass__field", "aria-hidden": "true" }),
    /* @__PURE__ */ t("header", { className: "atd-glass__rail", children: [
      /* @__PURE__ */ t("a", { className: "atd-glass__brand", href: "#top-dock", onClick: (i) => i.preventDefault(), children: [
        /* @__PURE__ */ e("span", { className: "atd-glass__mark", "aria-hidden": "true", children: b }),
        /* @__PURE__ */ e("span", { className: "atd-glass__word", children: "Aperture" })
      ] }),
      /* @__PURE__ */ e("span", { className: "atd-glass__hairline", "aria-hidden": "true" }),
      /* @__PURE__ */ e("nav", { ref: s, className: "atd-glass__dock", "aria-label": "Primary", "data-dock-state": "idle", "data-dock-max": "0.00", children: h("atd-glass__item", "atd-glass__icon", "0 0 16 16") }),
      /* @__PURE__ */ e("span", { className: "atd-glass__hairline", "aria-hidden": "true" }),
      /* @__PURE__ */ t("button", { className: "atd-glass__cta", type: "button", children: [
        "Get the app",
        /* @__PURE__ */ e("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M3.4 8h9.2M8.8 4.2 12.6 8l-3.8 3.8" }) })
      ] })
    ] }),
    /* @__PURE__ */ e("p", { className: "animated-top-dock-component__caption", children: "VERTICAL RAIL · SCREEN-SPACE DISPERSION" })
  ] }) : /* @__PURE__ */ t("div", { className: `animated-top-dock-component${n ? ` ${n}` : ""}`, children: [
    /* @__PURE__ */ t("nav", { ref: s, className: "animated-top-dock__nav", "aria-label": "Animated top dock", "data-dock-state": "idle", "data-dock-max": "0.00", children: [
      /* @__PURE__ */ e("button", { className: "animated-top-dock__item animated-top-dock__logo", "data-dock-item": !0, type: "button", "aria-label": "Home", onClick: () => d("system"), children: b }),
      _.map((i) => /* @__PURE__ */ t("button", { className: "animated-top-dock__item animated-top-dock__link", "data-dock-item": !0, type: "button", "aria-pressed": v === i.id, onClick: () => d(i.id), children: [
        /* @__PURE__ */ e("span", { className: "animated-top-dock__icon", "aria-hidden": "true", children: /* @__PURE__ */ e("svg", { viewBox: "0 0 16 16", children: i.icon }) }),
        /* @__PURE__ */ e("span", { children: i.label })
      ] }, i.id))
    ] }),
    /* @__PURE__ */ e("p", { className: "animated-top-dock-component__caption", children: "MOVE ACROSS THE DOCK · FOCUS WITH TAB" })
  ] });
}
export {
  M as ANIMATED_TOP_DOCK_DEFAULTS,
  P as AnimatedTopDock
};
