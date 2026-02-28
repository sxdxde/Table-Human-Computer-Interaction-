// ─── Types ────────────────────────────────────────────────────────────────────
// ─── DOM refs ─────────────────────────────────────────────────────────────────
const globeSection = document.querySelector('.globe-section');
const globeVideo = document.getElementById('globe-video');
// ─── IntersectionObserver — lazy play + entrance animation ───────────────────
export function initGlobe() {
    if (!globeSection || !globeVideo)
        return;
    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
            globeSection.classList.add('visible');
            globeVideo.play().catch(() => {
                // Autoplay blocked — silently ignore; loop will retry on user interaction
            });
            observer.disconnect(); // one-shot
        }
    }, { threshold: 0.3 });
    observer.observe(globeSection);
    // Fallback: if video fails to load, replace with animated placeholder
    globeVideo.addEventListener('error', () => {
        globeVideo.remove();
        const fallback = document.createElement('div');
        fallback.className = 'globe-fallback';
        fallback.setAttribute('aria-hidden', 'true');
        globeSection.prepend(fallback);
    });
}
initGlobe();
