// ─── Types ────────────────────────────────────────────────────────────────────

type ShortcutKey =
    | '/'
    | 'f' | 'F'
    | '?'
    | 'Escape'
    | 'ArrowDown'
    | 'ArrowUp'
    | 'Enter'
    | 's' | 'S';

interface ShortcutHandler {
    key: ShortcutKey;
    handler: (e: KeyboardEvent) => void;
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const shortcutsBtn = document.getElementById('shortcuts-btn') as HTMLButtonElement;
const shortcutsPanel = document.getElementById('shortcuts-panel') as HTMLDivElement;
const shortcutsClose = shortcutsPanel.querySelector<HTMLButtonElement>('.shortcuts-close')!;
const mainSearch = document.getElementById('main-search') as HTMLInputElement;
const navFavorites = document.getElementById('nav-favorites') as HTMLAnchorElement;

// ─── Panel open / close ───────────────────────────────────────────────────────

function isPanelOpen(): boolean {
    return shortcutsBtn.getAttribute('aria-expanded') === 'true';
}

export function toggleShortcutsPanel(): void {
    const open: boolean = !isPanelOpen();
    shortcutsBtn.setAttribute('aria-expanded', String(open));
    shortcutsPanel.hidden = !open;
    if (open) {
        shortcutsClose.focus();
    }
}

function closeShortcutsPanel(): void {
    shortcutsBtn.setAttribute('aria-expanded', 'false');
    shortcutsPanel.hidden = true;
}

// ─── Close all dialogs (Escape handler) ──────────────────────────────────────

export function closeAllDialogs(): void {
    // Close review modal via custom event (avoids circular import with review.ts)
    window.dispatchEvent(new CustomEvent('tabla:close-modal'));
    // Close shortcuts panel
    closeShortcutsPanel();
    // Close search suggestions
    const suggestions = document.getElementById('search-suggestions') as HTMLUListElement | null;
    if (suggestions) {
        suggestions.hidden = true;
        mainSearch.setAttribute('aria-expanded', 'false');
    }
}

// ─── Card focus navigation (ArrowDown / ArrowUp) ─────────────────────────────

function getFocusedCard(): HTMLElement | null {
    return (document.activeElement as HTMLElement)?.closest<HTMLElement>('.restaurant-card') ?? null;
}

function getAllCards(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.restaurant-card'));
}

function focusNextCard(): void {
    const cards: HTMLElement[] = getAllCards();
    if (cards.length === 0) return;
    const current: HTMLElement | null = getFocusedCard();
    if (!current) { cards[0].focus(); return; }
    const idx: number = cards.indexOf(current);
    cards[idx + 1]?.focus();
}

function focusPrevCard(): void {
    const cards: HTMLElement[] = getAllCards();
    if (cards.length === 0) return;
    const current: HTMLElement | null = getFocusedCard();
    if (!current) { cards[cards.length - 1].focus(); return; }
    const idx: number = cards.indexOf(current);
    cards[idx - 1]?.focus();
}

// ─── Shortcut dispatch table (Power Law of Practice) ─────────────────────────

const SHORTCUT_HANDLERS: ShortcutHandler[] = [
    {
        key: '/',
        handler: (e: KeyboardEvent): void => {
            e.preventDefault();
            mainSearch.focus();
        },
    },
    {
        key: 'f',
        handler: (): void => { navFavorites?.click(); },
    },
    {
        key: 'F',
        handler: (): void => { navFavorites?.click(); },
    },
    {
        key: '?',
        handler: (): void => { toggleShortcutsPanel(); },
    },
    {
        key: 'Escape',
        handler: (): void => { closeAllDialogs(); },
    },
    {
        key: 'ArrowDown',
        handler: (e: KeyboardEvent): void => {
            e.preventDefault();
            focusNextCard();
        },
    },
    {
        key: 'ArrowUp',
        handler: (e: KeyboardEvent): void => {
            e.preventDefault();
            focusPrevCard();
        },
    },
    {
        key: 'Enter',
        handler: (): void => {
            const card: HTMLElement | null = getFocusedCard();
            if (card) card.click();
        },
    },
    {
        key: 's',
        handler: (): void => {
            const card: HTMLElement | null = getFocusedCard();
            card?.querySelector<HTMLButtonElement>('.heart-btn')?.click();
        },
    },
    {
        key: 'S',
        handler: (): void => {
            const card: HTMLElement | null = getFocusedCard();
            card?.querySelector<HTMLButtonElement>('.heart-btn')?.click();
        },
    },
];

// ─── Global keydown listener ──────────────────────────────────────────────────

function isTyping(e: KeyboardEvent): boolean {
    return (e.target as HTMLElement).matches('input, textarea, select');
}

function initKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent): void => {
        // Allow Escape even when typing (to close dialogs)
        if (isTyping(e) && e.key !== 'Escape') return;

        const match: ShortcutHandler | undefined = SHORTCUT_HANDLERS.find(
            (s: ShortcutHandler): boolean => s.key === (e.key as ShortcutKey),
        );
        match?.handler(e);
    });
}

// ─── FAB button ───────────────────────────────────────────────────────────────

function initShortcutsFab(): void {
    shortcutsBtn.addEventListener('click', (): void => toggleShortcutsPanel());
    shortcutsClose.addEventListener('click', (): void => closeShortcutsPanel());

    // Close on outside click
    document.addEventListener('click', (e: MouseEvent): void => {
        if (
            !isPanelOpen() ||
            shortcutsPanel.contains(e.target as Node) ||
            shortcutsBtn.contains(e.target as Node)
        ) return;
        closeShortcutsPanel();
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initShortcuts(): void {
    initShortcutsFab();
    initKeyboardShortcuts();
}

initShortcuts();
