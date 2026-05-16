/**
 * Builds a labelled section whose body can collapse.
 *
 * @param {HTMLElement} parent
 * @param {string} title
 * @param {boolean} [startOpen=true]
 * @param {string} [contentClass='']
 */
export function mountCollapsibleSection(parent, title, startOpen = true, contentClass = "") {
    const section = parent.createEl("section", { cls: "frontpage-live__section" });
    const header = section.createEl("div", { cls: "frontpage-live__section-header" });
    const toggleHeading = header.createEl("h3", {
        cls: "frontpage-live__section-title frontpage-live__section-toggle",
        attr: { "aria-expanded": String(startOpen) },
        text: title,
    });

    const baseClasses = ["frontpage-live__section-content"];
    if (!startOpen) {
        baseClasses.push("is-collapsed");
    }
    if (contentClass) {
        baseClasses.push(contentClass);
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
 * Wraps sidebar inner content behind a clickable title with collapse.
 *
 * @param {HTMLElement} sidebar
 * @param {string} titleText
 * @param {boolean} [startOpen=true]
 * @returns {HTMLElement} Wrapper for collapsible sidebar body
 */
export function mountCollapsibleSidebar(sidebar, titleText, startOpen = true) {
    const header = sidebar.createEl("div", { cls: "frontpage-live__sidebar-header" });
    const toggleHeading = header.createEl("h2", {
        cls: "frontpage-live__sidebar-title frontpage-live__section-title frontpage-live__sidebar-toggle",
        attr: { "aria-expanded": String(startOpen) },
        text: titleText,
    });

    const content = sidebar.createEl("div", { cls: "frontpage-live__sidebar-content" });
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
