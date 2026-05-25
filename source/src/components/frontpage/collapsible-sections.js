import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";

/** @typedef {'frontpage' | 'recipe' | 'compact'} CollapsibleSectionVariant */

/**
 * @param {CollapsibleSectionVariant} variant
 */
function collapsibleClasses(variant) {
    if (variant === "recipe") {
        return {
            section: RECIPE_LAYOUT.collapsibleSection,
            header: RECIPE_LAYOUT.collapsibleHeader,
            title: `${RECIPE_LAYOUT.collapsibleTitle} ${RECIPE_LAYOUT.collapsibleToggle}`,
            content: RECIPE_LAYOUT.collapsibleContent,
        };
    }
    if (variant === "compact") {
        return {
            section: RECIPE_LAYOUT.collapsibleSectionCompact,
            header: RECIPE_LAYOUT.collapsibleHeaderCompact,
            title: `${RECIPE_LAYOUT.collapsibleTitleCompact} ${RECIPE_LAYOUT.collapsibleToggle}`,
            content: RECIPE_LAYOUT.collapsibleContentCompact,
        };
    }
    return {
        section: FRONTPAGE_LAYOUT.section,
        header: FRONTPAGE_LAYOUT.sectionHeader,
        title: `${FRONTPAGE_LAYOUT.sectionTitle} ${FRONTPAGE_LAYOUT.sectionToggle}`,
        content: FRONTPAGE_LAYOUT.sectionContent,
    };
}

/**
 * @param {HTMLElement} parent
 * @param {string} title
 * @param {boolean} [startOpen=true]
 * @param {string} [extraContentClasses='']
 * @param {{ variant?: CollapsibleSectionVariant }} [options]
 * @returns {HTMLElement}
 */
export function mountCollapsibleSection(
    parent,
    title,
    startOpen = true,
    extraContentClasses = "",
    options = {}
) {
    const variant = options.variant ?? "frontpage";
    const cls = collapsibleClasses(variant);
    const section = parent.createEl("section", { cls: cls.section });
    const header = section.createEl("div", { cls: cls.header });
    const toggleHeading = header.createEl("h3", {
        cls: cls.title,
        attr: { "aria-expanded": String(startOpen), role: "button", tabindex: "0" },
        text: title,
    });

    const baseClasses = [cls.content];
    if (!startOpen) {
        baseClasses.push("is-collapsed");
    }
    if (extraContentClasses) {
        baseClasses.push(extraContentClasses);
    }
    const content = section.createEl("div", { cls: baseClasses.join(" ") });

    const toggle = () => {
        const willBecomeOpen = content.classList.contains("is-collapsed");
        content.classList.toggle("is-collapsed");
        toggleHeading.setAttribute("aria-expanded", String(willBecomeOpen));
    };

    toggleHeading.addEventListener("click", toggle);
    toggleHeading.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
        }
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
