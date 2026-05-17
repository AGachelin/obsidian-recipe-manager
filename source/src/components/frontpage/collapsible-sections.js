import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";

/**
 * @param {HTMLElement} parent
 * @param {string} title
 * @param {boolean} [startOpen=true]
 * @param {string} [extraContentClasses='']
 */
export function mountCollapsibleSection(parent, title, startOpen = true, extraContentClasses = "") {
    const section = parent.createEl("section", { cls: FRONTPAGE_LAYOUT.section });
    const header = section.createEl("div", { cls: FRONTPAGE_LAYOUT.sectionHeader });
    const toggleHeading = header.createEl("h3", {
        cls: `${FRONTPAGE_LAYOUT.sectionTitle} ${FRONTPAGE_LAYOUT.sectionToggle}`,
        attr: { "aria-expanded": String(startOpen) },
        text: title,
    });

    const baseClasses = [FRONTPAGE_LAYOUT.sectionContent];
    if (!startOpen) {
        baseClasses.push("is-collapsed");
    }
    if (extraContentClasses) {
        baseClasses.push(extraContentClasses);
    }
    const content = section.createEl("div", { cls: baseClasses.join(" ") });

    toggleHeading.addEventListener("click", () => {
        const willBecomeOpen = content.classList.contains("is-collapsed");
        content.classList.toggle("is-collapsed");
        toggleHeading.setAttribute("aria-expanded", String(willBecomeOpen));
    });

    return content;
}

/**
 * @param {HTMLElement} sidebar
 * @param {string} titleText
 * @param {boolean} [startOpen=true]
 * @returns {HTMLElement}
 */
export function mountCollapsibleSidebar(sidebar, titleText, startOpen = true) {
    const header = sidebar.createEl("div", { cls: FRONTPAGE_LAYOUT.sidebarHeader });
    const toggleHeading = header.createEl("h2", {
        cls: `${FRONTPAGE_LAYOUT.sidebarTitle} ${FRONTPAGE_LAYOUT.sectionTitle} ${FRONTPAGE_LAYOUT.sidebarToggle}`,
        attr: { "aria-expanded": String(startOpen) },
        text: titleText,
    });

    const content = sidebar.createEl("div", { cls: FRONTPAGE_LAYOUT.sidebarContent });
    if (!startOpen) {
        content.classList.add("is-collapsed");
    }

    toggleHeading.addEventListener("click", () => {
        const willBecomeOpen = content.classList.contains("is-collapsed");
        content.classList.toggle("is-collapsed");
        toggleHeading.setAttribute("aria-expanded", String(willBecomeOpen));
    });

    return content;
}
