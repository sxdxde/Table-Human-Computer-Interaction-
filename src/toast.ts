// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'info' | 'success' | 'error';

export interface ToastConfig {
    message: string;
    type?: ToastType;
    duration?: number;
    undoCallback?: () => void;
}

// ─── DOM ref ──────────────────────────────────────────────────────────────────

function getContainer(): HTMLDivElement {
    return document.getElementById('toast-container') as HTMLDivElement;
}

// ─── Core function (exported for use across all modules) ──────────────────────

export function showToast({
    message,
    type = 'info',
    duration = 3500,
    undoCallback,
}: ToastConfig): void {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-msg';
    msgSpan.innerHTML = message; // allow <strong> etc.
    toast.appendChild(msgSpan);

    if (undoCallback) {
        const undoBtn = document.createElement('button');
        undoBtn.className = 'toast-undo';
        undoBtn.textContent = 'Undo';
        undoBtn.setAttribute('aria-label', 'Undo this action');
        undoBtn.addEventListener('click', (): void => {
            undoCallback();
            dismissToast(toast);
        }, { once: true });
        toast.appendChild(undoBtn);
    }

    getContainer().appendChild(toast);

    // Trigger entrance animation on next frame
    requestAnimationFrame((): void => {
        toast.classList.add('visible');
    });

    // Auto-dismiss
    setTimeout((): void => dismissToast(toast), duration);
}

function dismissToast(toast: HTMLDivElement): void {
    toast.classList.remove('visible');
    setTimeout((): void => toast.remove(), 320);
}
