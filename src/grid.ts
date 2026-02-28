import { updateFavBadge } from './nav-hero';
import { showToast } from './toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Restaurant {
    id: number;
    name: string;
    cuisine: string;
    rating: number;
    reviewCount: number;
    price: 1 | 2 | 3;
    distance: number;
    area: string;
    isOpen: boolean;
    openUntil: string;
    tags: string[];
    acceptsReservations: boolean;
    img: string;
}

type QuickFilter = 'all' | 'open-now' | 'top-rated' | 'nearby';
type PriceFilter = 1 | 2 | 3 | null;

interface ActiveFilters {
    quick: QuickFilter;
    price: PriceFilter;
    cuisine: string;
    maxDist: number;
    dietary: string[];
    ambiance: string[];
}

interface FilterChangedDetail {
    quick: string;
    price: number | null;
    cuisine: string;
    maxDist: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RESTAURANTS: Restaurant[] = [
    {
        id: 1, name: 'Murugan Idli Shop', cuisine: 'South Indian',
        rating: 4.8, reviewCount: 2341, price: 1,
        distance: 0.4, area: 'Mylapore, Chennai',
        isOpen: true, openUntil: 'Open until 11:00 PM',
        tags: ['Breakfast', 'Vegetarian', 'Iconic'],
        acceptsReservations: false,
        img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80',
    },
    {
        id: 2, name: 'Burma Burma', cuisine: 'Pan-Asian',
        rating: 4.6, reviewCount: 891, price: 2,
        distance: 1.2, area: 'Anna Nagar, Chennai',
        isOpen: true, openUntil: 'Open until 10:30 PM',
        tags: ['Vegetarian', 'Unique', 'Brunch'],
        acceptsReservations: true,
        img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    },
    {
        id: 3, name: 'Peshawri', cuisine: 'North Indian',
        rating: 4.9, reviewCount: 1204, price: 3,
        distance: 2.1, area: 'ITC Grand Chola, Chennai',
        isOpen: true, openUntil: 'Open until 11:30 PM',
        tags: ['Fine Dining', 'Iconic', 'Tandoor'],
        acceptsReservations: true,
        img: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80',
    },
    {
        id: 4, name: 'Kala Ghoda Café', cuisine: 'Café & Brunch',
        rating: 4.5, reviewCount: 673, price: 2,
        distance: 0.8, area: 'Colaba, Mumbai',
        isOpen: false, openUntil: 'Closed · Opens 8:00 AM',
        tags: ['Coffee', 'Brunch', 'Quiet'],
        acceptsReservations: false,
        img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
    },
    {
        id: 5, name: 'The Table', cuisine: 'Continental',
        rating: 4.7, reviewCount: 1102, price: 3,
        distance: 1.5, area: 'Colaba, Mumbai',
        isOpen: true, openUntil: 'Open until 12:00 AM',
        tags: ['Fine Dining', 'Rooftop', 'Wine'],
        acceptsReservations: true,
        img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    },
    {
        id: 6, name: 'Mamagoto', cuisine: 'Pan-Asian',
        rating: 4.4, reviewCount: 534, price: 2,
        distance: 3.0, area: 'Bandra, Mumbai',
        isOpen: true, openUntil: 'Open until 10:00 PM',
        tags: ['Asian Fusion', 'Casual', 'Cocktails'],
        acceptsReservations: false,
        img: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
    },
    {
        id: 7, name: 'Buhari Hotel', cuisine: 'South Indian',
        rating: 4.6, reviewCount: 3890, price: 1,
        distance: 0.6, area: 'Anna Salai, Chennai',
        isOpen: true, openUntil: 'Open until 11:00 PM',
        tags: ['Legacy', 'Non-veg', 'Biryani'],
        acceptsReservations: false,
        img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    },
    {
        id: 8, name: 'Cream Centre', cuisine: 'Café & Brunch',
        rating: 4.3, reviewCount: 2200, price: 1,
        distance: 1.8, area: 'Chowpatty, Mumbai',
        isOpen: true, openUntil: 'Open until 11:30 PM',
        tags: ['Vegetarian', 'Iconic', 'Desserts'],
        acceptsReservations: false,
        img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    },
    {
        id: 9, name: 'Malabar House Restaurant', cuisine: 'Continental',
        rating: 4.8, reviewCount: 412, price: 3,
        distance: 4.2, area: 'Fort Kochi, Kerala',
        isOpen: true, openUntil: 'Open until 10:00 PM',
        tags: ['Heritage', 'Fine Dining', 'Outdoor'],
        acceptsReservations: true,
        img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const FAVORITES_KEY = 'tabla_favorites';
const PAGE_SIZE = 6;
const SKELETON_DELAY_MS = 600;

// ─── State ────────────────────────────────────────────────────────────────────

let filters: ActiveFilters = {
    quick: 'all',
    price: null,
    cuisine: 'all',
    maxDist: 20,
    dietary: [],
    ambiance: [],
};

let visibleCount = PAGE_SIZE;

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const resultsGrid = document.getElementById('results-grid') as HTMLDivElement;
const skeletonGrid = document.getElementById('skeleton-grid') as HTMLDivElement;
const resultsCount = document.getElementById('results-count') as HTMLSpanElement;
const loadMoreBtn = document.getElementById('load-more') as HTMLButtonElement;
const emptyState = document.getElementById('empty-state') as HTMLDivElement;
const clearFiltersLink = document.getElementById('clear-filters') as HTMLAnchorElement;
const activeFiltersBar = document.getElementById('active-filters') as HTMLDivElement;
const advancedDrawer = document.getElementById('advanced-filters') as HTMLDivElement;
const advancedBtn = document.getElementById('advanced-filter-btn') as HTMLButtonElement;
const distanceSlider = document.getElementById('distance-slider') as HTMLInputElement;
const distanceVal = document.getElementById('distance-val') as HTMLSpanElement;
const clearAndRetry = document.getElementById('clear-and-retry') as HTMLButtonElement;

// ─── Favourites ───────────────────────────────────────────────────────────────

function getFavorites(): number[] {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]') as number[];
    } catch {
        return [];
    }
}

function saveFavorites(ids: number[]): void {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); } catch { /* quota */ }
}

