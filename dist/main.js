import './nav-hero';
import './toast';
import './grid';
import './review';
import './globe';
import './shortcuts';
import './accessibility';
import { createRafScrollHandler } from './performance';
import './performance';
import './responsive';
import './integration';
// ─── Config ───────────────────────────────────────────────────────────────────
// Inspected actual files: ezgif-frame-001.jpg … (3-digit, 1-indexed)
// sequence-1 → 164 frames   sequence-2 → 225 frames
const CONFIG = {
    seq1Dir: 'folder1/sequence-1/',
    seq2Dir: 'folder1/sequence-2/',
    seq1Total: 164,
    seq2Total: 225,
    // Files are 1-indexed with 3-digit zero-padding: ezgif-frame-001.jpg
    filenameFn: (dir, i) => `${dir}ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`,
};
// ─── Scroll budget ────────────────────────────────────────────────────────────
const VH = window.innerHeight;
const PHASE_SEQ1 = { start: 0, end: VH * 5 };
const PHASE_BLUR = { start: VH * 5, end: VH * 7 };
const PHASE_SEQ2 = { start: VH * 7, end: VH * 12 };
// ─── DOM refs ─────────────────────────────────────────────────────────────────
const spacer = document.getElementById('cinematic-spacer');
const canvas = document.getElementById('cinematic-canvas');
const preloadFill = document.getElementById('preload-fill');
const preloadBar = document.getElementById('preload-bar');
const skipBtn = document.getElementById('skip-btn');
const blurInterlude = document.getElementById('blur-interlude');
const blurQuote = blurInterlude.querySelector('blockquote');
const seq1Overlay = document.getElementById('seq1-overlay');
const wordmark = seq1Overlay.querySelector('.wordmark');
const tagline = seq1Overlay.querySelector('.tagline');
const seq2Overlay = document.getElementById('seq2-overlay');
const discoverText = seq2Overlay.querySelector('.seq2-discover');
const citiesText = seq2Overlay.querySelector('.seq2-cities');
const exploreBtn = document.getElementById('explore-btn');
const mainApp = document.getElementById('main-app');
const ctx = canvas.getContext('2d');
// ─── Frame stores ─────────────────────────────────────────────────────────────
const seq1Frames = [];
const seq2Frames = [];
// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function phaseProgress(scrollY, phase) {
    return clamp((scrollY - phase.start) / (phase.end - phase.start), 0, 1);
}
function setOpacity(el, opacity) {
    el.style.opacity = String(opacity);
}
function revealMainApp() {
    canvas.style.transition = 'opacity 800ms ease';
    canvas.style.opacity = '0';
    seq1Overlay.style.display = 'none';
    seq2Overlay.style.display = 'none';
    blurInterlude.style.opacity = '0';
    blurInterlude.style.pointerEvents = 'none';
    setTimeout(() => {
        canvas.style.display = 'none';
        spacer.style.display = 'none';
        mainApp.style.display = 'block';
    }, 800);
}
// ─── Canvas sizing ────────────────────────────────────────────────────────────
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
spacer.style.height = `${PHASE_SEQ2.end + VH}px`;
// ─── Preload ──────────────────────────────────────────────────────────────────
function loadFrames(dir, total, store, filenameFn, onProgress) {
    return new Promise((resolve) => {
        if (total === 0) {
            resolve();
            return;
        }
        let loaded = 0;
        for (let i = 0; i < total; i++) {
            const img = new Image();
            img.src = filenameFn(dir, i);
            img.onload = img.onerror = () => {
                loaded++;
                onProgress(loaded, total);
                if (loaded === total)
                    resolve();
            };
            store.push(img);
        }
    });
}
async function preload() {
    const totalFrames = CONFIG.seq1Total + CONFIG.seq2Total;
    let globalLoaded = 0;
    let successCount = 0;
    const onProgress = (_loaded, _total) => {
        globalLoaded++;
        const pct = totalFrames > 0
            ? (globalLoaded / totalFrames) * 100
            : 100;
        preloadFill.style.width = `${pct}%`;
    };
    // Track successes so we can detect when frames don't exist
    function loadFramesTracked(dir, total, store, filenameFn, onProg) {
        return new Promise((resolve) => {
            if (total === 0) {
                resolve();
                return;
            }
            let loaded = 0;
            for (let i = 0; i < total; i++) {
                const img = new Image();
                img.src = filenameFn(dir, i);
                img.onload = () => { successCount++; loaded++; onProg(loaded, total); if (loaded === total)
                    resolve(); };
                img.onerror = () => { loaded++; onProg(loaded, total); if (loaded === total)
                    resolve(); };
                store.push(img);
            }
        });
    }
    await Promise.all([
        loadFramesTracked(CONFIG.seq1Dir, CONFIG.seq1Total, seq1Frames, CONFIG.filenameFn, onProgress),
        loadFramesTracked(CONFIG.seq2Dir, CONFIG.seq2Total, seq2Frames, CONFIG.filenameFn, onProgress),
    ]);
    preloadBar.style.opacity = '0';
    setTimeout(() => { preloadBar.style.display = 'none'; }, 400);
    // ── Auto-skip if no frame images exist (missing folder1/ assets) ──────────
    if (successCount === 0) {
        introComplete = true;
        revealMainApp();
        window.dispatchEvent(new CustomEvent('tabla:skip-intro'));
        return;
    }
    window.addEventListener('scroll', createRafScrollHandler(onScroll), { passive: true });
    onScroll(); // draw first frame immediately
}
// ─── Scroll handler ───────────────────────────────────────────────────────────
let introComplete = false;
function onScroll() {
    if (introComplete)
        return;
    const scrollY = window.scrollY;
    // ── Phase 1: Sequence 1 ──────────────────────────────────────────────────
    if (scrollY < PHASE_BLUR.start) {
        seq2Overlay.style.display = 'none';
        blurInterlude.style.opacity = '0';
        blurInterlude.style.pointerEvents = 'none';
        const p = phaseProgress(scrollY, PHASE_SEQ1);
        const frameIdx = Math.min(Math.floor(p * (CONFIG.seq1Total - 1)), CONFIG.seq1Total - 1);
        if (seq1Frames[frameIdx]?.complete && seq1Frames[frameIdx].naturalWidth > 0) {
            ctx.drawImage(seq1Frames[frameIdx], 0, 0, canvas.width, canvas.height);
        }
        seq1Overlay.style.display = 'flex';
        setOpacity(wordmark, p > 0.35 ? 1 : 0);
        setOpacity(tagline, p > 0.65 ? 1 : 0);
    }
    // ── Phase 2: Blur interlude ──────────────────────────────────────────────
    else if (scrollY < PHASE_SEQ2.start) {
        seq1Overlay.style.display = 'none';
        seq2Overlay.style.display = 'none';
        const p = phaseProgress(scrollY, PHASE_BLUR);
        const interludeOpacity = p < 0.5 ? p * 2 : (1 - p) * 2;
        blurInterlude.style.opacity = String(interludeOpacity);
        blurInterlude.style.pointerEvents = p > 0.1 ? 'auto' : 'none';
        blurQuote.style.opacity = p > 0.3 && p < 0.7 ? '1' : '0';
        blurQuote.style.transform = p > 0.3 ? 'translateY(0)' : 'translateY(16px)';
    }
    // ── Phase 3: Sequence 2 ──────────────────────────────────────────────────
    else {
        seq1Overlay.style.display = 'none';
        blurInterlude.style.opacity = '0';
        blurInterlude.style.pointerEvents = 'none';
        const p = phaseProgress(scrollY, PHASE_SEQ2);
        const frameIdx = Math.min(Math.floor(p * (CONFIG.seq2Total - 1)), CONFIG.seq2Total - 1);
        if (seq2Frames[frameIdx]?.complete && seq2Frames[frameIdx].naturalWidth > 0) {
            ctx.drawImage(seq2Frames[frameIdx], 0, 0, canvas.width, canvas.height);
        }
        seq2Overlay.style.display = 'flex';
        setOpacity(discoverText, p > 0.30 ? 1 : 0);
        setOpacity(citiesText, p > 0.65 ? 1 : 0);
        setOpacity(exploreBtn, p > 0.88 ? 1 : 0);
        exploreBtn.style.pointerEvents = p > 0.88 ? 'all' : 'none';
        if (p >= 1) {
            introComplete = true;
            revealMainApp();
        }
    }
}
// ─── Skip button ──────────────────────────────────────────────────────────────
skipBtn.addEventListener('click', () => {
    introComplete = true;
    window.scrollTo({ top: PHASE_SEQ2.end + VH });
    revealMainApp();
    window.dispatchEvent(new CustomEvent('tabla:skip-intro'));
});
// ─── Explore Now button ───────────────────────────────────────────────────────
exploreBtn.addEventListener('click', () => {
    introComplete = true;
    revealMainApp();
    window.dispatchEvent(new CustomEvent('tabla:explore-now'));
    setTimeout(() => {
        mainApp.scrollIntoView({ behavior: 'smooth' });
    }, 100);
});
// ─── Boot ─────────────────────────────────────────────────────────────────────
preload();
