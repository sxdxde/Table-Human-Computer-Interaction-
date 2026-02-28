// ─── Types ────────────────────────────────────────────────────────────────────
// ─── DOM refs ─────────────────────────────────────────────────────────────────
const shortcutsBtn = document.getElementById('shortcuts-btn');
const shortcutsPanel = document.getElementById('shortcuts-panel');
const shortcutsClose = shortcutsPanel.querySelector('.shortcuts-close');
const mainSearch = document.getElementById('main-search');
const navFavorites = document.getElementById('nav-favorites');
// ─── Panel open / close ───────────────────────────────────────────────────────
function isPanelOpen() {
    return shortcutsBtn.getAttribute('aria-expanded') === 'true';
}
export function toggleShortcutsPanel() {
    const open = !isPanelOpen();
    shortcutsBtn.setAttribute('aria-expanded', String(open));
    shortcutsPanel.hidden = !open;
    if (open) {
        shortcutsClose.focus();
    }
}
function closeShortcutsPanel() {
    shortcutsBtn.setAttribute('aria-expanded', 'false');
    shortcutsPanel.hidden = true;
}
// ─── Close all dialogs (Escape handler) ──────────────────────────────────────
export function closeAllDialogs() {
    // Close review modal via custom event (avoids circular import with review.ts)
    window.dispatchEvent(new CustomEvent('tabla:close-modal'));
    // Close shortcuts panel
    closeShortcutsPanel();
    // Close search suggestions
    const suggestions = document.getElementById('search-suggestions');
    if (suggestions) {
        suggestions.hidden = true;
        mainSearch.setAttribute('aria-expanded', 'false');
    }
}
// ─── Card focus navigation (ArrowDown / ArrowUp) ─────────────────────────────
function getFocusedCard() {
    return document.activeElement?.closest('.restaurant-card') ?? null;
}
function getAllCards() {
    return Array.from(document.querySelectorAll('.restaurant-card'));
}
function focusNextCard() {
    const cards = getAllCards();
    if (cards.length === 0)
        return;
    const current = getFocusedCard();
    if (!current) {
        cards[0].focus();
        return;
    }
    const idx = cards.indexOf(current);
    cards[idx + 1]?.focus();
}
function focusPrevCard() {
    const cards = getAllCards();
    if (cards.length === 0)
        return;
    const current = getFocusedCard();
    if (!current) {
        cards[cards.length - 1].focus();
        return;
    }
    const idx = cards.indexOf(current);
    cards[idx - 1]?.focus();
}
// ─── Shortcut dispatch table (Power Law of Practice) ─────────────────────────
const SHORTCUT_HANDLERS = [
    {
        key: '/',
        handler: (e) => {
            e.preventDefault();
            mainSearch.focus();
        },
    },
    {
        key: 'f',
        handler: () => { navFavorites?.click(); },
    },
    {
        key: 'F',
        handler: () => { navFavorites?.click(); },
    },
    {
        key: '?',
        handler: () => { toggleShortcutsPanel(); },
    },
    {
        key: 'Escape',
        handler: () => { closeAllDialogs(); },
    },
    {
        key: 'ArrowDown',
        handler: (e) => {
            e.preventDefault();
            focusNextCard();
        },
    },
    {
        key: 'ArrowUp',
        handler: (e) => {
            e.preventDefault();
            focusPrevCard();
        },
    },
    {
        key: 'Enter',
        handler: () => {
            const card = getFocusedCard();
            if (card)
                card.click();
        },
    },
    {
        key: 's',
        handler: () => {
            const card = getFocusedCard();
            card?.querySelector('.heart-btn')?.click();
        },
    },
    {
        key: 'S',
        handler: () => {
            const card = getFocusedCard();
            card?.querySelector('.heart-btn')?.click();
        },
    },
];
// ─── Global keydown listener ──────────────────────────────────────────────────
function isTyping(e) {
    return e.target.matches('input, textarea, select');
}
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Allow Escape even when typing (to close dialogs)
        if (isTyping(e) && e.key !== 'Escape')
            return;
        const match = SHORTCUT_HANDLERS.find((s) => s.key === e.key);
        match?.handler(e);
    });
}
// ─── FAB button ───────────────────────────────────────────────────────────────
function initShortcutsFab() {
    shortcutsBtn.addEventListener('click', () => toggleShortcutsPanel());
    shortcutsClose.addEventListener('click', () => closeShortcutsPanel());
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!isPanelOpen() ||
            shortcutsPanel.contains(e.target) ||
            shortcutsBtn.contains(e.target))
            return;
        closeShortcutsPanel();
    });
}
// ─── Init ─────────────────────────────────────────────────────────────────────
export function initShortcuts() {
    initShortcutsFab();
    initKeyboardShortcuts();
}
initShortcuts();
