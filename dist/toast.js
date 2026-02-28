// ─── Types ────────────────────────────────────────────────────────────────────
// ─── DOM ref ──────────────────────────────────────────────────────────────────
function getContainer() {
    return document.getElementById('toast-container');
}
// ─── Core function (exported for use across all modules) ──────────────────────
export function showToast({ message, type = 'info', duration = 3500, undoCallback, }) {
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
        undoBtn.addEventListener('click', () => {
            undoCallback();
            dismissToast(toast);
        }, { once: true });
        toast.appendChild(undoBtn);
    }
    getContainer().appendChild(toast);
    // Trigger entrance animation on next frame
    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });
    // Auto-dismiss
    setTimeout(() => dismissToast(toast), duration);
}
function dismissToast(toast) {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 320);
}
