import { jsx as o } from "react/jsx-runtime";
import { Suspense as l, lazy as g } from "react";
const h = g(
  () => import("../neuform-isolated/NeuformBatchEffects.js").then((e) => ({ default: e.SkeuomorphicToggle }))
), m = g(
  () => import("./ModernToggle.js").then((e) => ({ default: e.ModernToggle }))
), s = g(
  () => import("./GlassToggle.js").then((e) => ({ default: e.GlassToggle }))
), u = g(
  () => import("./ShaderToggle.js").then((e) => ({ default: e.ShaderToggle }))
), t = /* @__PURE__ */ o("div", { className: "pg-background skeuomorphic-toggle-variant" });
function k({
  variant: e = "skeuomorphic-toggle",
  onChange: c,
  defaultOn: i,
  label: n,
  speed: a,
  ...r
}) {
  return e === "modern" ? /* @__PURE__ */ o(l, { fallback: t, children: /* @__PURE__ */ o(m, { ...r, defaultOn: i, label: n, onChange: c }) }) : e === "glass" ? /* @__PURE__ */ o(l, { fallback: t, children: /* @__PURE__ */ o(s, { ...r, defaultOn: i, label: n, speed: a, onChange: c }) }) : e === "shader" ? /* @__PURE__ */ o(l, { fallback: t, children: /* @__PURE__ */ o(u, { ...r, defaultOn: i, label: n, speed: a, onChange: c }) }) : /* @__PURE__ */ o(l, { fallback: t, children: /* @__PURE__ */ o(h, { ...r, speed: a }) });
}
export {
  k as SkeuomorphicToggleCollection
};
