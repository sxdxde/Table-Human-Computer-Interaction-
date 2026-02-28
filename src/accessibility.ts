// ─── Types ────────────────────────────────────────────────────────────────────

interface A11yViolation {
    element: HTMLElement;
    issue: string;
}

// ─── Runtime accessibility audit (dev-mode only) ─────────────────────────────

export function runA11yAudit(): A11yViolation[] {
    const violations: A11yViolation[] = [];

    // Every img must have alt
    document.querySelectorAll<HTMLImageElement>('img').forEach(
        (img: HTMLImageElement): void => {
            if (!img.hasAttribute('alt')) {
                violations.push({ element: img, issue: 'Missing alt attribute' });
            }
        }
    );

    // Every button must have accessible name
    document.querySelectorAll<HTMLButtonElement>('button').forEach(
        (btn: HTMLButtonElement): void => {
            const name: string = (
                btn.getAttribute('aria-label') ??
                btn.getAttribute('aria-labelledby') ??
                btn.textContent ??
                ''
            ).trim();
            if (!name) {
                violations.push({ element: btn, issue: 'Button missing accessible name' });
            }
        }
    );

    // Every input (non-hidden) must have an associated label
    document.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]):not([aria-hidden])').forEach(
        (input: HTMLInputElement): void => {
            const id: string | null = input.getAttribute('id');
            const ariaLabel: string | null = input.getAttribute('aria-label');
            const hasLabel: boolean = !!ariaLabel ||
                (!!id && !!document.querySelector<HTMLLabelElement>(`label[for="${id}"]`));
            if (!hasLabel) {
                violations.push({ element: input, issue: `Input #${id ?? '(no id)'} missing label` });
            }
        }
    );

    if (violations.length > 0) {
        console.group('[Tabla A11y Audit]');
        violations.forEach((v: A11yViolation): void => {
            console.warn(v.issue, v.element);
        });
        console.groupEnd();
    } else {
        console.info('[Tabla A11y Audit] ✓ No violations found');
    }

    return violations;
}

// ─── Focus ring restoration ────────────────────────────────────────────────────
// Shows gold focus rings for keyboard users only — not mouse clicks

export function initFocusVisible(): void {
    let usingKeyboard = false;

    document.addEventListener('keydown', (): void => { usingKeyboard = true; });
    document.addEventListener('mousedown', (): void => { usingKeyboard = false; });

    document.addEventListener('focusin', (e: FocusEvent): void => {
        const target = e.target as HTMLElement;
        target.classList.toggle('focus-visible', usingKeyboard);
    });

    document.addEventListener('focusout', (e: FocusEvent): void => {
        (e.target as HTMLElement).classList.remove('focus-visible');
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initAccessibility(): void {
    initFocusVisible();
    // Run audit after DOM settles — dev only (localhost check rather than import.meta.env)
    const isDev: boolean = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (isDev) {
        setTimeout((): void => { runA11yAudit(); }, 2000);
    }
}

initAccessibility();
