// ─── Types ────────────────────────────────────────────────────────────────────

interface LazyImage extends HTMLImageElement {
    dataset: DOMStringMap & { src?: string };
}

// ─── rAF-throttled scroll handler ─────────────────────────────────────────────

export function createRafScrollHandler(callback: () => void): () => void {
    let pending = false;
    return (): void => {
        if (!pending) {
            pending = true;
            requestAnimationFrame((): void => {
                callback();
                pending = false;
            });
        }
    };
}

// ─── Lazy-load card images via IntersectionObserver ───────────────────────────

export function initLazyImages(): void {
    const imgObserver = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]): void => {
            entries.forEach((entry: IntersectionObserverEntry): void => {
                if (!entry.isIntersecting) return;
                const img = entry.target as LazyImage;
                const src: string | undefined = img.dataset['src'];
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                imgObserver.unobserve(img);
            });
        },
        { rootMargin: '200px 0px' }, // preload 200px before entering viewport
    );

    document.querySelectorAll<LazyImage>('img[data-src]').forEach(
        (img: LazyImage): void => imgObserver.observe(img)
    );
}

// ─── Re-observe after grid re-renders ─────────────────────────────────────────

export function initLazyImageReobserver(): void {
    window.addEventListener('tabla:grid-rendered', (): void => {
        initLazyImages();
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initPerformance(): void {
    initLazyImages();
    initLazyImageReobserver();
}

initPerformance();
