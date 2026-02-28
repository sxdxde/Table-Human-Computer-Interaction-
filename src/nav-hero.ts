// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeolocationResult {
    neighbourhood: string;
    city: string;
}

export interface SuggestionItem {
    label: string;
    type: 'recent' | 'trending' | 'match';
}

export type CuisineKey =
    | 'all'
    | 'south-indian'
    | 'north-indian'
    | 'pan-asian'
    | 'cafe'
    | 'desserts';

// ─── Constants ────────────────────────────────────────────────────────────────

const RECENT_KEY = 'tabla_recent_searches';
const MAX_RECENT = 5;
const DEBOUNCE_MS = 200;

const TRENDING_SUGGESTIONS: SuggestionItem[] = [
    { label: 'Rooftop dining', type: 'trending' },
    { label: 'Best biryani', type: 'trending' },
    { label: 'Quiet date spots', type: 'trending' },
    { label: 'South Indian breakfast', type: 'trending' },
    { label: 'Pet-friendly cafés', type: 'trending' },
];

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const siteNav = document.getElementById('site-nav') as HTMLElement;
const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
const mobileMenu = document.getElementById('mobile-menu') as HTMLDivElement;
const locationBtn = document.getElementById('location-btn') as HTMLButtonElement;
const locationText = document.getElementById('location-text') as HTMLSpanElement;
const searchInput = document.getElementById('main-search') as HTMLInputElement;
const suggestions = document.getElementById('search-suggestions') as HTMLUListElement;
const chipGroup = document.querySelector('.cuisine-chips') as HTMLDivElement;
const favBadge = document.getElementById('fav-badge') as HTMLSpanElement;

// ─── 1. Sticky nav scroll state ───────────────────────────────────────────────