function isFavorited(id: number): boolean {
    return getFavorites().includes(id);
}

function toggleFavorite(id: number): boolean {
    const favs: number[] = getFavorites();
    const idx: number = favs.indexOf(id);
    if (idx === -1) { favs.push(id); } else { favs.splice(idx, 1); }
    saveFavorites(favs);
    updateFavBadge(favs.length);
    return idx === -1; // true = now saved
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priceSymbol(price: 1 | 2 | 3): string {
    return '₹'.repeat(price);
}

function formatReviews(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function renderStars(rating: number): string {
    const full = Math.floor(rating);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
}

// ─── Card rendering ───────────────────────────────────────────────────────────

function buildCard(r: Restaurant): HTMLElement {
    const saved: boolean = isFavorited(r.id);

    const article = document.createElement('article');
    article.className = 'restaurant-card';
    article.dataset['id'] = String(r.id);
    article.tabIndex = 0;
    article.setAttribute('aria-label',
        `${r.name}, ${r.cuisine}, rated ${r.rating} out of 5, ${r.isOpen ? 'Open now' : 'Closed'}`);

    article.innerHTML = `
    <div class="card-image-wrap">
      <img data-src="${r.img}" src="" alt="${r.name} dining" loading="lazy" />
      <span class="open-badge ${r.isOpen ? 'open' : 'closed'}" aria-label="${r.isOpen ? 'Open now' : 'Closed'}">
        ${r.isOpen ? 'Open Now' : 'Closed'}
      </span>
      <button class="heart-btn" aria-label="${saved ? 'Remove' : 'Save'} ${r.name} ${saved ? 'from' : 'to'} favourites"
              aria-pressed="${saved}" data-id="${r.id}">
        <svg class="heart-icon" viewBox="0 0 24 24" width="18" height="18"
             stroke="currentColor" stroke-width="2" fill="${saved ? 'currentColor' : 'none'}">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                   a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                   1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
    <div class="card-body">
      <h3 class="card-name">${r.name}</h3>
      <div class="card-rating" aria-label="Rated ${r.rating} out of 5, ${formatReviews(r.reviewCount)} reviews">
        <span class="stars" aria-hidden="true">${renderStars(r.rating)}</span>
        <span class="rating-num">${r.rating}</span>
        <span class="review-count">(${formatReviews(r.reviewCount)})</span>
      </div>
      <div class="card-meta">
        <span class="cuisine-tag">${r.cuisine}</span>
        <span class="dot" aria-hidden="true">·</span>
        <span class="price" aria-label="${['', 'Affordable', 'Mid-range', 'Fine dining'][r.price]}">${priceSymbol(r.price)}</span>
        <span class="dot" aria-hidden="true">·</span>
        <span class="distance">${r.distance} km</span>
      </div>
      <p class="card-area">${r.area}</p>
      <p class="card-hours">${r.openUntil}</p>
      <div class="card-tags" aria-label="Tags">
        ${r.tags.slice(0, 3).map((t: string) => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="card-actions">
        <button class="btn-reserve reserve-btn"
          data-id="${r.id}"
          data-name="${r.name}"
          ${!r.acceptsReservations
            ? 'disabled aria-disabled="true" title="This restaurant doesn\'t accept reservations"'
            : `aria-label="Reserve a table at ${r.name}"`}>
          Reserve
        </button>
        <button class="btn-write-review" aria-label="Write a review for ${r.name}">
          Review
        </button>
        <button class="btn-directions" aria-label="Get directions to ${r.name}">
          Dir
        </button>
      </div>
    </div>
  `;

    // Heart button — Closure principle: immediate feedback
    const heartBtn = article.querySelector('.heart-btn') as HTMLButtonElement;
    heartBtn.addEventListener('click', (e: MouseEvent): void => {
        e.stopPropagation();
        const nowSaved: boolean = toggleFavorite(r.id);

        heartBtn.setAttribute('aria-pressed', String(nowSaved));
        heartBtn.setAttribute('aria-label',
            `${nowSaved ? 'Remove' : 'Save'} ${r.name} ${nowSaved ? 'from' : 'to'} favourites`);

        const heartSvg = heartBtn.querySelector('.heart-icon') as SVGElement;
        heartSvg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
        heartBtn.classList.toggle('saved', nowSaved);

        showToast({
            message: nowSaved ? `Saved ${r.name}` : `Removed ${r.name}`,
            type: nowSaved ? 'success' : 'info',
            duration: 5000,
            undoCallback: (): void => {
                toggleFavorite(r.id);
                const pressed = !nowSaved;
                heartBtn.setAttribute('aria-pressed', String(pressed));
                heartSvg.setAttribute('fill', pressed ? 'currentColor' : 'none');
                heartBtn.classList.toggle('saved', pressed);
                heartBtn.setAttribute('aria-label',
                    `${pressed ? 'Remove' : 'Save'} ${r.name} ${pressed ? 'from' : 'to'} favourites`);
            },
        });
    });

    return article;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function showSkeleton(): void {
    skeletonGrid.innerHTML = Array.from({ length: PAGE_SIZE })
        .map((): string => `
      <div class="restaurant-card skeleton-card" aria-hidden="true">
        <div class="skeleton-img"></div>
        <div class="card-body">
          <div class="skeleton-line wide"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line narrow"></div>
        </div>
      </div>
    `).join('');
    skeletonGrid.hidden = false;
    resultsGrid.hidden = true;
}

function hideSkeleton(): void {
    skeletonGrid.hidden = true;
    resultsGrid.hidden = false;
}

// ─── Filtering ────────────────────────────────────────────────────────────────

const CUISINE_MAP: Record<string, string> = {
    'south-indian': 'South Indian',
    'north-indian': 'North Indian',
    'pan-asian': 'Pan-Asian',
    'cafe': 'Café & Brunch',
    'desserts': 'Desserts & Chai',
};

function applyFilters(data: Restaurant[]): Restaurant[] {
    return data.filter((r: Restaurant): boolean => {
        if (filters.quick === 'open-now' && !r.isOpen) return false;
        if (filters.quick === 'top-rated' && r.rating < 4.5) return false;
        if (filters.quick === 'nearby' && r.distance > 2) return false;
        if (filters.price !== null && r.price !== filters.price) return false;
        if (filters.cuisine !== 'all' && CUISINE_MAP[filters.cuisine] !== r.cuisine) return false;
        if (r.distance > filters.maxDist) return false;
        if (filters.dietary.length > 0) {
            const tagsLower = r.tags.map((t: string) => t.toLowerCase());
            if (!filters.dietary.some((d: string) => tagsLower.includes(d))) return false;
        }
        if (filters.ambiance.length > 0) {
            const tagsLower = r.tags.map((t: string) => t.toLowerCase());
            if (!filters.ambiance.some((a: string) => tagsLower.includes(a))) return false;
        }
        return true;
    });
}

// ─── Active filters chips bar ─────────────────────────────────────────────────

function updateActiveFiltersBar(): void {
    const chips: string[] = [];
    if (filters.quick !== 'all') chips.push(filters.quick.replace('-', ' '));
    if (filters.price !== null) chips.push('₹'.repeat(filters.price));
    if (filters.cuisine !== 'all') chips.push(filters.cuisine.replace(/-/g, ' '));
    if (filters.maxDist < 20) chips.push(`≤${filters.maxDist} km`);
    filters.dietary.forEach((d: string) => chips.push(d));
    filters.ambiance.forEach((a: string) => chips.push(a));

    activeFiltersBar.innerHTML = chips
        .map((chip: string): string =>
            `<span class="filter-chip-active">${chip}
         <button class="chip-remove" aria-label="Remove ${chip} filter" data-chip="${chip}">✕</button>
       </span>`
        ).join('');

    clearFiltersLink.style.display = chips.length > 0 ? 'inline' : 'none';
}

// ─── Main render ──────────────────────────────────────────────────────────────

let searchOverride: Restaurant[] | null = null; // null = use filter pipeline

function renderGrid(): void {
    const source: Restaurant[] = searchOverride !== null
        ? searchOverride
        : applyFilters(RESTAURANTS);

    const slice: Restaurant[] = source.slice(0, visibleCount);

    resultsCount.textContent =
        `Showing ${Math.min(visibleCount, source.length)} of ${source.length} restaurant${source.length !== 1 ? 's' : ''}`;

    loadMoreBtn.style.display = visibleCount < source.length ? 'block' : 'none';
    emptyState.hidden = source.length > 0;
    resultsGrid.hidden = source.length === 0;

    resultsGrid.innerHTML = '';
    slice.forEach((r: Restaurant): void => {
        resultsGrid.appendChild(buildCard(r));
    });

    updateActiveFiltersBar();

    // Notify performance module to re-observe lazy images
    window.dispatchEvent(new CustomEvent('tabla:grid-rendered'));

    // Notify integration module to persist filter state
    window.dispatchEvent(
        new CustomEvent<FilterChangedDetail>('tabla:filter-changed', {
            detail: {
                quick: filters.quick,
                price: filters.price,
                cuisine: filters.cuisine,
                maxDist: filters.maxDist,
            },
        })
    );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function initFilterBar(): void {
    // Quick filter buttons
    document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach(
        (btn: HTMLButtonElement): void => {
            btn.addEventListener('click', (): void => {
                document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                filters.quick = btn.dataset['filter'] as QuickFilter;
                visibleCount = PAGE_SIZE;
                searchOverride = null;
                renderGrid();
            });
        }
    );

    // Price buttons — toggle; only one active at a time
    document.querySelectorAll<HTMLButtonElement>('.price-btn').forEach(
        (btn: HTMLButtonElement): void => {
            btn.addEventListener('click', (): void => {
                const price = Number(btn.dataset['price']) as 1 | 2 | 3;
                const isActive: boolean = btn.getAttribute('aria-pressed') === 'true';
                document.querySelectorAll<HTMLButtonElement>('.price-btn').forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                if (!isActive) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                    filters.price = price;
                } else {
                    filters.price = null;
                }
                visibleCount = PAGE_SIZE;
                searchOverride = null;
                renderGrid();
            });
        }
    );

    // Advanced drawer toggle
    advancedBtn.addEventListener('click', (): void => {
        const isOpen: boolean = advancedBtn.getAttribute('aria-expanded') === 'true';
        advancedBtn.setAttribute('aria-expanded', String(!isOpen));
        advancedDrawer.hidden = isOpen;
        advancedBtn.textContent = isOpen ? 'More filters ↓' : 'Fewer filters ↑';
    });

    const drawerClose = advancedDrawer.querySelector('.drawer-close') as HTMLButtonElement;
    drawerClose.addEventListener('click', (): void => {
        advancedDrawer.hidden = true;
        advancedBtn.setAttribute('aria-expanded', 'false');
        advancedBtn.textContent = 'More filters ↓';
    });

    // Distance slider
    distanceSlider.addEventListener('input', (): void => {
        const val: number = Number(distanceSlider.value);
        distanceVal.textContent = String(val);
        distanceSlider.setAttribute('aria-valuetext', `${val} km`);
        filters.maxDist = val;
        visibleCount = PAGE_SIZE;
        searchOverride = null;
        renderGrid();
    });

    // Dietary & ambiance checkboxes
    advancedDrawer.querySelectorAll<HTMLInputElement>('fieldset:nth-of-type(1) input[type="checkbox"]')
        .forEach((cb: HTMLInputElement): void => {
            cb.addEventListener('change', (): void => {
                filters.dietary = Array.from(
                    advancedDrawer.querySelectorAll<HTMLInputElement>('fieldset:nth-of-type(1) input:checked')
                ).map((c) => c.value);
                visibleCount = PAGE_SIZE; searchOverride = null; renderGrid();
            });
        });

    advancedDrawer.querySelectorAll<HTMLInputElement>('fieldset:nth-of-type(2) input[type="checkbox"]')
        .forEach((cb: HTMLInputElement): void => {
            cb.addEventListener('change', (): void => {
                filters.ambiance = Array.from(
                    advancedDrawer.querySelectorAll<HTMLInputElement>('fieldset:nth-of-type(2) input:checked')
                ).map((c) => c.value);
                visibleCount = PAGE_SIZE; searchOverride = null; renderGrid();
            });
        });

    // Clear all filters link
    clearFiltersLink.addEventListener('click', (e: MouseEvent): void => {
        e.preventDefault();
        resetFilters();
    });

    // Empty state — clear and retry
    clearAndRetry.addEventListener('click', (): void => resetFilters());
}

function resetFilters(): void {
    filters = { quick: 'all', price: null, cuisine: 'all', maxDist: 20, dietary: [], ambiance: [] };
    visibleCount = PAGE_SIZE;
    searchOverride = null;

    distanceSlider.value = '20';
    distanceVal.textContent = '20';
    distanceSlider.setAttribute('aria-valuetext', '20 km');

    document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
    });
    const allBtn = document.querySelector<HTMLButtonElement>('.filter-btn[data-filter="all"]');
    if (allBtn) { allBtn.classList.add('active'); allBtn.setAttribute('aria-pressed', 'true'); }

    document.querySelectorAll<HTMLButtonElement>('.price-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
    });

    advancedDrawer.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((c) => {
        c.checked = false;
    });

    renderGrid();
}

