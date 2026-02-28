import { showToast } from './toast';
import { updateFavBadge } from './nav-hero';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedFilters {
    quick: string;
    price: number | null;
    cuisine: string;
    maxDist: number;
}

interface RecentSearchStore {
    terms: string[];
}

const FILTERS_KEY = 'tabla_last_filters';
const RECENT_KEY = 'tabla_recent_searches';
const MAX_RECENT = 5;
const SEARCH_SKELETON_MS = 400;

// ─── 1. SEARCH → GRID ────────────────────────────────────────────────────────

function initSearchToGrid(): void {
    const searchInput = document.getElementById('main-search') as HTMLInputElement;
    const searchSubmit = document.querySelector<HTMLButtonElement>('.search-submit');
    const resultsGrid = document.getElementById('results-grid') as HTMLDivElement;
    const skeletonGrid = document.getElementById('skeleton-grid') as HTMLDivElement;
    const activeFilters = document.getElementById('active-filters') as HTMLDivElement;

    function submitSearch(query: string): void {
        if (!query.trim()) return;
        saveRecentSearch(query.trim());

        // Show skeleton for SEARCH_SKELETON_MS
        skeletonGrid.hidden = false;
        resultsGrid.hidden = true;

        // Show active filter chip for search term
        const existingChip = activeFilters.querySelector<HTMLElement>('[data-search]');
        if (existingChip) existingChip.remove();

        const chip = document.createElement('span');
        chip.className = 'filter-chip-active';
        chip.dataset['search'] = 'true';
        chip.innerHTML = `Search: ${query}
      <button class="chip-remove" aria-label="Clear search filter">✕</button>`;
        chip.querySelector('.chip-remove')!.addEventListener('click', (): void => {
            chip.remove();
            searchInput.value = '';
            window.dispatchEvent(new CustomEvent('tabla:search', { detail: { query: '' } }));
        });
        activeFilters.prepend(chip);

        setTimeout((): void => {
            skeletonGrid.hidden = true;
            resultsGrid.hidden = false;
            window.dispatchEvent(
                new CustomEvent<{ query: string }>('tabla:search', { detail: { query } })
            );
        }, SEARCH_SKELETON_MS);
    }

    searchSubmit?.addEventListener('click', (): void => {
        submitSearch(searchInput.value);
    });

    searchInput.addEventListener('keydown', (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitSearch(searchInput.value);
        }
    });
}

// ─── 3. HEART SAVE → NAV BADGE (restore on page load) ────────────────────────

function initFavBadgeRestore(): void {
    try {
        const favs: number[] = JSON.parse(
            localStorage.getItem('tabla_favorites') ?? '[]'
        ) as number[];
        updateFavBadge(favs.length);
    } catch {
        updateFavBadge(0);
    }
}

// ─── 4. EXPLORE NOW → SMOOTH SCROLL + FOCUS SEARCH ──────────────────────────

function initExploreNowWiring(): void {
    window.addEventListener('tabla:explore-now', (): void => {
        const exploreSection = document.getElementById('explore') as HTMLElement | null;
        const mainSearch = document.getElementById('main-search') as HTMLInputElement | null;
        exploreSection?.scrollIntoView({ behavior: 'smooth' });
        setTimeout((): void => { mainSearch?.focus(); }, 600);
    });
}

// ─── 5. SKIP BUTTON → JUMP TO APP + FOCUS SEARCH ────────────────────────────

function initSkipWiring(): void {
    window.addEventListener('tabla:skip-intro', (): void => {
        const mainSearch = document.getElementById('main-search') as HTMLInputElement | null;
        setTimeout((): void => { mainSearch?.focus(); }, 100);
    });
}

// ─── 6. RECENT SEARCHES ───────────────────────────────────────────────────────

function saveRecentSearch(term: string): void {
    try {
        const store: RecentSearchStore = {
            terms: JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[],
        };
        store.terms = store.terms.filter((t: string) => t !== term);
        store.terms.unshift(term);
        store.terms = store.terms.slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(store.terms));
    } catch { /* quota */ }
}

// ─── 7. FILTER STATE PERSISTENCE ─────────────────────────────────────────────

function saveFilterState(filters: SavedFilters): void {
    try {
        localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    } catch { /* quota */ }
}

function restoreFilterState(): void {
    try {
        const raw: string | null = localStorage.getItem(FILTERS_KEY);
        if (!raw) return;
        const saved: SavedFilters = JSON.parse(raw) as SavedFilters;

        // Restore quick filter button
        if (saved.quick && saved.quick !== 'all') {
            const btn = document.querySelector<HTMLButtonElement>(
                `.filter-btn[data-filter="${saved.quick}"]`
            );
            if (btn) {
                document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach(
                    (b: HTMLButtonElement) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); }
                );
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                window.dispatchEvent(
                    new CustomEvent('tabla:restore-filter', { detail: { quick: saved.quick } })
                );
            }
        }

        // Restore price filter
        if (saved.price !== null) {
            const priceBtn = document.querySelector<HTMLButtonElement>(
                `.price-btn[data-price="${saved.price}"]`
            );
            if (priceBtn) {
                priceBtn.classList.add('active');
                priceBtn.setAttribute('aria-pressed', 'true');
            }
        }

        // Restore distance slider
        if (saved.maxDist && saved.maxDist < 20) {
            const slider = document.getElementById('distance-slider') as HTMLInputElement;
            const distVal = document.getElementById('distance-val') as HTMLSpanElement;
            if (slider && distVal) {
                slider.value = String(saved.maxDist);
                distVal.textContent = String(saved.maxDist);
                slider.setAttribute('aria-valuetext', `${saved.maxDist} km`);
            }
        }
    } catch { /* malformed storage */ }
}

function initFilterPersistence(): void {
    window.addEventListener('tabla:filter-changed', ((
        e: CustomEvent<SavedFilters>
    ): void => {
        saveFilterState(e.detail);
    }) as EventListener);

    // Restore after DOM settles
    setTimeout(restoreFilterState, 300);
}

// ─── 8. AUTOSAVE INDICATOR IN REVIEW FORM ────────────────────────────────────

function initAutosaveIndicator(): void {
    const textarea = document.getElementById('review-text') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const indicator = document.createElement('p');
    indicator.id = 'draft-saved-label';
    indicator.className = 'draft-saved-label';
    indicator.textContent = '';
    indicator.setAttribute('aria-live', 'polite');
    textarea.parentElement?.appendChild(indicator);

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    window.addEventListener('tabla:draft-saved', (): void => {
        indicator.textContent = 'Draft saved';
        indicator.classList.add('visible');
        if (hideTimer !== null) clearTimeout(hideTimer);
        hideTimer = setTimeout((): void => {
            indicator.classList.remove('visible');
        }, 2000);
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initIntegration(): void {
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
        setTimeout((): void => {
            showToast({
                message: 'Welcome to Tabla — discover great restaurants near you.',
                type: 'info',
                duration: 5000,
            });
        }, 1200);
    }
}

initIntegration();
