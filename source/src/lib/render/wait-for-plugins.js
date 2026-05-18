/** @typedef {import("obsidian").App} ObsidianApp */

export const META_BIND_PLUGIN_ID = "obsidian-meta-bind-plugin";

/**
 * Poll until a community plugin exposes `.api` (Meta Bind, etc.).
 * @param {ObsidianApp} app
 * @param {string} pluginId
 * @param {{ intervalMs?: number; timeoutMs?: number }} [options]
 */
export async function waitForPluginApi(engine, pluginId, { intervalMs = 50, timeoutMs = 30000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    const app = engine.app;
    while (Date.now() < deadline) {
        const plugin = app?.plugins?.plugins?.[pluginId];
        if (plugin?.api && engine?.plugin?.initiated) {
            return plugin.api;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Plugin "${pluginId}" did not load within ${timeoutMs}ms`);
}

/**
 * @param {*} engine js-engine `engine` (needs `engine.app`).
 */
export async function waitForMetaBind(engine) {
    return waitForPluginApi(engine, META_BIND_PLUGIN_ID);
}
