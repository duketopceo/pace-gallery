import { useState as c, useEffect as s } from "react";
function d() {
  if (typeof document > "u" || typeof window > "u") return "dark";
  const t = document.documentElement, e = t.dataset.theme ?? t.dataset.scheme;
  return e === "light" || e === "dark" ? e : t.classList.contains("light") ? "light" : t.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function m(t) {
  const e = t === "auto", [o, i] = c(d);
  return s(() => {
    if (!e || typeof document > "u" || typeof window > "u") return;
    const a = window.matchMedia("(prefers-color-scheme: dark)"), n = () => i(d()), r = new MutationObserver(n);
    return r.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["class", "data-scheme", "data-theme"]
    }), a.addEventListener("change", n), n(), () => {
      r.disconnect(), a.removeEventListener("change", n);
    };
  }, [e]), t === "light" || t === "dark" ? t : o;
}
function f(t, e, o) {
  return Math.min(o, Math.max(e, t));
}
export {
  f as clamp,
  d as readAutomaticToggleMode,
  m as useToggleMode
};
