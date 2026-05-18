export function disableScrollToChange(container){
    container.addEventListener('wheel', () => {
        const el = document.activeElement;

        if (
            container.contains(el) &&
            el instanceof HTMLInputElement &&
            el.type === 'number'
        ) {
            el.blur();
        }
        }, { passive: true });
};