function initStickyNav(): void {
    window.addEventListener('scroll', (): void => {
        siteNav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

// ─── 2. Mobile hamburger ──────────────────────────────────────────────────────

function initMobileMenu(): void {
    hamburger.addEventListener('click', (): void => {
        const isOpen: boolean = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!isOpen));
        mobileMenu.hidden = isOpen;
        document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on outside click
    document.addEventListener('click', (e: MouseEvent): void => {
        if (
            !mobileMenu.hidden &&
            !mobileMenu.contains(e.target as Node) &&
            !hamburger.contains(e.target as Node)
        ) {
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.hidden = true;
            document.body.style.overflow = '';
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e: KeyboardEvent): void => {
        if (e.key === 'Escape' && !mobileMenu.hidden) {
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.hidden = true;
            document.body.style.overflow = '';
            hamburger.focus();
        }
    });
}

// ─── 3. Geolocation ───────────────────────────────────────────────────────────

async function reverseGeocode(_lat: number, _lng: number): Promise<GeolocationResult> {
    // Mock — replace with real geocoding API call when available
    return { neighbourhood: 'Your Area', city: 'Chennai' };
}

function openLocationInput(): void {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter your area…';
    input.className = 'location-inline-input';
    locationBtn.replaceWith(input);
    input.focus();
    input.addEventListener('blur', (): void => {
        locationText.textContent = input.value || 'Set location';
    });
}

function initGeolocation(): void {
    if (!navigator.geolocation) {
        locationText.textContent = 'Set location';
        return;
    }

    locationText.textContent = 'Detecting…';

    navigator.geolocation.getCurrentPosition(
        async (pos: GeolocationPosition): Promise<void> => {
            try {
                const result: GeolocationResult = await reverseGeocode(
                    pos.coords.latitude,
                    pos.coords.longitude,
                );
                locationText.textContent = `${result.neighbourhood}, ${result.city}`;
            } catch {
                locationText.textContent = 'Set location';
            }
        },
        (): void => {
            locationText.textContent = 'Set location';
            locationBtn.addEventListener('click', openLocationInput, { once: true });
        },
        { timeout: 8000 },
    );
}

// ─── 4. Recent searches (localStorage) ───────────────────────────────────────

function getRecentSearches(): string[] {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
    } catch {
        return [];
    }
}

function saveSearch(term: string): void {
    const recent: string[] = getRecentSearches()
        .filter((s: string) => s !== term)
        .slice(0, MAX_RECENT - 1);
    recent.unshift(term);
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch {
        // Storage quota exceeded — silently ignore
    }
}

// ─── 5. Autocomplete ──────────────────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let activeIndex = -1;

function buildSuggestions(query: string): SuggestionItem[] {
    const q = query.toLowerCase();

    const recent: SuggestionItem[] = getRecentSearches()
        .filter((s: string) => s.toLowerCase().includes(q))
        .map((s: string): SuggestionItem => ({ label: s, type: 'recent' }));

    const trending: SuggestionItem[] = TRENDING_SUGGESTIONS.filter(
        (s: SuggestionItem) => s.label.toLowerCase().includes(q),
    );

    return [...recent, ...trending].slice(0, 6);
}

function renderSuggestions(items: SuggestionItem[]): void {
    suggestions.innerHTML = '';
    activeIndex = -1;

    if (items.length === 0) {
        suggestions.hidden = true;
        searchInput.setAttribute('aria-expanded', 'false');
        return;
    }

    items.forEach((item: SuggestionItem, idx: number): void => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('id', `suggestion-${idx}`);
        li.setAttribute('aria-selected', 'false');
        li.dataset['type'] = item.type;

        const prefix = document.createElement('span');
        prefix.className = 'suggestion-prefix';
        prefix.textContent = item.type === 'recent' ? '🕐' : '🔥';
        prefix.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.textContent = item.label;

        li.appendChild(prefix);
        li.appendChild(label);

        li.addEventListener('mousedown', (e: MouseEvent): void => {
            e.preventDefault(); // prevent input blur before click registers
            selectSuggestion(item.label);
        });

        suggestions.appendChild(li);
    });

    suggestions.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
}

function selectSuggestion(label: string): void {
    searchInput.value = label;
    suggestions.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    saveSearch(label);
    triggerSearch(label);
}

function moveFocus(direction: 1 | -1): void {
    const items = suggestions.querySelectorAll('li');
    if (items.length === 0) return;

    activeIndex = Math.max(-1, Math.min(items.length - 1, activeIndex + direction));

    items.forEach((li: Element, idx: number): void => {
        const isActive = idx === activeIndex;
        li.setAttribute('aria-selected', String(isActive));
        (li as HTMLElement).classList.toggle('active', isActive);
    });

    if (activeIndex >= 0) {
        searchInput.setAttribute('aria-activedescendant', `suggestion-${activeIndex}`);
    } else {
        searchInput.removeAttribute('aria-activedescendant');
    }
}

function initAutocomplete(): void {
    searchInput.addEventListener('input', (): void => {
        if (debounceTimer !== null) clearTimeout(debounceTimer);
        debounceTimer = setTimeout((): void => {
            const query: string = searchInput.value.trim();
            if (query.length < 2) {
                suggestions.hidden = true;
                searchInput.setAttribute('aria-expanded', 'false');
                return;
            }
            renderSuggestions(buildSuggestions(query));
        }, DEBOUNCE_MS);
    });

    searchInput.addEventListener('keydown', (e: KeyboardEvent): void => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                moveFocus(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                moveFocus(-1);
                break;
            case 'Enter': {
                e.preventDefault();
                const items = suggestions.querySelectorAll('li');
                if (activeIndex >= 0 && items[activeIndex]) {
                    const text = (items[activeIndex].querySelector('span:last-child') as HTMLElement)
                        ?.textContent ?? '';
                    selectSuggestion(text);
                } else {
                    const term = searchInput.value.trim();
                    if (term) { saveSearch(term); triggerSearch(term); }
                }
                break;
            }
            case 'Escape':
                suggestions.hidden = true;
                searchInput.setAttribute('aria-expanded', 'false');
                searchInput.removeAttribute('aria-activedescendant');
                activeIndex = -1;
                break;
        }
    });

    // Submit button
    const submitBtn = document.querySelector('.search-submit') as HTMLButtonElement;
    submitBtn.addEventListener('click', (): void => {
        const term = searchInput.value.trim();
        if (term) { saveSearch(term); triggerSearch(term); }
    });

    searchInput.addEventListener('blur', (): void => {
        setTimeout((): void => {
            suggestions.hidden = true;
            searchInput.setAttribute('aria-expanded', 'false');
        }, 150);
    });
}

// ─── 6. Search trigger ────────────────────────────────────────────────────────

function triggerSearch(query: string): void {
    window.dispatchEvent(
        new CustomEvent<{ query: string }>('tabla:search', { detail: { query } }),
    );
}

// ─── 7. Cuisine chips ─────────────────────────────────────────────────────────

function initCuisineChips(): void {
    chipGroup.addEventListener('click', (e: MouseEvent): void => {
        const target = (e.target as HTMLElement).closest('.chip') as HTMLButtonElement | null;
        if (!target || target.id === 'more-cuisines-btn') return;

        const cuisine = target.dataset['cuisine'] as CuisineKey | undefined;
        if (!cuisine) return;

        chipGroup.querySelectorAll('.chip').forEach((c: Element): void => {
            c.classList.remove('active');
        });
        target.classList.add('active');

        window.dispatchEvent(
            new CustomEvent<{ cuisine: CuisineKey }>('tabla:filter-cuisine', { detail: { cuisine } }),
        );
    });

    const moreBtn = document.getElementById('more-cuisines-btn') as HTMLButtonElement;
    moreBtn.addEventListener('click', (): void => {
        const isExpanded: boolean = moreBtn.getAttribute('aria-expanded') === 'true';
        moreBtn.setAttribute('aria-expanded', String(!isExpanded));
        moreBtn.textContent = isExpanded ? 'More ↓' : 'Less ↑';
        chipGroup.classList.toggle('expanded', !isExpanded);
    });
}

// ─── 8. Favourites badge ──────────────────────────────────────────────────────

export function updateFavBadge(count: number): void {
    favBadge.textContent = String(count);
    favBadge.setAttribute('aria-label', `${count} saved restaurant${count !== 1 ? 's' : ''}`);
    favBadge.style.display = count > 0 ? 'inline-flex' : 'none';
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initNavHero(): void {
    initStickyNav();
    initMobileMenu();
    initGeolocation();
    initAutocomplete();
    initCuisineChips();
    updateFavBadge(0);
}

initNavHero();
