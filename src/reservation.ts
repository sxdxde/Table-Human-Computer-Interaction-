// ─── src/reservation.ts — Table Booking Modal ────────────────────────────────

import { showToast } from './toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
    id: string;
    restaurantName: string;
    date: string;
    time: string;
    guests: number;
    name: string;
    email: string;
    confirmationCode: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

let currentRestaurantId: number | null = null;
let currentRestaurantName = '';
let step = 1;
let pendingBooking: Partial<Booking> = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomCode(): string {
    return 'TBL-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

function today(): string {
    return new Date().toISOString().split('T')[0];
}

function saveBooking(b: Booking): void {
    try {
        const all: Booking[] = JSON.parse(localStorage.getItem('tabla_bookings') ?? '[]') as Booking[];
        all.push(b);
        localStorage.setItem('tabla_bookings', JSON.stringify(all));
    } catch { /* quota */ }
}

// Available time slots
const TIME_SLOTS = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
// Randomly mark some as taken (deterministic per restaurant)
function getAvailableSlots(restaurantId: number): { time: string; available: boolean }[] {
    return TIME_SLOTS.map((t, i) => ({ time: t, available: (restaurantId + i) % 3 !== 0 }));
}

// ─── Modal HTML ──────────────────────────────────────────────────────────────

function modalHTML(): string {
    return `
    <div id="res-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="res-modal-title">
      <div id="res-modal">
        <button id="res-close" aria-label="Close reservation modal">✕</button>
        <div id="res-steps">
          <div class="res-step-indicator">
            <span class="res-step-dot active" data-s="1">1</span>
            <span class="res-step-line"></span>
            <span class="res-step-dot" data-s="2">2</span>
            <span class="res-step-line"></span>
            <span class="res-step-dot" data-s="3">3</span>
          </div>
          <div id="res-step-content"></div>
        </div>
      </div>
    </div>`;
}

function step1HTML(restaurantName: string, restaurantId: number): string {
    const slots = getAvailableSlots(restaurantId);
    const dateMin = today();
    return `
    <h2 id="res-modal-title">Reserve at ${restaurantName}</h2>
    <p class="res-sub">Step 1 of 3 — Date, Time & Guests</p>
    <div class="res-field">
      <label for="res-date">Date</label>
      <input type="date" id="res-date" min="${dateMin}" value="${dateMin}" class="res-input" />
    </div>
    <div class="res-field">
      <label>Available Times</label>
      <div class="res-slots">
        ${slots.map(s => `
          <button class="res-slot ${s.available ? '' : 'taken'}"
            ${!s.available ? 'disabled' : ''}
            data-time="${s.time}">
            ${s.time}${!s.available ? '<br><small>Taken</small>' : ''}
          </button>
        `).join('')}
      </div>
    </div>
    <div class="res-field">
      <label for="res-guests">Number of Guests</label>
      <div class="res-stepper">
        <button id="guests-minus" class="stepper-btn" aria-label="Fewer guests">−</button>
        <span id="guests-count">2</span>
        <button id="guests-plus" class="stepper-btn" aria-label="More guests">+</button>
      </div>
    </div>
    <button id="res-next-1" class="res-btn-primary" disabled>Next →</button>`;
}

function step2HTML(): string {
    return `
    <h2 id="res-modal-title">Your Details</h2>
    <p class="res-sub">Step 2 of 3 — Contact Info</p>
    <div class="res-field">
      <label for="res-name">Full Name</label>
      <input type="text" id="res-name" class="res-input" placeholder="Arjun Sharma" autocomplete="name" />
    </div>
    <div class="res-field">
      <label for="res-email">Email Address</label>
      <input type="email" id="res-email" class="res-input" placeholder="you@example.com" autocomplete="email" />
      <small class="res-hint">We'll send your booking confirmation here</small>
    </div>
    <div id="res-step2-error" class="res-error" hidden></div>
    <div class="res-btn-row">
      <button id="res-back-2" class="res-btn-secondary">← Back</button>
      <button id="res-confirm" class="res-btn-primary">Confirm Booking</button>
    </div>`;
}

function step3HTML(b: Partial<Booking>): string {
    return `
    <div class="res-confirmation">
      <div class="res-check-anim">✓</div>
      <h2>Booking Confirmed!</h2>
      <p class="res-code">Confirmation Code: <strong>${b.confirmationCode}</strong></p>
      <div class="res-summary-box">
        <p>🍽️ <strong>${b.restaurantName}</strong></p>
        <p>📅 ${b.date} at ${b.time}</p>
        <p>👥 ${b.guests} guest${(b.guests ?? 1) > 1 ? 's' : ''}</p>
        <p>📧 Confirmation sent to <strong>${b.email}</strong></p>
      </div>
      <button id="res-done" class="res-btn-primary">Done</button>
    </div>`;
}

// ─── Modal controller ─────────────────────────────────────────────────────────

function renderStep(): void {
    const content = document.getElementById('res-step-content')!;
    const dots = document.querySelectorAll('.res-step-dot');
    dots.forEach(d => d.classList.toggle('active', Number(d.getAttribute('data-s')) === step));

    if (step === 1) {
        content.innerHTML = step1HTML(currentRestaurantName, currentRestaurantId!);
        wireStep1();
    } else if (step === 2) {
        content.innerHTML = step2HTML();
        wireStep2();
    } else {
        content.innerHTML = step3HTML(pendingBooking);
        document.getElementById('res-done')?.addEventListener('click', closeModal);
    }
}

function wireStep1(): void {
    let selectedTime = '';
    let guestCount = 2;

    const nextBtn = document.getElementById('res-next-1') as HTMLButtonElement;

    function checkReady(): void {
        nextBtn.disabled = !selectedTime;
    }

    document.querySelectorAll<HTMLButtonElement>('.res-slot:not(.taken)').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.res-slot').forEach(s => s.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTime = btn.dataset['time']!;
            checkReady();
        });
    });

    document.getElementById('guests-minus')?.addEventListener('click', () => {
        if (guestCount > 1) { guestCount--; document.getElementById('guests-count')!.textContent = String(guestCount); }
    });
    document.getElementById('guests-plus')?.addEventListener('click', () => {
        if (guestCount < 10) { guestCount++; document.getElementById('guests-count')!.textContent = String(guestCount); }
    });

    nextBtn.addEventListener('click', () => {
        const dateEl = document.getElementById('res-date') as HTMLInputElement;
        pendingBooking.date = dateEl.value;
        pendingBooking.time = selectedTime;
        pendingBooking.guests = guestCount;
        step = 2;
        renderStep();
    });
}

