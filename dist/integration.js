import { showToast } from './toast';
import { updateFavBadge } from './nav-hero';
const FILTERS_KEY = 'tabla_last_filters';
const RECENT_KEY = 'tabla_recent_searches';
const MAX_RECENT = 5;
const SEARCH_SKELETON_MS = 400;
// ─── 1. SEARCH → GRID ────────────────────────────────────────────────────────
function initSearchToGrid() {
    const searchInput = document.getElementById('main-search');
    const searchSubmit = document.querySelector('.search-submit');
    const resultsGrid = document.getElementById('results-grid');
    const skeletonGrid = document.getElementById('skeleton-grid');
    const activeFilters = document.getElementById('active-filters');
    function submitSearch(query) {
        if (!query.trim())
            return;
        saveRecentSearch(query.trim());
        // Show skeleton for SEARCH_SKELETON_MS
        skeletonGrid.hidden = false;
        resultsGrid.hidden = true;
        // Show active filter chip for search term
        const existingChip = activeFilters.querySelector('[data-search]');
        if (existingChip)
            existingChip.remove();
        const chip = document.createElement('span');
        chip.className = 'filter-chip-active';
        chip.dataset['search'] = 'true';
        chip.innerHTML = `Search: ${query}
      <button class="chip-remove" aria-label="Clear search filter">✕</button>`;
        chip.querySelector('.chip-remove').addEventListener('click', () => {
            chip.remove();
            searchInput.value = '';
            window.dispatchEvent(new CustomEvent('tabla:search', { detail: { query: '' } }));
        });
        activeFilters.prepend(chip);
        setTimeout(() => {
            skeletonGrid.hidden = true;
            resultsGrid.hidden = false;
            window.dispatchEvent(new CustomEvent('tabla:search', { detail: { query } }));
        }, SEARCH_SKELETON_MS);
    }
    searchSubmit?.addEventListener('click', () => {
        submitSearch(searchInput.value);
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitSearch(searchInput.value);
        }
    });
}
// ─── 3. HEART SAVE → NAV BADGE (restore on page load) ────────────────────────
function initFavBadgeRestore() {
    try {
        const favs = JSON.parse(localStorage.getItem('tabla_favorites') ?? '[]');
        updateFavBadge(favs.length);
    }
    catch {
        updateFavBadge(0);
    }
}
// ─── 4. EXPLORE NOW → SMOOTH SCROLL + FOCUS SEARCH ──────────────────────────
function initExploreNowWiring() {
    window.addEventListener('tabla:explore-now', () => {
        const exploreSection = document.getElementById('explore');
        const mainSearch = document.getElementById('main-search');
        exploreSection?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { mainSearch?.focus(); }, 600);
    });
}
// ─── 5. SKIP BUTTON → JUMP TO APP + FOCUS SEARCH ────────────────────────────
function initSkipWiring() {
    window.addEventListener('tabla:skip-intro', () => {
        const mainSearch = document.getElementById('main-search');
        setTimeout(() => { mainSearch?.focus(); }, 100);
    });
}
// ─── 6. RECENT SEARCHES ───────────────────────────────────────────────────────
function saveRecentSearch(term) {
    try {
        const store = {
            terms: JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'),
        };
        store.terms = store.terms.filter((t) => t !== term);
        store.terms.unshift(term);
        store.terms = store.terms.slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(store.terms));
    }
    catch { /* quota */ }
}
// ─── 7. FILTER STATE PERSISTENCE ─────────────────────────────────────────────
function saveFilterState(filters) {
    try {
        localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    }
    catch { /* quota */ }
}
function restoreFilterState() {
    try {
        const raw = localStorage.getItem(FILTERS_KEY);
        if (!raw)
            return;
        const saved = JSON.parse(raw);
        // Restore quick filter button
        if (saved.quick && saved.quick !== 'all') {
            const btn = document.querySelector(`.filter-btn[data-filter="${saved.quick}"]`);
            if (btn) {
                document.querySelectorAll('.filter-btn').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                window.dispatchEvent(new CustomEvent('tabla:restore-filter', { detail: { quick: saved.quick } }));
            }
        }
        // Restore price filter
        if (saved.price !== null) {
            const priceBtn = document.querySelector(`.price-btn[data-price="${saved.price}"]`);
            if (priceBtn) {
                priceBtn.classList.add('active');
                priceBtn.setAttribute('aria-pressed', 'true');
            }
        }
        // Restore distance slider
        if (saved.maxDist && saved.maxDist < 20) {
            const slider = document.getElementById('distance-slider');
            const distVal = document.getElementById('distance-val');
            if (slider && distVal) {
                slider.value = String(saved.maxDist);
                distVal.textContent = String(saved.maxDist);
                slider.setAttribute('aria-valuetext', `${saved.maxDist} km`);
            }
        }
    }
    catch { /* malformed storage */ }
}
function initFilterPersistence() {
    window.addEventListener('tabla:filter-changed', ((e) => {
        saveFilterState(e.detail);
    }));
    // Restore after DOM settles
    setTimeout(restoreFilterState, 300);
}
// ─── 8. AUTOSAVE INDICATOR IN REVIEW FORM ────────────────────────────────────
function initAutosaveIndicator() {
    const textarea = document.getElementById('review-text');
    if (!textarea)
        return;
    const indicator = document.createElement('p');
    indicator.id = 'draft-saved-label';
    indicator.className = 'draft-saved-label';
    indicator.textContent = '';
    indicator.setAttribute('aria-live', 'polite');
    textarea.parentElement?.appendChild(indicator);
    let hideTimer = null;
    window.addEventListener('tabla:draft-saved', () => {
        indicator.textContent = 'Draft saved';
        indicator.classList.add('visible');
        if (hideTimer !== null)
            clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            indicator.classList.remove('visible');
        }, 2000);
    });
}
// ─── Init ─────────────────────────────────────────────────────────────────────
export function initIntegration() {
    initSearchToGrid();
    initFavBadgeRestore();
    initExploreNowWiring();
    initSkipWiring();
    initFilterPersistence();
    initAutosaveIndicator();
    // Welcome toast on first visit
    const isFirstVisit = !localStorage.getItem('tabla_visited');
    if (isFirstVisit) {
        localStorage.setItem('tabla_visited', '1');
        setTimeout(() => {
            showToast({
                message: 'Welcome to Tabla — discover great restaurants near you.',
                type: 'info',
                duration: 5000,
            });
        }, 1200);
    }
}
initIntegration();