// ─── Load more ────────────────────────────────────────────────────────────────

function initLoadMore(): void {
    loadMoreBtn.addEventListener('click', (): void => {
        visibleCount += PAGE_SIZE;
        renderGrid();
    });
}

// ─── External events (from nav-hero) ─────────────────────────────────────────

function initExternalEvents(): void {
    window.addEventListener('tabla:search', ((e: CustomEvent<{ query: string }>): void => {
        const q = e.detail.query.toLowerCase();
        searchOverride = RESTAURANTS.filter((r: Restaurant): boolean =>
            r.name.toLowerCase().includes(q) ||
            r.cuisine.toLowerCase().includes(q) ||
            r.area.toLowerCase().includes(q) ||
            r.tags.some((t: string) => t.toLowerCase().includes(q))
        );
        visibleCount = PAGE_SIZE;
        resultsCount.textContent =
            `${searchOverride.length} result${searchOverride.length !== 1 ? 's' : ''} for "${e.detail.query}"`;
        emptyState.hidden = searchOverride.length > 0;
        resultsGrid.hidden = searchOverride.length === 0;
        resultsGrid.innerHTML = '';
        searchOverride.slice(0, visibleCount).forEach((r) => resultsGrid.appendChild(buildCard(r)));
        loadMoreBtn.style.display = visibleCount < searchOverride.length ? 'block' : 'none';
        updateActiveFiltersBar();
    }) as EventListener);

    window.addEventListener('tabla:filter-cuisine', ((e: CustomEvent<{ cuisine: string }>): void => {
        filters.cuisine = e.detail.cuisine;
        visibleCount = PAGE_SIZE;
        searchOverride = null;
        renderGrid();
    }) as EventListener);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initGrid(): void {
    showSkeleton();
    setTimeout((): void => {
        hideSkeleton();
        initFilterBar();
        initLoadMore();
        initExternalEvents();
        renderGrid();
        updateFavBadge(getFavorites().length);
    }, SKELETON_DELAY_MS);
}

initGrid();
