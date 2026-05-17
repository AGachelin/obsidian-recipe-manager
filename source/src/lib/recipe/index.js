/** Barrel for `lib/recipe/` — stable imports from within the vault source tree. */
export { RecipeRenderer } from "./recipe-renderer.js";
export { buildRecipeBindSnapshot, assignDurationLabels } from "./bind-sync.js";
export {
    readRecipeLiveMetadata,
    isRecipeViewMode,
    attachRecipeLiveSubscriptions,
} from "./metadata.js";
export * from "./meta-readers.js";
