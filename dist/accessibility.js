// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Runtime accessibility audit (dev-mode only) ─────────────────────────────
export function runA11yAudit() {
    const violations = [];
    // Every img must have alt
    document.querySelectorAll('img').forEach((img) => {
        if (!img.hasAttribute('alt')) {
            violations.push({ element: img, issue: 'Missing alt attribute' });
        }
    });
    // Every button must have accessible name
    document.querySelectorAll('button').forEach((btn) => {
        const name = (btn.getAttribute('aria-label') ??
            btn.getAttribute('aria-labelledby') ??
            btn.textContent ??
            '').trim();
        if (!name) {
            violations.push({ element: btn, issue: 'Button missing accessible name' });
        }
    });
    // Every input (non-hidden) must have an associated label
    document.querySelectorAll('input:not([type="hidden"]):not([aria-hidden])').forEach((input) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const hasLabel = !!ariaLabel ||
            (!!id && !!document.querySelector(`label[for="${id}"]`));
        if (!hasLabel) {
            violations.push({ element: input, issue: `Input #${id ?? '(no id)'} missing label` });
        }
    });
    if (violations.length > 0) {
        console.group('[Tabla A11y Audit]');
        violations.forEach((v) => {
            console.warn(v.issue, v.element);
        });
        console.groupEnd();
    }
    else {
        console.info('[Tabla A11y Audit] ✓ No violations found');
    }
    return violations;
}
// ─── Focus ring restoration ────────────────────────────────────────────────────
// Shows gold focus rings for keyboard users only — not mouse clicks
export function initFocusVisible() {
    let usingKeyboard = false;
    document.addEventListener('keydown', () => { usingKeyboard = true; });
    document.addEventListener('mousedown', () => { usingKeyboard = false; });
    document.addEventListener('focusin', (e) => {
        const target = e.target;
        target.classList.toggle('focus-visible', usingKeyboard);
    });
    document.addEventListener('focusout', (e) => {
        e.target.classList.remove('focus-visible');
    });
}
// ─── Init ─────────────────────────────────────────────────────────────────────
export function initAccessibility() {
    initFocusVisible();
    // Run audit after DOM settles — dev only (localhost check rather than import.meta.env)
    const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (isDev) {
        setTimeout(() => { runA11yAudit(); }, 2000);
    }
}
initAccessibility();
