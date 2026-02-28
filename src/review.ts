import { showToast } from './toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type StarRating = 1 | 2 | 3 | 4 | 5;
type ReviewStep = 1 | 2 | 3 | 'success';

interface ReviewDraft {
    restaurantId: number;
    restaurantName: string;
    rating: StarRating | null;
    text: string;
    photoDataUrl: string | null;
    step: ReviewStep;
}

const RATING_LABELS: Record<StarRating, string> = {
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

const modal = document.getElementById('review-modal') as HTMLDivElement;
const modalClose = document.getElementById('review-close') as HTMLButtonElement;
const reviewCancel = document.getElementById('review-cancel') as HTMLButtonElement;
const reviewDone = document.getElementById('review-done') as HTMLButtonElement;
const restaurantNameEl = modal.querySelector('.modal-restaurant-name') as HTMLParagraphElement;
const stepLabel = modal.querySelector('.modal-step-label') as HTMLParagraphElement;

const step1Panel = document.getElementById('step-1') as HTMLDivElement;
const step2Panel = document.getElementById('step-2') as HTMLDivElement;
const step3Panel = document.getElementById('step-3') as HTMLDivElement;
const successPanel = document.getElementById('step-success') as HTMLDivElement;

const step1Next = document.getElementById('step1-next') as HTMLButtonElement;
const step2Back = document.getElementById('step2-back') as HTMLButtonElement;
const step2Next = document.getElementById('step2-next') as HTMLButtonElement;
const step3Back = document.getElementById('step3-back') as HTMLButtonElement;
const step3Submit = document.getElementById('step3-submit') as HTMLButtonElement;

const ratingLabelEl = document.getElementById('rating-label') as HTMLParagraphElement;
const reviewTextarea = document.getElementById('review-text') as HTMLTextAreaElement;
const charCount = document.getElementById('char-count') as HTMLSpanElement;
const reviewError = document.getElementById('review-error') as HTMLSpanElement;
const photoZone = document.getElementById('photo-zone') as HTMLDivElement;
const photoInput = document.getElementById('photo-input') as HTMLInputElement;

const progressSteps = modal.querySelectorAll<HTMLDivElement>('.progress-step');

// ─── State ────────────────────────────────────────────────────────────────────

let draft: ReviewDraft = {
    restaurantId: 0,
    restaurantName: '',
    rating: null,
    text: '',
    photoDataUrl: null,
    step: 1,
};

let focusTrapCleanup: (() => void) | null = null;

// ─── Draft persistence (Raskin's 1st Law: never lose user work) ───────────────

function draftKey(id: number): string {
    return `${DRAFT_KEY_PREFIX}${id}`;
}

function saveDraft(): void {
    try {
        localStorage.setItem(draftKey(draft.restaurantId), JSON.stringify(draft));
        window.dispatchEvent(new CustomEvent('tabla:draft-saved'));
    } catch { /* quota */ }
}

function loadDraft(restaurantId: number): ReviewDraft | null {
    try {
        const raw: string | null = localStorage.getItem(draftKey(restaurantId));
        return raw ? (JSON.parse(raw) as ReviewDraft) : null;
    } catch {
        return null;
    }
}

function clearDraft(restaurantId: number): void {
    try {
        localStorage.removeItem(draftKey(restaurantId));
    } catch { /* ignore */ }
}

// ─── Step navigation (Shneiderman Rule 4 — Closure) ──────────────────────────

const STEP_PANELS: Record<string, HTMLElement> = {
    '1': step1Panel,
    '2': step2Panel,
    '3': step3Panel,
    'success': successPanel,
};

const STEP_TITLES: Record<string, string> = {
    '1': 'How was your experience?',
    '2': 'Tell us more',
    '3': 'Add a photo',
    'success': 'Thank you!',
};

function goToStep(step: ReviewStep): void {
    draft.step = step;
    saveDraft();

    Object.entries(STEP_PANELS).forEach(([key, panel]: [string, HTMLElement]): void => {
        panel.hidden = key !== String(step);
    });

    const stepNum: number = step === 'success' ? 3 : (step as number);
    stepLabel.textContent = step === 'success' ? '' : `Step ${stepNum} of 3`;

    const titleEl = document.getElementById('review-modal-title') as HTMLHeadingElement;
    titleEl.textContent = STEP_TITLES[String(step)] ?? '';

    // Update progress indicators
    progressSteps.forEach((s: HTMLDivElement): void => {
        const n: number = Number(s.dataset['step']);
        s.classList.toggle('active', n === stepNum);
        s.classList.toggle('completed', n < stepNum);
    });

    // Announce step change to screen readers
    stepLabel.setAttribute('aria-live', 'polite');
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function initStarRating(): void {
    const radios = modal.querySelectorAll<HTMLInputElement>('input[name="rating"]');
    radios.forEach((radio: HTMLInputElement): void => {
        radio.addEventListener('change', (): void => {
            const val: StarRating = Number(radio.value) as StarRating;
            draft.rating = val;
            ratingLabelEl.textContent = RATING_LABELS[val];
            step1Next.disabled = false;
            step1Next.removeAttribute('aria-disabled');
            saveDraft();
        });
    });
}

function restoreStarRating(rating: StarRating): void {
    const radio = modal.querySelector<HTMLInputElement>(`input[name="rating"][value="${rating}"]`);
    if (radio) {
        radio.checked = true;
        ratingLabelEl.textContent = RATING_LABELS[rating];
        step1Next.disabled = false;
        step1Next.removeAttribute('aria-disabled');
    }
}

// ─── Textarea validation (Nielsen H5: error prevention, H9: plain English errors)

function updateCharCount(): void {
    const len: number = reviewTextarea.value.length;
    charCount.textContent = `${len} / ${MAX_REVIEW_LEN}`;
    charCount.style.color = len >= DANGER_THRESHOLD
        ? 'var(--color-danger)'
        : 'var(--color-neutral)';

    const valid: boolean = len >= MIN_REVIEW_LEN;
    step2Next.disabled = !valid;
    step2Next.toggleAttribute('aria-disabled', !valid);
    if (valid) { reviewError.hidden = true; }

    draft.text = reviewTextarea.value;
    saveDraft();
}

// ─── Photo upload ─────────────────────────────────────────────────────────────

function resetPhotoZone(): void {
    photoZone.innerHTML = `
        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor"
             stroke-width="1.5" fill="none" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p>Tap to add a photo</p>
        <p class="photo-hint">JPG or PNG, max 10MB</p>`;
}

function initPhotoUpload(): void {
    photoZone.addEventListener('click', (): void => photoInput.click());
    photoZone.addEventListener('keydown', (e: KeyboardEvent): void => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); photoInput.click(); }
    });

    photoInput.addEventListener('change', (): void => {
        const file: File | undefined = photoInput.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            showToast({ message: 'Photo must be under 10MB.', type: 'error' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev: ProgressEvent<FileReader>): void => {
            const result: string = ev.target?.result as string;
            draft.photoDataUrl = result;
            saveDraft();
            photoZone.innerHTML = `<img src="${result}" alt="Your uploaded photo"
                style="width:100%;height:180px;object-fit:cover;border-radius:8px;">`;
        };
        reader.readAsDataURL(file);
    });
}

