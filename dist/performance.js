// ─── Types ────────────────────────────────────────────────────────────────────
// ─── rAF-throttled scroll handler ─────────────────────────────────────────────
export function createRafScrollHandler(callback) {
    let pending = false;
    return () => {
        if (!pending) {
            pending = true;
            requestAnimationFrame(() => {
                callback();
                pending = false;
            });
        }
    };
}
// ─── Lazy-load card images via IntersectionObserver ───────────────────────────
export function initLazyImages() {
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            const img = entry.target;
            const src = img.dataset['src'];
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
            imgObserver.unobserve(img);
        });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('img[data-src]').forEach((img) => imgObserver.observe(img));
}
// ─── Re-observe after grid re-renders ─────────────────────────────────────────
export function initLazyImageReobserver() {
    window.addEventListener('tabla:grid-rendered', () => {
        initLazyImages();
    });
}
// ─── Init ─────────────────────────────────────────────────────────────────────
export function initPerformance() {
    initLazyImages();
    initLazyImageReobserver();
}
initPerformance();
