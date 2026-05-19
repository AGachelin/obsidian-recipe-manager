# UI components

Field widgets used by live page renderers (`RecipeRenderer`, `FrontpageRenderer`).

## Contract

1. **Constructor** — capture the note `path` (and optional defaults).
2. **`generate(mb, …)`** — create Meta Bind mountables; cache `lastView` / values when inputs support edit vs read.
3. **`layoutMDRC(mb, parent, view, …)`** or **`mount(parent, mb, component)`** — return layout steps or mount DOM under `parent`.

Shared DOM helpers: `src/lib/render/mdrc-layout.js` (`applyMdrcLayoutSteps`, `wrapMdrcInDedicatedMount`).

Layout class names: `src/shared/constants/recipe-ui.js` (`RECIPE_LAYOUT`), `frontpage-ui.js` (`FRONTPAGE_LAYOUT`).

## Languages

User-visible strings go in `src/shared/i18n/labels.js` (`getUILabels`, `getFrontpageLabels`, …). Pass `lang` (`"en"` | `"fr"`) from the renderer into widgets that show labels.