function wireStep2(): void {
    document.getElementById('res-back-2')?.addEventListener('click', () => { step = 1; renderStep(); });
    document.getElementById('res-confirm')?.addEventListener('click', () => {
        const name = (document.getElementById('res-name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('res-email') as HTMLInputElement).value.trim();
        const errEl = document.getElementById('res-step2-error')!;

        if (!name || !email) {
            errEl.textContent = 'Please fill in your name and email.';
            errEl.hidden = false;
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errEl.textContent = 'Please enter a valid email address.';
            errEl.hidden = false;
            return;
        }

        errEl.hidden = true;
        pendingBooking.name = name;
        pendingBooking.email = email;
        pendingBooking.restaurantName = currentRestaurantName;
        pendingBooking.confirmationCode = randomCode();
        pendingBooking.id = Date.now().toString();

        saveBooking(pendingBooking as Booking);
        showToast({ message: `📧 Confirmation sent to ${email}`, type: 'success', duration: 5000 });
        step = 3;
        renderStep();
    });
}

// ─── Open / Close ─────────────────────────────────────────────────────────────

export function openReservation(restaurantId: number, restaurantName: string): void {
    currentRestaurantId = restaurantId;
    currentRestaurantName = restaurantName;
    step = 1;
    pendingBooking = {};

    if (!document.getElementById('res-modal-overlay')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML());
    } else {
        // Reset stale overlay
        document.getElementById('res-modal-overlay')!.remove();
        document.body.insertAdjacentHTML('beforeend', modalHTML());
    }

    const overlay = document.getElementById('res-modal-overlay')!;
    renderStep();

    document.getElementById('res-close')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e: MouseEvent) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', escHandler);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('open'));
}

function escHandler(e: KeyboardEvent): void {
    if (e.key === 'Escape') closeModal();
}

function closeModal(): void {
    const overlay = document.getElementById('res-modal-overlay');
    if (overlay) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 300);
    }
    document.removeEventListener('keydown', escHandler);
}

// ─── Wire Reserve buttons on the grid ────────────────────────────────────────

export function initReservationButtons(): void {
    document.addEventListener('click', (e: MouseEvent) => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.reserve-btn[data-id]');
        if (!btn) return;
        const id = Number(btn.dataset['id']);
        const name = btn.dataset['name'] ?? 'this restaurant';
        openReservation(id, name);
    });
}

initReservationButtons();
