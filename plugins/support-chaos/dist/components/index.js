import { h } from "preact"

const PATREON = "https://www.patreon.com/c/D20Deathmatch"
const KOFI = "https://ko-fi.com/badguysstudios"

const css = `
.support-chaos { border: 2px solid #60269e; border-radius: 8px; box-shadow: 4px 4px 0 #000; padding: 0.7rem 0.9rem 0.8rem; background: rgba(96, 38, 158, 0.18); }
.support-chaos h3 { margin: 0 0 0.25rem; font-family: "Nodesto Caps Condensed", var(--headerFont); color: #f1e500; font-size: 1.35rem; letter-spacing: 0.02em; }
.support-chaos p { margin: 0 0 0.6rem; font-size: 0.85rem; line-height: 1.35; opacity: 0.9; }
.support-chaos .sc-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.support-chaos a.sc-btn { flex: 1 1 auto; text-align: center; padding: 0.35rem 0.6rem; border-radius: 6px; font-weight: 700; text-decoration: none; background: none; border: 2px solid #ff39d6; color: #ff39d6; }
.support-chaos a.sc-btn.sc-patreon { background: #ff39d6; color: #111; }
.support-chaos a.sc-btn:hover { filter: brightness(1.15); }
@media (max-width: 800px) {
  .support-chaos { position: fixed; left: 0; right: 0; bottom: 0; z-index: 900; margin: 0; border-radius: 0; border-width: 2px 0 0; box-shadow: 0 -4px 12px rgba(0,0,0,0.6); background: #160a24; padding: 0.45rem 0.75rem calc(0.45rem + env(safe-area-inset-bottom)); display: flex; align-items: center; gap: 0.6rem; }
  .support-chaos h3 { margin: 0; font-size: 1.05rem; white-space: nowrap; }
  .support-chaos p { display: none; }
  .support-chaos .sc-buttons { flex: 1; flex-wrap: nowrap; }
  .support-chaos a.sc-btn { padding: 0.25rem 0.5rem; font-size: 0.9rem; }
  body { padding-bottom: 3.6rem; }
}
`

export const SupportChaos = (opts) => {
  const Comp = ({ displayClass }) =>
    h("div", { class: `support-chaos ${displayClass ?? ""}` },
      h("h3", null, "Support the Chaos"),
      h("p", null, "Keep the Dread Fortress standing. Join us on Patreon, or toss a coin to Bad Guys Studios on Ko-fi."),
      h("div", { class: "sc-buttons" },
        h("a", { class: "sc-btn sc-patreon external", href: PATREON, target: "_blank", rel: "noopener" }, "Patreon"),
        h("a", { class: "sc-btn sc-kofi external", href: KOFI, target: "_blank", rel: "noopener" }, "Ko-fi"),
      ),
    )
  Comp.css = css
  return Comp
}
