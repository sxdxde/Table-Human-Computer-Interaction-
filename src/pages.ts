// ─── src/pages.ts — SPA nav routing ─────────────────────────────────────────
// Each nav link switches the visible "page" div without reloading.

import { showToast } from './toast';

// ─── Restaurant data (shared, duplicated here for standalone page renders) ────

interface RestaurantEntry {
    id: number; name: string; cuisine: string;
    rating: number; reviewCount: number; price: 1 | 2 | 3;
    distance: number; area: string;
    isOpen: boolean; openUntil: string;
    tags: string[]; acceptsReservations: boolean;
    img: string;
    dealPct?: number;
}

const ALL_RESTAURANTS: RestaurantEntry[] = [
    { id: 1, name: 'Murugan Idli Shop', cuisine: 'South Indian', rating: 4.8, reviewCount: 2341, price: 1, distance: 0.4, area: 'Mylapore, Chennai', isOpen: true, openUntil: 'Open until 11:00 PM', tags: ['Breakfast', 'Vegetarian', 'Iconic'], acceptsReservations: false, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80' },
    { id: 2, name: 'Burma Burma', cuisine: 'Pan-Asian', rating: 4.6, reviewCount: 891, price: 2, distance: 1.2, area: 'Anna Nagar, Chennai', isOpen: true, openUntil: 'Open until 10:30 PM', tags: ['Vegetarian', 'Unique', 'Brunch'], acceptsReservations: true, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80' },
    { id: 3, name: 'Peshawri', cuisine: 'North Indian', rating: 4.9, reviewCount: 1204, price: 3, distance: 2.1, area: 'ITC Grand Chola, Chennai', isOpen: true, openUntil: 'Open until 11:30 PM', tags: ['Fine Dining', 'Iconic', 'Tandoor'], acceptsReservations: true, img: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80' },
    { id: 4, name: 'Kala Ghoda Café', cuisine: 'Café & Brunch', rating: 4.5, reviewCount: 673, price: 2, distance: 0.8, area: 'Colaba, Mumbai', isOpen: false, openUntil: 'Closed · Opens 8:00 AM', tags: ['Coffee', 'Brunch', 'Quiet'], acceptsReservations: false, img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80' },
    { id: 5, name: 'The Table', cuisine: 'Continental', rating: 4.7, reviewCount: 1102, price: 3, distance: 1.5, area: 'Colaba, Mumbai', isOpen: true, openUntil: 'Open until 12:00 AM', tags: ['Fine Dining', 'Rooftop', 'Wine'], acceptsReservations: true, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
    { id: 6, name: 'Mamagoto', cuisine: 'Pan-Asian', rating: 4.4, reviewCount: 534, price: 2, distance: 3.0, area: 'Bandra, Mumbai', isOpen: true, openUntil: 'Open until 10:00 PM', tags: ['Asian Fusion', 'Casual', 'Cocktails'], acceptsReservations: false, img: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80' },
    { id: 7, name: 'Buhari Hotel', cuisine: 'South Indian', rating: 4.6, reviewCount: 3890, price: 1, distance: 0.6, area: 'Anna Salai, Chennai', isOpen: true, openUntil: 'Open until 11:00 PM', tags: ['Legacy', 'Non-veg', 'Biryani'], acceptsReservations: false, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80' },
    { id: 8, name: 'Cream Centre', cuisine: 'Café & Brunch', rating: 4.3, reviewCount: 2200, price: 1, distance: 1.8, area: 'Chowpatty, Mumbai', isOpen: true, openUntil: 'Open until 11:30 PM', tags: ['Vegetarian', 'Iconic', 'Desserts'], acceptsReservations: false, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80' },
    { id: 9, name: 'Malabar House Restaurant', cuisine: 'Continental', rating: 4.8, reviewCount: 412, price: 3, distance: 4.2, area: 'Fort Kochi, Kerala', isOpen: true, openUntil: 'Open until 10:00 PM', tags: ['Heritage', 'Fine Dining', 'Outdoor'], acceptsReservations: true, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
];

// Assign random deals once
const DEAL_PCTS = [15, 20, 25, 30, 35, 40];
const DEALS_RESTAURANTS: RestaurantEntry[] = ALL_RESTAURANTS.slice(0, 6).map((r, i) => ({
    ...r,
    dealPct: DEAL_PCTS[i % DEAL_PCTS.length],
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function priceSymbol(p: 1 | 2 | 3): string { return '₹'.repeat(p); }
function stars(r: number): string { return '★'.repeat(Math.floor(r)) + '☆'.repeat(5 - Math.floor(r)); }
function fmt(n: number): string { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

function miniCard(r: RestaurantEntry, extra = ''): string {
    return `<div class="mini-card" data-id="${r.id}">
      <div class="mini-card-img" style="background-image:url('${r.img}')">
        <span class="mini-badge ${r.isOpen ? 'open' : 'closed'}">${r.isOpen ? 'OPEN' : 'CLOSED'}</span>
      </div>
      <div class="mini-card-body">
        <h3>${r.name}</h3>
        <span class="mini-stars">${stars(r.rating)}</span>
        <span class="mini-rating">${r.rating} (${fmt(r.reviewCount)})</span>
        <p class="mini-meta">${r.cuisine} · ${priceSymbol(r.price)} · ${r.distance} km</p>
        <p class="mini-area">${r.area}</p>
        ${extra}
      </div>
    </div>`;
}

function countdownTimer(): string {
    // random 1-48 hours
    const h = Math.floor(Math.random() * 47) + 1;
    const m = Math.floor(Math.random() * 59);
    return `<span class="deal-timer">⏱ Ends in ${h}h ${m}m</span>`;
}

// ─── Page HTML builders ──────────────────────────────────────────────────────

function buildNearMePage(): string {
    const sorted = [...ALL_RESTAURANTS].sort((a, b) => a.distance - b.distance);
    return `<div class="page-wrap">
      <div class="page-hero" style="background:linear-gradient(135deg,#0E0C0A,#2C1B0E)">
        <div class="page-hero-inner">
          <h1>Near Me</h1>
          <p>Restaurants sorted by distance from your location</p>
          <div id="geo-status" class="geo-status">
            <button id="use-location-btn" class="ghost-action-btn">📍 Use my location</button>
          </div>
        </div>
      </div>
      <div class="page-grid">
        ${sorted.map(r => miniCard(r, `<span class="dist-badge">📍 ${r.distance} km away</span>`)).join('')}
      </div>
    </div>`;
}

function buildCuisinesPage(): string {
    const categories = [
        { key: 'South Indian', emoji: '🍚', desc: 'Idli, Dosa, Biryani & more' },
        { key: 'North Indian', emoji: '🍛', desc: 'Tandoor, Butter chicken, Naan' },
        { key: 'Pan-Asian', emoji: '🥢', desc: 'Sushi, Dim sum, Thai & beyond' },
        { key: 'Café & Brunch', emoji: '☕', desc: 'All-day breakfast, Coffee & Pastries' },
        { key: 'Continental', emoji: '🍽️', desc: 'Fine dining, grills & wine' },
        { key: 'Desserts & Chai', emoji: '🍮', desc: 'Sweets, kulfi, chai & more' },
    ];
    return `<div class="page-wrap">
      <div class="page-hero" style="background:linear-gradient(135deg,#1a0e2e,#2e1a4a)">
        <div class="page-hero-inner">
          <h1>Cuisines</h1>
          <p>Explore by what you're craving</p>
        </div>
      </div>
      <div class="cuisine-category-grid">
        ${categories.map(c => `
          <div class="cuisine-cat-card" data-cuisine="${c.key}">
            <span class="cuisine-emoji">${c.emoji}</span>
            <h3>${c.key}</h3>
            <p>${c.desc}</p>
            <span class="cuisine-count">${ALL_RESTAURANTS.filter(r => r.cuisine === c.key).length} restaurants</span>
          </div>
        `).join('')}
      </div>
      <div id="cuisine-filtered" class="page-grid" hidden></div>
    </div>`;
}

function buildSavedPage(): string {
    let favIds: number[] = [];
    try { favIds = JSON.parse(localStorage.getItem('tabla_favorites') ?? '[]') as number[]; } catch { /* */ }
    const saved = ALL_RESTAURANTS.filter(r => favIds.includes(r.id));

    if (saved.length === 0) {
        return `<div class="page-wrap">
          <div class="page-hero" style="background:linear-gradient(135deg,#0a1628,#1a2a4a)">
            <div class="page-hero-inner"><h1>Saved</h1><p>Your favourite restaurants</p></div>
          </div>
          <div class="empty-page">
            <div class="empty-icon">🤍</div>
            <h2>No saved restaurants yet</h2>
            <p>Tap the heart on any restaurant card to save it here</p>
            <button class="page-cta-btn" data-nav="explore">Browse restaurants →</button>
          </div>
        </div>`;
    }

    return `<div class="page-wrap">
      <div class="page-hero" style="background:linear-gradient(135deg,#0a1628,#1a2a4a)">
        <div class="page-hero-inner"><h1>Saved</h1><p>${saved.length} favourited restaurant${saved.length !== 1 ? 's' : ''}</p></div>
      </div>
      <div class="page-grid">${saved.map(r => miniCard(r)).join('')}</div>
    </div>`;
}

function buildDealsPage(): string {
    // Refresh deal timers on each render
    return `<div class="page-wrap">
      <div class="page-hero deals-hero">
        <div class="page-hero-inner">
          <h1>🏷️ Deals</h1>
          <p>Exclusive savings — today only</p>
        </div>
      </div>
      <div class="deals-grid">
        ${DEALS_RESTAURANTS.map(r => `
          <div class="deal-card">
            <div class="deal-img" style="background-image:url('${r.img}')">
              <div class="deal-badge">${r.dealPct}% OFF</div>
            </div>
            <div class="deal-body">
              <h3>${r.name}</h3>
              <p class="deal-meta">${r.cuisine} · ${r.area}</p>
              <div class="deal-pricing">
                <span class="deal-original">${priceSymbol(r.price as 1 | 2 | 3)}${priceSymbol(r.price as 1 | 2 | 3)}</span>
                <span class="deal-discounted">Save ${r.dealPct}% today</span>
              </div>
              ${countdownTimer()}
              <button class="deal-claim-btn" data-id="${r.id}" data-deal="${r.dealPct}">
                Claim Deal
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function buildSignInPage(): string {
    const user = getSignedInUser();
    if (user) {
        return `<div class="page-wrap">
          <div class="signin-container">
            <div class="signin-card">
              <div class="signin-avatar">${user.name[0].toUpperCase()}</div>
              <h2>Welcome back, ${user.name}!</h2>
              <p class="signin-email">${user.email}</p>
              <p class="signin-since">Member since ${user.since}</p>
              <button id="signout-btn" class="signin-submit" style="background:#B94040">Sign Out</button>
            </div>
          </div>
        </div>`;
    }

    return `<div class="page-wrap">
      <div class="signin-container">
        <div class="signin-card">
          <div class="signin-logo">Tabla</div>
          <h2>Sign in</h2>
          <p class="signin-sub">Access your reservations, saved spots & deals</p>
          <div id="signin-error" class="signin-error" hidden></div>
          <form id="signin-form" novalidate>
            <div class="signin-field">
              <label for="si-email">Email</label>
              <input type="email" id="si-email" placeholder="you@example.com" autocomplete="email" required />
            </div>
            <div class="signin-field">
              <label for="si-password">Password</label>
              <input type="password" id="si-password" placeholder="••••••••" autocomplete="current-password" required />
            </div>
            <button type="submit" class="signin-submit" id="signin-btn">Sign In</button>
          </form>
          <p class="signin-footer">Don't have an account? <a href="#" id="signup-link">Create one</a></p>
          <p class="signin-demo">Demo: use any email + password "tabla123"</p>
        </div>
      </div>
    </div>`;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

interface TablaUser { name: string; email: string; since: string; }

function getSignedInUser(): TablaUser | null {
    try {
        const raw = localStorage.getItem('tabla_user');
        return raw ? JSON.parse(raw) as TablaUser : null;
    } catch { return null; }
}

function signIn(email: string, password: string): string | null {
    if (password !== 'tabla123') return 'Incorrect password. (Demo: use "tabla123")';
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const user: TablaUser = { name, email, since: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) };
    localStorage.setItem('tabla_user', JSON.stringify(user));
    return null;
}

function signOut(): void {
    localStorage.removeItem('tabla_user');
}

// ─── Page registry ───────────────────────────────────────────────────────────

type PageId = 'explore' | 'near-me' | 'cuisines' | 'saved' | 'deals' | 'sign-in';

const PAGE_BUILDERS: Record<Exclude<PageId, 'explore'>, () => string> = {
    'near-me': buildNearMePage,
    'cuisines': buildCuisinesPage,
    'saved': buildSavedPage,
    'deals': buildDealsPage,
    'sign-in': buildSignInPage,
};

// ─── DOM references ──────────────────────────────────────────────────────────

const exploreSection = document.getElementById('explore-page') as HTMLElement;
const dynamicPage = document.getElementById('dynamic-page') as HTMLElement;
const navLinks = document.querySelectorAll<HTMLAnchorElement>('[data-page]');

// ─── Sign-in nav button label ─────────────────────────────────────────────────

function refreshSignInLabel(): void {
    const user = getSignedInUser();
    const signinNavBtn = document.querySelector<HTMLElement>('[data-page="sign-in"]');
    if (signinNavBtn) {
        signinNavBtn.textContent = user ? `👤 ${user.name.split(' ')[0]}` : 'Sign In';
    }
}

// ─── Page switch ─────────────────────────────────────────────────────────────

export function switchPage(page: PageId): void {
    const isExplore = page === 'explore';
    exploreSection.style.display = isExplore ? '' : 'none';
    dynamicPage.hidden = isExplore;

    navLinks.forEach(link => {
        const active = link.dataset['page'] === page;
        link.classList.toggle('active', active);
        link.setAttribute('aria-current', active ? 'page' : 'false');
    });

    if (!isExplore) {
        const builder = PAGE_BUILDERS[page as Exclude<PageId, 'explore'>];
        dynamicPage.innerHTML = builder ? builder() : '<div class="page-wrap"><p>Coming soon.</p></div>';
        wirePageEvents(page);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshSignInLabel();
}

// ─── Wire interactivity after each page render ───────────────────────────────

function wirePageEvents(page: PageId): void {
    if (page === 'near-me') wireNearMe();
    if (page === 'cuisines') wireCuisines();
    if (page === 'deals') wireDeals();
    if (page === 'sign-in') wireSignIn();
    if (page === 'saved') wireSaved();

    // Generic: navigate-to-explore CTAs
    dynamicPage.querySelectorAll<HTMLButtonElement>('[data-nav="explore"]').forEach(btn => {
        btn.addEventListener('click', () => switchPage('explore'));
    });
}

function wireNearMe(): void {
    const geoBtn = document.getElementById('use-location-btn') as HTMLButtonElement | null;
    const geoStatus = document.getElementById('geo-status') as HTMLElement | null;
    geoBtn?.addEventListener('click', () => {
        if (!navigator.geolocation) {
            geoStatus!.textContent = 'Geolocation not supported';
            return;
        }
        geoBtn.textContent = 'Detecting…';
        geoBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(
            pos => {
                geoStatus!.textContent = `📍 ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)} — showing nearest first`;
            },
            () => {
                geoStatus!.textContent = 'Could not detect location. Using approximate distances.';
                geoBtn!.style.display = 'none';
            },
            { timeout: 8000 },
        );
    });
}

function wireCuisines(): void {
    const catCards = dynamicPage.querySelectorAll<HTMLElement>('.cuisine-cat-card');
    const filteredDiv = document.getElementById('cuisine-filtered') as HTMLDivElement | null;
    catCards.forEach(card => {
        card.addEventListener('click', () => {
            const cKey = card.dataset['cuisine']!;
            const matches = ALL_RESTAURANTS.filter(r => r.cuisine === cKey);
            if (!filteredDiv) return;
            filteredDiv.hidden = false;
            filteredDiv.innerHTML = `<h2 class="page-section-title">${cKey} (${matches.length})</h2>` +
                matches.map(r => miniCard(r)).join('');
            filteredDiv.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function wireSaved(): void {
    // Saved page is read-only — nothing to wire beyond navigating to explore
}

function wireDeals(): void {
    dynamicPage.querySelectorAll<HTMLButtonElement>('.deal-claim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pct = btn.dataset['deal'];
            btn.textContent = '✓ Claimed!';
            btn.style.background = '#4A7C59';
            btn.disabled = true;
            showToast({ message: `${pct}% deal saved to your account!`, type: 'success', duration: 3500 });
        });
    });
}

function wireSignIn(): void {
    const form = document.getElementById('signin-form') as HTMLFormElement | null;
    const errEl = document.getElementById('signin-error') as HTMLElement | null;
    const signoutBtn = document.getElementById('signout-btn') as HTMLButtonElement | null;

    signoutBtn?.addEventListener('click', () => {
        signOut();
        showToast({ message: 'Signed out', type: 'info', duration: 3000 });
        switchPage('sign-in');
    });

    form?.addEventListener('submit', e => {
        e.preventDefault();
        const email = (document.getElementById('si-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('si-password') as HTMLInputElement).value;

        if (!email || !password) {
            if (errEl) { errEl.textContent = 'Please fill in all fields.'; errEl.hidden = false; }
            return;
        }

        const error = signIn(email, password);
        if (error) {
            if (errEl) { errEl.textContent = error; errEl.hidden = false; }
        } else {
            if (errEl) errEl.hidden = true;
            showToast({ message: `Welcome to Tabla! You're signed in.`, type: 'success', duration: 4000 });
            switchPage('sign-in'); // re-render to show logged-in view
        }
    });

    document.getElementById('signup-link')?.addEventListener('click', e => {
        e.preventDefault();
        showToast({ message: 'Full sign-up coming soon! Use demo credentials for now.', type: 'info', duration: 4000 });
    });
}

// ─── Init nav links ──────────────────────────────────────────────────────────

export function initPages(): void {
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = link.dataset['page'] as PageId;
            if (page) switchPage(page);
        });
    });

    // Handle hash on load
    const hash = window.location.hash.replace('#', '') as PageId;
    if (hash && hash !== 'explore' && PAGE_BUILDERS[hash as Exclude<PageId, 'explore'>]) {
        switchPage(hash);
    }

    refreshSignInLabel();
}

initPages();