// ─── Focus trap (accessibility) ───────────────────────────────────────────────

function trapFocus(container: HTMLElement): () => void {
    const focusable = (): HTMLElement[] =>
        Array.from(container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        )).filter((el: HTMLElement) => !el.closest('[hidden]'));

    function handleKeydown(e: KeyboardEvent): void {
        if (e.key !== 'Tab') return;
        const els: HTMLElement[] = focusable();
        if (els.length === 0) return;
        const first: HTMLElement = els[0];
        const last: HTMLElement = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    }

    container.addEventListener('keydown', handleKeydown);
    return (): void => container.removeEventListener('keydown', handleKeydown);
}

// ─── Open / close ─────────────────────────────────────────────────────────────

export function openReviewModal(restaurantId: number, name: string): void {
    draft = {
        restaurantId,
        restaurantName: name,
        rating: null,
        text: '',
        photoDataUrl: null,
        step: 1,
    };

    // Restore any saved draft (Raskin: never lose work)
    const saved: ReviewDraft | null = loadDraft(restaurantId);
    if (saved) {
        draft = saved;
        if (saved.rating) restoreStarRating(saved.rating);
        if (saved.text) {
            reviewTextarea.value = saved.text;
            updateCharCount();
        }
        if (saved.photoDataUrl) {
            photoZone.innerHTML = `<img src="${saved.photoDataUrl}" alt="Your uploaded photo"
                style="width:100%;height:180px;object-fit:cover;border-radius:8px;">`;
        }
    } else {
        // Reset form fields
        modal.querySelectorAll<HTMLInputElement>('input[name="rating"]')
            .forEach((r: HTMLInputElement) => { r.checked = false; });
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
    const firstFocusable = modal.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled])'
    );
    firstFocusable?.focus();
}

