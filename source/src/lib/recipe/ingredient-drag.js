import { listRowIdsForGroup, normalizeIngredientGroups } from "../../shared/ingredients-utils.js";
import { writeIngredientState } from "./ingredient-mutations.js";

/**
 * @param {HTMLElement} listHost
 * @param {*} mb
 * @param {string} path
 * @param {() => { groups: unknown, ingredients: Record<string, unknown> }} getState
 * @param {() => void} onRefresh
 */
export function attachIngredientListDrag(listHost, mb, path, getState, onRefresh) {
    /** @type {string | null} */
    let draggedGroupId = null;
    /** @type {string | null} */
    let draggedRowId = null;

    listHost.addEventListener("dragstart", (e) => {
        const el = /** @type {HTMLElement} */ (e.target);
        const panel = el.closest("[data-group-panel]");
        const row = el.closest("[data-ingredient-row-id]");
        if (row?.dataset.ingredientRowId) {
            draggedRowId = row.dataset.ingredientRowId;
            draggedGroupId = null;
            e.stopPropagation();
            return;
        }
        if (panel?.dataset.groupPanel) {
            draggedGroupId = panel.dataset.groupPanel;
            draggedRowId = null;
        }
    });

    listHost.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    listHost.addEventListener("drop", (e) => {
        e.preventDefault();
        const { groups, ingredients } = getState();
        const dropPanel = /** @type {HTMLElement} */ (e.target).closest("[data-group-panel]");
        const dropRow = /** @type {HTMLElement} */ (e.target).closest("[data-ingredient-row-id]");

        if (draggedGroupId && dropPanel?.dataset.groupPanel) {
            applyGroupReorder(mb, path, groups, ingredients, draggedGroupId, dropPanel.dataset.groupPanel);
            onRefresh();
        } else if (draggedRowId && dropRow?.dataset.ingredientRowId) {
            const targetGroupId =
                dropPanel?.dataset.groupPanel ??
                dropRow.closest("[data-group-panel]")?.dataset.groupPanel;
            applyRowReorder(
                mb,
                path,
                groups,
                ingredients,
                draggedRowId,
                dropRow.dataset.ingredientRowId,
                targetGroupId
            );
            onRefresh();
        }

        draggedGroupId = null;
        draggedRowId = null;
    });
}

function applyGroupReorder(mb, path, groups, ingredients, fromId, toId) {
    const list = normalizeIngredientGroups(groups);
    const from = list.findIndex((g) => g.id === fromId);
    const to = list.findIndex((g) => g.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    list.forEach((g, i) => {
        g.order = i;
    });
    writeIngredientState(mb, path, { groups: list, ingredients });
}

function applyRowReorder(mb, path, groups, ingredients, draggedId, targetId, targetGroupId) {
    const next = JSON.parse(JSON.stringify(ingredients));
    const dragged = next[draggedId];
    if (!dragged || !targetGroupId) return;

    dragged.group_id = targetGroupId;
    const ids = listRowIdsForGroup(next, targetGroupId).filter((id) => id !== draggedId);
    const targetIdx = ids.indexOf(targetId);
    const ordered = [...ids];
    if (targetIdx >= 0) {
        ordered.splice(targetIdx, 0, draggedId);
    } else {
        ordered.push(draggedId);
    }
    ordered.forEach((id, i) => {
        if (next[id]) next[id].order = i;
    });
    writeIngredientState(mb, path, { groups: normalizeIngredientGroups(groups), ingredients: next });
}
