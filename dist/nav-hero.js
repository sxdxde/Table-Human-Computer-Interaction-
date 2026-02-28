// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Constants ────────────────────────────────────────────────────────────────
const RECENT_KEY = 'tabla_recent_searches';
const MAX_RECENT = 5;
const DEBOUNCE_MS = 200;
const TRENDING_SUGGESTIONS = [
    { label: 'Rooftop dining', type: 'trending' },
    { label: 'Best biryani', type: 'trending' },
    { label: 'Quiet date spots', type: 'trending' },
    { label: 'South Indian breakfast', type: 'trending' },
    { label: 'Pet-friendly cafés', type: 'trending' },
];
// ─── DOM refs ─────────────────────────────────────────────────────────────────
const siteNav = document.getElementById('site-nav');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const locationBtn = document.getElementById('location-btn');
const locationText = document.getElementById('location-text');
const searchInput = document.getElementById('main-search');
const suggestions = document.getElementById('search-suggestions');
const chipGroup = document.querySelector('.cuisine-chips');
const favBadge = document.getElementById('fav-badge');
// ─── 1. Sticky nav scroll state ───────────────────────────────────────────────
function initStickyNav() {
    window.addEventListener('scroll', () => {
        siteNav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}
// ─── 2. Mobile hamburger ──────────────────────────────────────────────────────
function initMobileMenu() {
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!isOpen));
        mobileMenu.hidden = isOpen;
        document.body.style.overflow = isOpen ? '' : 'hidden';
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!mobileMenu.hidden &&
            !mobileMenu.contains(e.target) &&
            !hamburger.contains(e.target)) {
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.hidden = true;
            document.body.style.overflow = '';
        }
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.hidden) {
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.hidden = true;
            document.body.style.overflow = '';
            hamburger.focus();
        }
    });
}
// ─── 3. Geolocation ───────────────────────────────────────────────────────────
async function reverseGeocode(_lat, _lng) {
    // Mock — replace with real geocoding API call when available
    return { neighbourhood: 'Your Area', city: 'Chennai' };
}
function openLocationInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter your area…';
    input.className = 'location-inline-input';
    locationBtn.replaceWith(input);
    input.focus();
    input.addEventListener('blur', () => {
        locationText.textContent = input.value || 'Set location';
    });
}
function initGeolocation() {
    if (!navigator.geolocation) {
        locationText.textContent = 'Set location';
        return;
    }
    locationText.textContent = 'Detecting…';
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            locationText.textContent = `${result.neighbourhood}, ${result.city}`;
        }
        catch {
            locationText.textContent = 'Set location';
        }
    }, () => {
        locationText.textContent = 'Set location';
        locationBtn.addEventListener('click', openLocationInput, { once: true });
    }, { timeout: 8000 });
}
// ─── 4. Recent searches (localStorage) ───────────────────────────────────────
function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    }
    catch {
        return [];
    }
}
function saveSearch(term) {
    const recent = getRecentSearches()
        .filter((s) => s !== term)
        .slice(0, MAX_RECENT - 1);
    recent.unshift(term);
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    }
    catch {
        // Storage quota exceeded — silently ignore
    }
}
// ─── 5. Autocomplete ──────────────────────────────────────────────────────────
let debounceTimer = null;
let activeIndex = -1;
function buildSuggestions(query) {
    const q = query.toLowerCase();
    const recent = getRecentSearches()
        .filter((s) => s.toLowerCase().includes(q))
        .map((s) => ({ label: s, type: 'recent' }));
    const trending = TRENDING_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(q));
    return [...recent, ...trending].slice(0, 6);
}
function renderSuggestions(items) {
    suggestions.innerHTML = '';
    activeIndex = -1;
    if (items.length === 0) {
        suggestions.hidden = true;
        searchInput.setAttribute('aria-expanded', 'false');
        return;
    }
    items.forEach((item, idx) => {
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
        li.addEventListener('mousedown', (e) => {
            e.preventDefault(); // prevent input blur before click registers
            selectSuggestion(item.label);
        });
        suggestions.appendChild(li);
    });
    suggestions.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
}
function selectSuggestion(label) {
    searchInput.value = label;
    suggestions.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    saveSearch(label);
    triggerSearch(label);
}
function moveFocus(direction) {
    const items = suggestions.querySelectorAll('li');
    if (items.length === 0)
        return;
    activeIndex = Math.max(-1, Math.min(items.length - 1, activeIndex + direction));
    items.forEach((li, idx) => {
        const isActive = idx === activeIndex;
        li.setAttribute('aria-selected', String(isActive));
        li.classList.toggle('active', isActive);
    });
    if (activeIndex >= 0) {
        searchInput.setAttribute('aria-activedescendant', `suggestion-${activeIndex}`);
    }
    else {
        searchInput.removeAttribute('aria-activedescendant');
    }
}
function initAutocomplete() {
    searchInput.addEventListener('input', () => {
        if (debounceTimer !== null)
            clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query.length < 2) {
                suggestions.hidden = true;
                searchInput.setAttribute('aria-expanded', 'false');
                return;
            }
            renderSuggestions(buildSuggestions(query));
        }, DEBOUNCE_MS);
    });
    searchInput.addEventListener('keydown', (e) => {
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
                    const text = items[activeIndex].querySelector('span:last-child')
                        ?.textContent ?? '';
                    selectSuggestion(text);
                }
                else {
                    const term = searchInput.value.trim();
                    if (term) {
                        saveSearch(term);
                        triggerSearch(term);
                    }
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
    const submitBtn = document.querySelector('.search-submit');
    submitBtn.addEventListener('click', () => {
        const term = searchInput.value.trim();
        if (term) {
            saveSearch(term);
            triggerSearch(term);
        }
    });
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestions.hidden = true;
            searchInput.setAttribute('aria-expanded', 'false');
        }, 150);
    });
}
// ─── 6. Search trigger ────────────────────────────────────────────────────────
function triggerSearch(query) {
    window.dispatchEvent(new CustomEvent('tabla:search', { detail: { query } }));
}
// ─── 7. Cuisine chips ─────────────────────────────────────────────────────────
function initCuisineChips() {
    chipGroup.addEventListener('click', (e) => {
        const target = e.target.closest('.chip');
        if (!target || target.id === 'more-cuisines-btn')
            return;
        const cuisine = target.dataset['cuisine'];
        if (!cuisine)
            return;
        chipGroup.querySelectorAll('.chip').forEach((c) => {
            c.classList.remove('active');
        });
        target.classList.add('active');
        window.dispatchEvent(new CustomEvent('tabla:filter-cuisine', { detail: { cuisine } }));
    });
    const moreBtn = document.getElementById('more-cuisines-btn');
    moreBtn.addEventListener('click', () => {
        const isExpanded = moreBtn.getAttribute('aria-expanded') === 'true';
        moreBtn.setAttribute('aria-expanded', String(!isExpanded));
        moreBtn.textContent = isExpanded ? 'More ↓' : 'Less ↑';
        chipGroup.classList.toggle('expanded', !isExpanded);
    });
}
// ─── 8. Favourites badge ──────────────────────────────────────────────────────
export function updateFavBadge(count) {
    favBadge.textContent = String(count);
    favBadge.setAttribute('aria-label', `${count} saved restaurant${count !== 1 ? 's' : ''}`);
    favBadge.style.display = count > 0 ? 'inline-flex' : 'none';
}
// ─── Init ─────────────────────────────────────────────────────────────────────
export function initNavHero() {
    initStickyNav();
    initMobileMenu();
    initGeolocation();
    initAutocomplete();
    initCuisineChips();
    updateFavBadge(0);
}
initNavHero();
