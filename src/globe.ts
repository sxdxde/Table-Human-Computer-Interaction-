// ─── Types ────────────────────────────────────────────────────────────────────

interface GlobeObserverEntry extends IntersectionObserverEntry {
    target: Element;
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const globeSection = document.querySelector<HTMLElement>('.globe-section');
const globeVideo = document.getElementById('globe-video') as HTMLVideoElement | null;

// ─── IntersectionObserver — lazy play + entrance animation ───────────────────

export function initGlobe(): void {
    if (!globeSection || !globeVideo) return;

    const observer = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]): void => {
            const entry: GlobeObserverEntry = entries[0] as GlobeObserverEntry;
            if (entry.isIntersecting) {
                globeSection.classList.add('visible');
                globeVideo.play().catch((): void => {
                    // Autoplay blocked — silently ignore; loop will retry on user interaction
                });
                observer.disconnect(); // one-shot
            }
        },
        { threshold: 0.3 },
    );

    observer.observe(globeSection);

    // Fallback: if video fails to load, replace with animated placeholder
    globeVideo.addEventListener('error', (): void => {
        globeVideo.remove();
        const fallback = document.createElement('div');
        fallback.className = 'globe-fallback';
        fallback.setAttribute('aria-hidden', 'true');
        globeSection.prepend(fallback);
    });
}

initGlobe();