function closeModal(force = false): void {
    const hasDraft: boolean =
        draft.rating !== null ||
        draft.text.trim().length > 0 ||
        draft.photoDataUrl !== null;

    if (!force && hasDraft) {
        const confirmed: boolean = window.confirm(
            "You'll lose your draft review. Are you sure?"
        );
        if (!confirmed) return;
    }

    modal.hidden = true;
    document.body.style.overflow = '';
    focusTrapCleanup?.();
    focusTrapCleanup = null;
}

// ─── Submit (Shneiderman Rule 3: every action gets visible feedback) ──────────

function submitReview(): void {
    step3Submit.disabled = true;
    step3Submit.textContent = 'Submitting…';

    setTimeout((): void => {
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

function initStepNavigation(): void {
    step1Next.addEventListener('click', (): void => {
        if (draft.rating !== null) goToStep(2);
    });

    step2Back.addEventListener('click', (): void => goToStep(1));
    step2Next.addEventListener('click', (): void => {
        if (reviewTextarea.value.length < MIN_REVIEW_LEN) {
            reviewError.hidden = false;
            reviewTextarea.focus();
            return;
        }
        goToStep(3);
    });

    step3Back.addEventListener('click', (): void => goToStep(2));
    step3Submit.addEventListener('click', (): void => submitReview());

    reviewCancel.addEventListener('click', (): void => closeModal());
    modalClose.addEventListener('click', (): void => closeModal());
    reviewDone.addEventListener('click', (): void => closeModal(true));

    // Close on overlay click
    modal.addEventListener('click', (e: MouseEvent): void => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape (Nielsen Heuristic 3)
    document.addEventListener('keydown', (e: KeyboardEvent): void => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    // Textarea live validation
    reviewTextarea.addEventListener('input', updateCharCount);
}

// ─── Offline detection ────────────────────────────────────────────────────────

function initOfflineDetection(): void {
    const banner = document.getElementById('offline-banner') as HTMLDivElement;

    function update(): void {
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

function initWriteReviewDelegation(): void {
    document.addEventListener('click', (e: MouseEvent): void => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.btn-write-review');
        if (!btn) return;
        const card = btn.closest<HTMLElement>('.restaurant-card');
        if (!card) return;
        const id: number = Number(card.dataset['id']);
        const name: string = card.querySelector<HTMLElement>('.card-name')?.textContent ?? '';
        openReviewModal(id, name);
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initReview(): void {
    initStarRating();
    initPhotoUpload();
    initStepNavigation();
    initOfflineDetection();
    initWriteReviewDelegation();

    // Cross-module close signal from shortcuts.ts (avoids circular import)
    window.addEventListener('tabla:close-modal', (): void => {
        if (!modal.hidden) closeModal(false);
    });
}

initReview();
