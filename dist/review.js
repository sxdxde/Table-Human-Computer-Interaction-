import { showToast } from './toast';
const RATING_LABELS = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Great',
    5: 'Outstanding',
};
const DRAFT_KEY_PREFIX = 'tabla_draft_review_';
const MIN_REVIEW_LEN = 20;
const MAX_REVIEW_LEN = 1000;
const DANGER_THRESHOLD = 950;
const SUBMIT_DELAY_MS = 500;
// ─── DOM refs ─────────────────────────────────────────────────────────────────
const modal = document.getElementById('review-modal');
const modalClose = document.getElementById('review-close');
const reviewCancel = document.getElementById('review-cancel');
const reviewDone = document.getElementById('review-done');
const restaurantNameEl = modal.querySelector('.modal-restaurant-name');
const stepLabel = modal.querySelector('.modal-step-label');
const step1Panel = document.getElementById('step-1');
const step2Panel = document.getElementById('step-2');
const step3Panel = document.getElementById('step-3');
const successPanel = document.getElementById('step-success');
const step1Next = document.getElementById('step1-next');
const step2Back = document.getElementById('step2-back');
const step2Next = document.getElementById('step2-next');
const step3Back = document.getElementById('step3-back');
const step3Submit = document.getElementById('step3-submit');
const ratingLabelEl = document.getElementById('rating-label');
const reviewTextarea = document.getElementById('review-text');
const charCount = document.getElementById('char-count');
const reviewError = document.getElementById('review-error');
const photoZone = document.getElementById('photo-zone');
const photoInput = document.getElementById('photo-input');
const progressSteps = modal.querySelectorAll('.progress-step');
// ─── State ────────────────────────────────────────────────────────────────────
let draft = {
    restaurantId: 0,
    restaurantName: '',
    rating: null,
    text: '',
    photoDataUrl: null,
    step: 1,
};
let focusTrapCleanup = null;
// ─── Draft persistence (Raskin's 1st Law: never lose user work) ───────────────
function draftKey(id) {
    return `${DRAFT_KEY_PREFIX}${id}`;
}
function saveDraft() {
    try {
        localStorage.setItem(draftKey(draft.restaurantId), JSON.stringify(draft));
        window.dispatchEvent(new CustomEvent('tabla:draft-saved'));
    }
    catch { /* quota */ }
}
function loadDraft(restaurantId) {
    try {
        const raw = localStorage.getItem(draftKey(restaurantId));
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function clearDraft(restaurantId) {
    try {
        localStorage.removeItem(draftKey(restaurantId));
    }
    catch { /* ignore */ }
}
// ─── Step navigation (Shneiderman Rule 4 — Closure) ──────────────────────────
const STEP_PANELS = {
    '1': step1Panel,
    '2': step2Panel,
    '3': step3Panel,
    'success': successPanel,
};
const STEP_TITLES = {
    '1': 'How was your experience?',
    '2': 'Tell us more',
    '3': 'Add a photo',
    'success': 'Thank you!',
};
function goToStep(step) {
    draft.step = step;
    saveDraft();
    Object.entries(STEP_PANELS).forEach(([key, panel]) => {
        panel.hidden = key !== String(step);
    });
    const stepNum = step === 'success' ? 3 : step;
    stepLabel.textContent = step === 'success' ? '' : `Step ${stepNum} of 3`;
    const titleEl = document.getElementById('review-modal-title');
    titleEl.textContent = STEP_TITLES[String(step)] ?? '';
    // Update progress indicators
    progressSteps.forEach((s) => {
        const n = Number(s.dataset['step']);
        s.classList.toggle('active', n === stepNum);
        s.classList.toggle('completed', n < stepNum);
    });
    // Announce step change to screen readers
    stepLabel.setAttribute('aria-live', 'polite');
}
// ─── Star rating ──────────────────────────────────────────────────────────────
function initStarRating() {
    const radios = modal.querySelectorAll('input[name="rating"]');
    radios.forEach((radio) => {
        radio.addEventListener('change', () => {
            const val = Number(radio.value);
            draft.rating = val;
            ratingLabelEl.textContent = RATING_LABELS[val];
            step1Next.disabled = false;
            step1Next.removeAttribute('aria-disabled');
            saveDraft();
        });
    });
}
function restoreStarRating(rating) {
    const radio = modal.querySelector(`input[name="rating"][value="${rating}"]`);
    if (radio) {
        radio.checked = true;
        ratingLabelEl.textContent = RATING_LABELS[rating];
        step1Next.disabled = false;
        step1Next.removeAttribute('aria-disabled');
    }
}
// ─── Textarea validation (Nielsen H5: error prevention, H9: plain English errors)
function updateCharCount() {
    const len = reviewTextarea.value.length;
    charCount.textContent = `${len} / ${MAX_REVIEW_LEN}`;
    charCount.style.color = len >= DANGER_THRESHOLD
        ? 'var(--color-danger)'
        : 'var(--color-neutral)';
    const valid = len >= MIN_REVIEW_LEN;
    step2Next.disabled = !valid;
    step2Next.toggleAttribute('aria-disabled', !valid);
    if (valid) {
        reviewError.hidden = true;
    }
    draft.text = reviewTextarea.value;
    saveDraft();
}
// ─── Photo upload ─────────────────────────────────────────────────────────────
function resetPhotoZone() {
    photoZone.innerHTML = `
        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor"
             stroke-width="1.5" fill="none" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p>Tap to add a photo</p>
        <p class="photo-hint">JPG or PNG, max 10MB</p>`;
}
function initPhotoUpload() {
    photoZone.addEventListener('click', () => photoInput.click());
    photoZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            photoInput.click();
        }
    });
    photoInput.addEventListener('change', () => {
        const file = photoInput.files?.[0];
        if (!file)
            return;
        if (file.size > 10 * 1024 * 1024) {
            showToast({ message: 'Photo must be under 10MB.', type: 'error' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result;
            draft.photoDataUrl = result;
            saveDraft();
            photoZone.innerHTML = `<img src="${result}" alt="Your uploaded photo"
                style="width:100%;height:180px;object-fit:cover;border-radius:8px;">`;
        };
        reader.readAsDataURL(file);
    });
}
// ─── Focus trap (accessibility) ───────────────────────────────────────────────
function trapFocus(container) {
    const focusable = () => Array.from(container.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex="0"]')).filter((el) => !el.closest('[hidden]'));
    function handleKeydown(e) {
        if (e.key !== 'Tab')
            return;
        const els = focusable();
        if (els.length === 0)
            return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
        else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
    container.addEventListener('keydown', handleKeydown);
    return () => container.removeEventListener('keydown', handleKeydown);
}
// ─── Open / close ─────────────────────────────────────────────────────────────
export function openReviewModal(restaurantId, name) {
    draft = {
        restaurantId,
        restaurantName: name,
        rating: null,
        text: '',
        photoDataUrl: null,
        step: 1,
    };
    // Restore any saved draft (Raskin: never lose work)
    const saved = loadDraft(restaurantId);
    if (saved) {
        draft = saved;
        if (saved.rating)
            restoreStarRating(saved.rating);
        if (saved.text) {
            reviewTextarea.value = saved.text;
            updateCharCount();
        }
        if (saved.photoDataUrl) {
            photoZone.innerHTML = `<img src="${saved.photoDataUrl}" alt="Your uploaded photo"
                style="width:100%;height:180px;object-fit:cover;border-radius:8px;">`;
        }
    }
    else {
        // Reset form fields
        modal.querySelectorAll('input[name="rating"]')
            .forEach((r) => { r.checked = false; });
        reviewTextarea.value = '';
        ratingLabelEl.textContent = '';
        step1Next.disabled = true;
        step1Next.setAttribute('aria-disabled', 'true');
        step2Next.disabled = true;
        step2Next.setAttribute('aria-disabled', 'true');
        charCount.textContent = `0 / ${MAX_REVIEW_LEN}`;
        resetPhotoZone();
        photoInput.value = '';
    }
    restaurantNameEl.textContent = name;
    goToStep(draft.step);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    focusTrapCleanup = trapFocus(modal);
    // Focus first interactive element
    const firstFocusable = modal.querySelector('button:not([disabled]), input:not([disabled])');
    firstFocusable?.focus();
}
function closeModal(force = false) {
    const hasDraft = draft.rating !== null ||
        draft.text.trim().length > 0 ||
        draft.photoDataUrl !== null;
    if (!force && hasDraft) {
        const confirmed = window.confirm("You'll lose your draft review. Are you sure?");
        if (!confirmed)
            return;
    }
    modal.hidden = true;
    document.body.style.overflow = '';
    focusTrapCleanup?.();
    focusTrapCleanup = null;
}
// ─── Submit (Shneiderman Rule 3: every action gets visible feedback) ──────────
function submitReview() {
    step3Submit.disabled = true;
    step3Submit.textContent = 'Submitting…';
    setTimeout(() => {
        clearDraft(draft.restaurantId);
        goToStep('success');
        showToast({
            message: 'Review submitted! Visible within 24 hours.',
            type: 'success',
            duration: 5000,
        });
        step3Submit.disabled = false;
        step3Submit.textContent = 'Submit review';
    }, SUBMIT_DELAY_MS);
}
// ─── Wire step buttons ────────────────────────────────────────────────────────
function initStepNavigation() {
    step1Next.addEventListener('click', () => {
        if (draft.rating !== null)
            goToStep(2);
    });
    step2Back.addEventListener('click', () => goToStep(1));
    step2Next.addEventListener('click', () => {
        if (reviewTextarea.value.length < MIN_REVIEW_LEN) {
            reviewError.hidden = false;
            reviewTextarea.focus();
            return;
        }
        goToStep(3);
    });
    step3Back.addEventListener('click', () => goToStep(2));
    step3Submit.addEventListener('click', () => submitReview());
    reviewCancel.addEventListener('click', () => closeModal());
    modalClose.addEventListener('click', () => closeModal());
    reviewDone.addEventListener('click', () => closeModal(true));
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal)
            closeModal();
    });
    // Close on Escape (Nielsen Heuristic 3)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden)
            closeModal();
    });
    // Textarea live validation
    reviewTextarea.addEventListener('input', updateCharCount);
}
// ─── Offline detection ────────────────────────────────────────────────────────
function initOfflineDetection() {
    const banner = document.getElementById('offline-banner');
    function update() {
        banner.hidden = navigator.onLine;
        if (!navigator.onLine) {
            showToast({
                message: "You're offline. Showing recently viewed restaurants.",
                type: 'error',
                duration: 6000,
            });
        }
    }
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update(); // check current state on load
}
// ─── Delegated "Write a Review" handler ──────────────────────────────────────
function initWriteReviewDelegation() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-write-review');
        if (!btn)
            return;
        const card = btn.closest('.restaurant-card');
        if (!card)
            return;
        const id = Number(card.dataset['id']);
        const name = card.querySelector('.card-name')?.textContent ?? '';
        openReviewModal(id, name);
    });
}
// ─── Init ─────────────────────────────────────────────────────────────────────
export function initReview() {
    initStarRating();
    initPhotoUpload();
    initStepNavigation();
    initOfflineDetection();
    initWriteReviewDelegation();
    // Cross-module close signal from shortcuts.ts (avoids circular import)
    window.addEventListener('tabla:close-modal', () => {
        if (!modal.hidden)
            closeModal(false);
    });
}
initReview();
