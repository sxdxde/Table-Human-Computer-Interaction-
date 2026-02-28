// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Breakpoint detection ─────────────────────────────────────────────────────
export function getBreakpoint() {
    const w = window.innerWidth;
    if (w <= 480)
        return 'mobile';
    if (w <= 768)
        return 'tablet';
    return 'desktop';
}
// ─── Search bar mobile layout ─────────────────────────────────────────────────
function applySearchBarLayout(bp) {
    const searchBar = document.getElementById('search-container');
    const locationPill = document.querySelector('.location-pill');
    const divider = document.querySelector('.search-divider');
    if (!searchBar || !locationPill || !divider)
        return;
    if (bp === 'mobile') {
        searchBar.style.flexWrap = 'wrap';
        locationPill.style.width = '100%';
        locationPill.style.borderRadius = '40px 40px 0 0';
        divider.style.display = 'none';
    }
    else {
        searchBar.style.flexWrap = '';
        locationPill.style.width = '';
        locationPill.style.borderRadius = '';
        divider.style.display = '';
    }
}
// ─── Canvas — always fills viewport on resize ─────────────────────────────────
function applyCanvasResize() {
    const canvas = document.getElementById('cinematic-canvas');
    if (!canvas)
        return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
// ─── Shortcuts panel — position adapts on mobile ─────────────────────────────
function applyShortcutsPanelPosition(bp) {
    const panel = document.getElementById('shortcuts-panel');
    if (!panel)
        return;
    if (bp === 'mobile') {
        panel.style.right = '0.5rem';
        panel.style.bottom = '5rem';
        panel.style.width = 'calc(100vw - 1rem)';
    }
    else {
        panel.style.right = '2rem';
        panel.style.bottom = '5.5rem';
        panel.style.width = '280px';
    }
}
// ─── ResizeObserver — react to viewport changes ───────────────────────────────
export function initResponsive() {
    function update() {
        const bp = getBreakpoint();
        applySearchBarLayout(bp);
        applyCanvasResize();
        applyShortcutsPanelPosition(bp);
        document.documentElement.dataset['bp'] = bp;
    }
    update();
    window.addEventListener('resize', update, { passive: true });
}
initResponsive();
