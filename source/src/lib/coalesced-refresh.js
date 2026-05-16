/**
 * Coalesce rapid metadata notifications into one refresh per microtask queue flush.
 *
 * @param {() => void} refresh
 * @returns {{ schedule(): void }}
 */
export function createCoalescedScheduler(refresh) {
    let coalescing = false;
    return {
        schedule() {
            if (coalescing) return;
            coalescing = true;
            queueMicrotask(() => {
                coalescing = false;
                void refresh();
            });
        },
    };
}
