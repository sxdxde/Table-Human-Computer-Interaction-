# HCI Design System Blueprint
> Extracted from: IIITDM CS5015 HCI Course — Lectures 01–08  
> Covers: Shneiderman's 8 Golden Rules, Nielsen's 10 Heuristics, Norman's Principles, Fitts' Law, Hick's Law, Miller's Law, Pareto/Zipf, Raskin's Laws, Jakob's Law, Tesler's Law, Mental Models, Usability Factors, Case Studies

---

## Table of Contents

1. [Foundations](#1-foundations)
2. [Feedback & System Status](#2-feedback--system-status)
3. [Affordance & Visibility](#3-affordance--visibility)
4. [Consistency & Standards](#4-consistency--standards)
5. [Error Prevention & Handling](#5-error-prevention--handling)
6. [Shortcuts & Accelerators (Flexibility)](#6-shortcuts--accelerators-flexibility)
7. [Cognitive Load & Memory (Miller's Law)](#7-cognitive-load--memory-millers-law)
8. [Navigation Systems](#8-navigation-systems)
9. [Forms & Input Patterns](#9-forms--input-patterns)
10. [Visual Hierarchy & Layout](#10-visual-hierarchy--layout)
11. [Fitts' Law — Targets & Buttons](#11-fitts-law--targets--buttons)
12. [Hick's Law — Decision Complexity](#12-hicks-law--decision-complexity)
13. [Mental Models & Skeuomorphism](#13-mental-models--skeuomorphism)
14. [Undo / Reversal / Cancel Patterns](#14-undo--reversal--cancel-patterns)
15. [Progressive Disclosure](#15-progressive-disclosure)
16. [Primacy & Recency — List Ordering](#16-primacy--recency--list-ordering)
17. [Sorting & Information Architecture](#17-sorting--information-architecture)
18. [Scrolling & Fold Behavior](#18-scrolling--fold-behavior)
19. [Typography & Headlines](#19-typography--headlines)
20. [Raskin's Laws — Data Integrity & Automation](#20-raskins-laws--data-integrity--automation)
21. [Jakob's Law — Convention Adherence](#21-jakobs-law--convention-adherence)
22. [Tesler's Law — Complexity Management](#22-teslers-law--complexity-management)
23. [Pareto (80/20) in Feature Design](#23-pareto-8020-in-feature-design)
24. [Usability Dimensions (5 E's)](#24-usability-dimensions-5-es)
25. [Microinteractions & Animation](#25-microinteractions--animation)
26. [Accessibility Guidelines](#26-accessibility-guidelines)
27. [State Management Patterns](#27-state-management-patterns)
28. [Implementation Checklist](#28-implementation-checklist)

---

## 1. Foundations

### 1.1 What is HCI?

| Field | Definition |
|---|---|
| **Category** | Core Concept |
| **Definition** | Human–Computer Interaction: study of how people interact with computers and how systems can be designed for successful human use. |
| **Key Triangle** | USER ↔ INTERFACE ↔ COMPUTER |
| **Goal** | Produce usable, safe, and functional systems. "Put people first." |

**The 3 Pillars:**
- **Functionality** — what the system can do
- **Usability** — how easily it can be done
- **Effectiveness** — the balance of both

**Design Mandate (Don Norman):**  
> *"It is the duty of machines and those who design them to understand people."*

**Technical Implementation Strategy:**
```html
<!-- Every page must communicate purpose within 3 seconds -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">...</nav>
</header>
<main role="main" aria-label="Primary content">...</main>
<footer role="contentinfo">...</footer>
```

---

## 2. Feedback & System Status

### 2.1 Informative Feedback

| Field | Value |
|---|---|
| **Category** | Interaction Pattern |
| **Source** | Shneiderman's Golden Rule #3; Nielsen's Heuristic #1; Norman's Principle |
| **Definition** | Every user action must produce timely, appropriate, and proportional feedback. |
| **Purpose** | Eliminate user uncertainty — "What is happening?" |
| **Design Rationale** | Users hate uncertainty. Lack of feedback triggers anxiety and forces guessing, often leading to repeated actions. |

**When to Use:** Always — no action should go silently unacknowledged.

**When NOT to Use:** Never suppress feedback. Even "no change" must be confirmed.

**Common Mistakes:**
- Silent form submissions with no loader or confirmation
- Spinner with no text ("Loading..." is better than a bare spinner)
- Error messages that are vague ("Something went wrong")
- Success messages that disappear before user reads them

**Best Practices:**
- Use inline feedback (near the action, not top of page)
- Provide feedback within 100ms for instant feel; show loader after 1s delay
- Distinguish success / warning / error visually (color + icon + text)

**Technical Implementation:**
```html
<!-- Toast notification system -->
<div id="toast-container" role="status" aria-live="polite" aria-atomic="true">
  <div class="toast toast--success" role="alert">
    <span class="toast__icon">✓</span>
    <span class="toast__message">Profile saved successfully!</span>
  </div>
</div>
```
```css
.toast { display:flex; align-items:center; gap:8px; padding:12px 16px;
  border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,.15);
  animation: slideIn .25s ease; }
.toast--success { background:#1a9e5c; color:#fff; }
.toast--error   { background:#d93025; color:#fff; }
.toast--warning { background:#f4a400; color:#111; }
@keyframes slideIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
```
```js
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span class="toast__message">${message}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
```

**Accessibility:** Use `aria-live="polite"` for non-urgent updates; `aria-live="assertive"` for errors.

---

## 3. Affordance & Visibility

### 3.1 Affordance

| Field | Value |
|---|---|
| **Category** | Usability Principle |
| **Source** | Norman (Design of Everyday Things); Lecture 01 |
| **Definition** | The perceived properties of an object that suggest how it should be used. |
| **Purpose** | Make interactive elements self-evident — users should not need instructions. |
| **Design Rationale** | Bad affordance = user blames themselves. Good affordance = door that "begs to be pushed." |

**When to Use:** Every interactive UI element (buttons, links, inputs, toggles).

**Common Mistakes:**
- Rectangular boxes of text that look like buttons but aren't clickable
- Blue underlined text that isn't a link (breaks mental model)
- Flat design removing all affordance cues (shadows, borders, color contrast)

**Best Practices:**
- Buttons must look pressable: slight elevation, border, or color contrast
- Links must be distinguishable: color + underline (not color alone)
- Input fields must look fillable: visible border + placeholder text

**Technical Implementation:**
```css
/* Strong button affordance */
.btn-primary {
  background: #2563eb; color: #fff;
  padding: 10px 20px; border-radius: 6px;
  border: none; cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,.2);
  transition: transform .1s, box-shadow .1s;
}
.btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,.25); }
.btn-primary:active { transform: translateY(0);    box-shadow: 0 1px 2px rgba(0,0,0,.2); }

/* Clear link affordance */
a { color: #2563eb; text-decoration: underline; }
a:visited { color: #7c3aed; } /* Purple = visited — mental model convention */
```

### 3.2 Visibility of System Status

| Field | Value |
|---|---|
| **Category** | Interaction + Feedback |
| **Source** | Nielsen's Heuristic #1 |
| **Definition** | Users must always know where they are and what is happening. |

**Technical Implementation:**
```html
<!-- Breadcrumb for location visibility -->
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Laptop Pro X</li>
  </ol>
</nav>

<!-- Progress indicator for multi-step flows -->
<div class="progress-steps" role="progressbar" aria-valuenow="2" aria-valuemin="1" aria-valuemax="4">
  <div class="step completed">1. Cart</div>
  <div class="step active">2. Shipping</div>
  <div class="step">3. Payment</div>
  <div class="step">4. Confirm</div>
</div>
```

---

## 4. Consistency & Standards

### 4.1 Consistency

| Field | Value |
|---|---|
| **Category** | Design Principle |
| **Source** | Shneiderman Rule #1; Nielsen Heuristic #4; Norman Principle |
| **Definition** | Same operations, same labels, same visual language throughout the product. |
| **Purpose** | Reduces learning curve — once learned, applies everywhere. |
| **Design Rationale** | Inconsistency forces users to rebuild mental models on every screen. |

**When to Use:** Globally across all UI elements — typography, spacing, color, interaction verbs.

**Common Mistakes:**
- Using "Delete", "Remove", and "Clear" to mean the same thing
- Different padding on similar cards across pages
- Primary CTA button changes color across screens

**Best Practices:**
- Establish and enforce a design token system
- Use component-driven design (one Button component, not ad-hoc styling)

**Technical Implementation — Design Tokens:**
```css
:root {
  /* Color tokens */
  --color-primary:       #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-danger:        #dc2626;
  --color-success:       #16a34a;
  --color-warning:       #d97706;
  --color-surface:       #ffffff;
  --color-bg:            #f8fafc;
  --color-text:          #0f172a;
  --color-text-muted:    #64748b;
  --color-border:        #e2e8f0;

  /* Spacing scale (4px base) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --space-12: 48px; --space-16: 64px;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-xs: .75rem;  --text-sm: .875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.25rem; --text-2xl: 1.5rem;
  --text-3xl: 1.875rem; --text-4xl: 2.25rem;

  /* Radius */
  --radius-sm: 4px; --radius-md: 8px;
  --radius-lg: 12px; --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,.1);
}
```

---

## 5. Error Prevention & Handling

### 5.1 Error Prevention

| Field | Value |
|---|---|
| **Category** | Interaction Pattern |
| **Source** | Shneiderman Rule #5 (prevent errors); Nielsen Heuristic #5 |
| **Definition** | Design the system to make errors impossible or highly unlikely before they occur. |
| **Purpose** | Prevention > recovery. Eliminate error-prone conditions. |

**When to Use:** All destructive actions, form submissions, irreversible operations.

**Best Practices:**
- Confirm dialogs for destructive actions (GitHub-style: type name to delete)
- Disable submit button until required fields are valid
- Inline validation before form submission
- Grey out unavailable options rather than hiding them

### 5.2 Error Recovery (Handling)

| Field | Value |
|---|---|
| **Source** | Nielsen Heuristic #9 |
| **Definition** | When errors occur, express them in plain language, indicate the problem precisely, and suggest a solution. |

**Technical Implementation:**
```html
<!-- Inline form validation -->
<div class="form-field" id="email-field">
  <label for="email" class="form-label">Email Address <span aria-hidden="true">*</span></label>
  <input type="email" id="email" name="email"
         aria-required="true"
         aria-describedby="email-error"
         class="form-input"
         autocomplete="email" />
  <span id="email-error" class="form-error" role="alert" hidden>
    Please enter a valid email address (e.g. name@domain.com)
  </span>
</div>

<!-- Destructive action confirmation dialog -->
<dialog id="delete-dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Delete Repository</h2>
  <p>This action <strong>cannot be undone</strong>. Type <code>my-repo-name</code> to confirm.</p>
  <input type="text" id="confirm-name" aria-label="Repository name confirmation" />
  <div class="dialog-actions">
    <button id="confirm-delete" disabled class="btn btn--danger">Delete</button>
    <button onclick="document.getElementById('delete-dialog').close()" class="btn">Cancel</button>
  </div>
</dialog>
```
```css
.form-input { width:100%; padding:10px 12px; border:1.5px solid var(--color-border);
  border-radius:var(--radius-md); font-size:var(--text-base); transition:border-color .15s; }
.form-input:focus { outline:none; border-color:var(--color-primary);
  box-shadow:0 0 0 3px rgba(37,99,235,.15); }
.form-input[aria-invalid="true"] { border-color:var(--color-danger); }
.form-error { color:var(--color-danger); font-size:var(--text-sm); margin-top:4px; display:flex; gap:4px; }
```
```js
// Real-time validation
document.getElementById('email').addEventListener('blur', function() {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
  const errEl = document.getElementById('email-error');
  this.setAttribute('aria-invalid', !isValid);
  errEl.hidden = isValid;
});

// GitHub-style confirm delete
document.getElementById('confirm-name').addEventListener('input', function() {
  document.getElementById('confirm-delete').disabled = this.value !== 'my-repo-name';
});
```

**Accessibility:** Errors must use `role="alert"` or `aria-live="assertive"`. Do NOT rely on color alone.

---

## 6. Shortcuts & Accelerators (Flexibility)

### 6.1 Accelerators for Expert Users

| Field | Value |
|---|---|
| **Category** | Interaction Pattern |
| **Source** | Shneiderman Rule #2 (shortcuts); Nielsen Heuristic #7 (efficiency) |
| **Definition** | Hidden or advanced shortcuts for expert users that don't clutter the interface for novices. |
| **Purpose** | Cater to both novice and expert without compromise. |
| **Design Rationale** | Power law of practice — repeated actions speed up. Experts saturate learning; shortcuts extend their ceiling. |

**When to Use:** Any frequently repeated action with > 5 steps.

**Technical Implementation:**
```js
// Keyboard shortcut registry
const shortcuts = {
  'ctrl+s': () => saveDocument(),
  'ctrl+z': () => undoAction(),
  'ctrl+shift+z': () => redoAction(),
  'ctrl+k': () => openCommandPalette(),
  '/': () => focusSearch(),
};
document.addEventListener('keydown', (e) => {
  const key = [e.ctrlKey && 'ctrl', e.shiftKey && 'shift', e.key.toLowerCase()]
    .filter(Boolean).join('+');
  if (shortcuts[key]) { e.preventDefault(); shortcuts[key](); }
});
```
```html
<!-- Keyboard shortcut hint in tooltip -->
<button class="btn" aria-label="Save (Ctrl+S)" data-tooltip="Save Ctrl+S">Save</button>
```

---

## 7. Cognitive Load & Memory (Miller's Law)

### 7.1 Miller's 7±2 Rule

| Field | Value |
|---|---|
| **Category** | Cognitive Principle |
| **Source** | Miller (1956); Lecture 07 |
| **Definition** | Short-term memory holds 7 (±2) chunks of information at once. |
| **Purpose** | Limit the number of options/items shown simultaneously to prevent cognitive overload. |
| **Design Rationale** | Working memory is finite. Chunking reduces load. Menu lengths, form steps, nav items — all follow this rule. |

**When to Use:** Navigation items, dropdown options, form fields per page, wizard steps, card counts.

**Best Practices:**
- Max 7 (ideally 5–7) primary navigation items
- Group related items into chunks (e.g., phone number: 94452-14567)
- Use progressive disclosure rather than showing everything at once
- Prefer recognition over recall — show options, don't make users remember

**Technical Implementation:**
```html
<!-- Chunked phone number input (reduces memory load) -->
<fieldset>
  <legend>Phone Number</legend>
  <input type="text" maxlength="3" placeholder="Country" aria-label="Country code" />
  <span aria-hidden="true">–</span>
  <input type="text" maxlength="5" placeholder="Area"    aria-label="Area code" />
  <span aria-hidden="true">–</span>
  <input type="text" maxlength="5" placeholder="Number"  aria-label="Local number" />
</fieldset>
```
```css
/* Chunking visual groups with spacing */
.nav-primary { display:flex; gap:var(--space-4); }
.nav-group   { display:flex; gap:var(--space-2); padding:0 var(--space-4);
  border-right:1px solid var(--color-border); }
```

### 7.2 Recognition Over Recall

| Field | Value |
|---|---|
| **Source** | Nielsen Heuristic #6; Shneiderman Rule #8 |
| **Definition** | Make actions, objects, and options visible. Users should recognize, not memorize. |

**Technical Implementation:**
```html
<!-- Command palette for recognition, not recall -->
<div id="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
  <input type="search" placeholder="Type a command or search…" aria-label="Search commands" />
  <ul role="listbox" id="command-list">
    <li role="option">📄 New Document</li>
    <li role="option">💾 Save (Ctrl+S)</li>
    <li role="option">🔍 Find & Replace (Ctrl+H)</li>
  </ul>
</div>
```

---

## 8. Navigation Systems

### 8.1 Primary Navigation

| Field | Value |
|---|---|
| **Category** | Navigation / Layout |
| **Source** | Jakob's Law; Lecture 05 (left-attention bias); Miller's Law |
| **Definition** | Top-level navigation that persists across the site. |
| **Design Rationale** | 69% of viewing time is on the left half of the page. Users expect navigation top-left. Jakob's Law: users come from other sites with established nav conventions. |

**Best Practices:**
- Max 5–7 top-level items (Miller's Law)
- Keep navigation on the far left or top
- Highlight active state clearly
- Never hide primary navigation behind a hamburger on desktop

**Technical Implementation:**
```html
<nav class="navbar" role="navigation" aria-label="Main">
  <a href="/" class="navbar__brand" aria-label="Home">
    <img src="/logo.svg" alt="Brand Name" width="120" height="40" />
  </a>
  <ul class="navbar__links" role="list">
    <li><a href="/products" class="navbar__link" aria-current="page">Products</a></li>
    <li><a href="/pricing"  class="navbar__link">Pricing</a></li>
    <li><a href="/docs"     class="navbar__link">Docs</a></li>
    <li><a href="/about"    class="navbar__link">About</a></li>
  </ul>
  <div class="navbar__actions">
    <a href="/login"  class="btn btn--ghost">Log In</a>
    <a href="/signup" class="btn btn--primary">Get Started</a>
  </div>
</nav>
```
```css
.navbar { display:flex; align-items:center; gap:var(--space-8);
  padding:0 var(--space-8); height:64px; background:var(--color-surface);
  border-bottom:1px solid var(--color-border); position:sticky; top:0; z-index:100; }
.navbar__links { display:flex; gap:var(--space-2); list-style:none; margin:0; padding:0; }
.navbar__link { padding:6px 12px; border-radius:var(--radius-sm);
  color:var(--color-text); text-decoration:none; font-size:var(--text-sm);
  font-weight:500; transition:background .15s; }
.navbar__link:hover { background:var(--color-bg); }
.navbar__link[aria-current="page"] { color:var(--color-primary); background:rgba(37,99,235,.08); }
```

### 8.2 Breadcrumbs

| Field | Value |
|---|---|
| **Category** | Navigation |
| **Source** | Visibility of System Status; Locus of Control |
| **Definition** | Trail showing user's current location within the hierarchy. |
| **When to Use** | Sites with > 2 levels of hierarchy. |

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb__item"><a href="/">Home</a></li>
    <li class="breadcrumb__item breadcrumb__separator" aria-hidden="true">/</li>
    <li class="breadcrumb__item"><a href="/shop">Shop</a></li>
    <li class="breadcrumb__item breadcrumb__separator" aria-hidden="true">/</li>
    <li class="breadcrumb__item" aria-current="page">Laptops</li>
  </ol>
</nav>
```

### 8.3 Tabs

```html
<div class="tabs" role="tablist" aria-label="Product information">
  <button class="tab" role="tab" aria-selected="true"  aria-controls="panel-overview" id="tab-overview">Overview</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-specs"    id="tab-specs">Specs</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-reviews"  id="tab-reviews">Reviews</button>
</div>
<div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">...</div>
<div id="panel-specs"    role="tabpanel" aria-labelledby="tab-specs" hidden>...</div>
<div id="panel-reviews"  role="tabpanel" aria-labelledby="tab-reviews" hidden>...</div>
```

---

## 9. Forms & Input Patterns

### 9.1 Form Design Principles

| Field | Value |
|---|---|
| **Category** | Forms / Input |
| **Source** | Shneiderman Rule #5/8; Nielsen; Lecture 06 (Reset/Cancel) |
| **Definition** | Forms that minimize friction, maximize clarity, and provide excellent feedback. |

**Best Practices:**
- One column layout (linear reading, less cognitive load)
- Label above field (not placeholder-only — placeholder disappears on input)
- Clear required field indication (`*` with legend explaining it)
- Inline validation on blur (not on every keystroke)
- Never use a Reset button on web forms (Lecture 06 — causes data loss by accident)
- Always include a default radio button selection
- Infer what you can (e.g., detect card type from card number)
- Show password toggle instead of masking (Lecture 05 — improves usability without security loss)

**Technical Implementation:**
```html
<form class="form" novalidate id="signup-form">
  <p class="form__note"><span aria-hidden="true">*</span> Required field</p>

  <div class="form-field">
    <label for="fullname" class="form-label">Full Name <span aria-hidden="true">*</span></label>
    <input type="text" id="fullname" name="fullname" class="form-input"
           aria-required="true" autocomplete="name" />
  </div>

  <div class="form-field">
    <label for="password" class="form-label">Password <span aria-hidden="true">*</span></label>
    <div class="input-group">
      <input type="password" id="password" name="password" class="form-input"
             aria-required="true" aria-describedby="pw-strength" />
      <button type="button" class="input-addon" id="toggle-pw" aria-label="Show password"
              aria-pressed="false">👁</button>
    </div>
    <!-- Password strength indicator -->
    <div id="pw-strength" class="strength-meter" role="status" aria-live="polite">
      <div class="strength-bar" data-strength="0"></div>
      <span class="strength-label">Enter a password</span>
    </div>
  </div>

  <button type="submit" class="btn btn--primary btn--full">Create Account</button>
</form>
```
```js
// Password toggle (Lecture 05 — Stop Password Masking anti-pattern)
document.getElementById('toggle-pw').addEventListener('click', function() {
  const pw = document.getElementById('password');
  const isShown = pw.type === 'text';
  pw.type = isShown ? 'password' : 'text';
  this.setAttribute('aria-pressed', !isShown);
  this.setAttribute('aria-label', isShown ? 'Show password' : 'Hide password');
});
```

---

## 10. Visual Hierarchy & Layout

### 10.1 F-Pattern & Left-Attention Bias

| Field | Value |
|---|---|
| **Category** | Layout |
| **Source** | Lecture 05 & 06 (NNG eye-tracking data) |
| **Definition** | Users scan pages in an F-shaped pattern, focusing heavily on the left and top. |

**Key Stats from PDFs:**
- 69% of viewing time on the left half of the page
- 80% of viewing time above the fold
- 57% viewing time above fold (modern sites); 74% on first two screenfuls

**Best Practices:**
- Navigation: always far left or top-left
- Most important content: top-center or 1/3 from left
- Secondary content: right side
- Priority CTAs: above the fold
- Use headers, bold text, and visual anchors at the start of scan lines

**Technical Implementation:**
```css
/* Grid system respecting F-pattern */
.page-layout {
  display: grid;
  grid-template-columns: 240px 1fr 280px; /* nav | main | sidebar */
  grid-template-areas: "sidebar main aside";
  gap: var(--space-8);
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-8);
}

/* Responsive: mobile-first collapses to single column */
@media (max-width: 768px) {
  .page-layout {
    grid-template-columns: 1fr;
    grid-template-areas: "main" "aside" "sidebar";
  }
}
```

### 10.2 Visual Hierarchy Rules

| Priority | Element | Treatment |
|---|---|---|
| 1st | Page title / H1 | Largest, heaviest weight, highest contrast |
| 2nd | Section headings | Medium size, semi-bold |
| 3rd | Body text | Regular weight, comfortable line-height (1.6) |
| 4th | Supporting / metadata | Smaller, muted color |
| Action | Primary CTA | Full-color, prominent button |
| Action | Secondary CTA | Ghost/outline button |

```css
h1 { font-size:var(--text-4xl); font-weight:800; line-height:1.15; letter-spacing:-.02em; }
h2 { font-size:var(--text-3xl); font-weight:700; line-height:1.2; }
h3 { font-size:var(--text-xl);  font-weight:600; line-height:1.3; }
p  { font-size:var(--text-base); line-height:1.6; color:var(--color-text); }
.text-muted { color:var(--color-text-muted); font-size:var(--text-sm); }
```

---

## 11. Fitts' Law — Targets & Buttons

| Field | Value |
|---|---|
| **Category** | Interaction Design |
| **Source** | Lecture 07 — Fitts' Law |
| **Definition** | Time to acquire a target = f(distance / size). Bigger and closer = faster and easier. |
| **Purpose** | Optimize button and link size/placement to reduce interaction time and errors. |

**Design Rationale:** Linear increase in choices → logarithmic increase in decision time (binary elimination strategy).

**Applications:**
- Large touch targets on mobile (min 44×44px per Apple HIG)
- Primary CTA: largest button on page
- Destructive buttons (delete): smaller and farther away
- Hover-expand menus (like macOS menu bar) — increase effective target size
- Corner/edge screen positions are "infinite" in one direction — use for toolbars

**Best Practices:**
- Mobile: minimum 44×44px tap target
- Desktop: minimum 32px click target
- Keep distance from user attention area to task button short
- Make dangerous buttons (delete, clear) smaller and visually de-emphasized

```css
/* Fitts' Law compliant button sizing */
.btn {
  min-height: 44px;        /* Mobile touch minimum */
  min-width: 88px;
  padding: 10px 20px;
  font-size: var(--text-base);
  cursor: pointer;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: 600;
  transition: all .15s ease;
}
.btn--primary { background:var(--color-primary); color:#fff; border:none; }
.btn--danger  { background:var(--color-danger);  color:#fff; border:none; font-size:var(--text-sm); min-height:36px; }
.btn--ghost   { background:transparent; border:1.5px solid var(--color-border); color:var(--color-text); }

/* Hover expansion (Fitts' target growth) */
.btn:hover { transform: scale(1.03); }
```

---

## 12. Hick's Law — Decision Complexity

| Field | Value |
|---|---|
| **Category** | Interaction / Navigation |
| **Source** | Hick & Hyman Law — Lecture 07 |
| **Definition** | Decision time increases logarithmically with the number of choices. |
| **Purpose** | Reduce choices at each step to minimize decision time. |
| **Design Rationale** | Users eliminate ~half the options at each step (binary tree). Don't present all 50 options at once. |

**Applications:**
- Progressive navigation: broad categories → subcategories (not flat mega-list)
- Onboarding: show 3–4 core paths, not all features
- Search suggestion: show 5–7 results, not 50
- Feature discoverability: expose 20% of features (the vital few — Pareto)

**Technical Implementation:**
```html
<!-- Tiered category navigation (Hick's Law: broad → narrow) -->
<nav class="category-nav">
  <ul class="cat-level-1">
    <li class="cat-item">
      <button class="cat-btn">Electronics ▾</button>
      <ul class="cat-level-2">
        <li><a href="/laptops">Laptops</a></li>
        <li><a href="/phones">Phones</a></li>
        <li><a href="/tablets">Tablets</a></li>
      </ul>
    </li>
    <li class="cat-item">
      <button class="cat-btn">Clothing ▾</button>
      <ul class="cat-level-2">
        <li><a href="/men">Men</a></li>
        <li><a href="/women">Women</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

---

## 13. Mental Models & Skeuomorphism

| Field | Value |
|---|---|
| **Category** | Cognitive / UX |
| **Source** | Lecture 02 |
| **Definition** | Users apply beliefs and expectations built from prior experiences to new interfaces. |
| **Purpose** | Align design with user expectations to eliminate learning friction. |

**Key Mental Model Conventions (never break without good reason):**
- Blue underlined text = hyperlink
- Purple text = visited link
- Rectangle/bordered box = button (clickable)
- Top-left logo = home link
- Magnifying glass = search
- Hamburger (☰) = mobile menu
- Shopping cart = e-commerce purchase
- Back button = previous page

**Skeuomorphism:** Design objects that mirror real-world counterparts to leverage existing knowledge (e.g., folder icon = file storage, trash can = delete).

**Violations to Avoid (Mental Model Inertia):**
- Windows 8 failure: removed Start button → users couldn't find settings/shutdown
- Non-blue links → users miss them
- Flat buttons with no affordance → users tap text instead

**Technical Implementation (respecting conventions):**
```css
/* Respect the mental model: links look like links */
a:not(.btn) { color: #2563eb; text-decoration: underline; }
a:not(.btn):visited { color: #7c3aed; }

/* Placeholder color must be lighter than text (input field convention) */
::placeholder { color: var(--color-text-muted); opacity: 1; }
```

---

## 14. Undo / Reversal / Cancel Patterns

| Field | Value |
|---|---|
| **Category** | Interaction Pattern |
| **Source** | Shneiderman Rule #4; Nielsen Heuristic #3; Lecture 06 |
| **Definition** | Allow users to reverse actions easily, promoting exploration without fear. |
| **Purpose** | Reduces anxiety. Encourages exploratory behavior. |

**Key Rules from Lectures:**
- **UNDO** > Reset/Clear: Undo is the greatest usability advance
- **Reset button on web forms = DON'T use** (causes accidental data loss)
- Reset only valid for: frequently re-filled forms where old data differs significantly
- **Cancel button on web**: use sparingly. Back button handles most cases
- Cancel required for: multi-step flows with committed actions, downloads
- Always provide undo for destructive operations
- Preserve customization across sessions (Raskin's Law #1)

**Technical Implementation:**

```js
// Command pattern for undo/redo
class ActionHistory {
  constructor() { this.history = []; this.index = -1; }
  execute(action) {
    this.history.splice(this.index + 1);
    this.history.push(action);
    this.index++;
    action.do();
  }
  undo() { if (this.index >= 0) { this.history[this.index--].undo(); } }
  redo() { if (this.index < this.history.length-1) { this.history[++this.index].do(); } }
}

// Snackbar with undo action
function deleteItemWithUndo(item) {
  const deleted = removeItem(item);
  showToastWithAction(`"${item.name}" deleted`, 'Undo', () => restoreItem(deleted));
}
```
```html
<!-- Toast with undo action -->
<div class="toast toast--action" role="alert">
  <span>"profile-photo.jpg" deleted</span>
  <button class="toast__action" onclick="undoDelete()">Undo</button>
</div>
```

---

## 15. Progressive Disclosure

| Field | Value |
|---|---|
| **Category** | Interaction / Cognitive |
| **Source** | Shneiderman Rule #8; Hick's Law; Nielsen; Lecture 03 |
| **Definition** | Show only the most essential information first; reveal advanced options on demand. |
| **Purpose** | Reduce cognitive overload for novice users while maintaining power for experts. |

**Technical Implementation:**
```html
<!-- Accordion (progressive disclosure) -->
<div class="accordion">
  <div class="accordion__item">
    <button class="accordion__trigger" aria-expanded="false" aria-controls="adv-options">
      Advanced Options
      <svg class="accordion__icon" aria-hidden="true">...</svg>
    </button>
    <div id="adv-options" class="accordion__content" hidden>
      <div class="form-field">...</div>
    </div>
  </div>
</div>
```
```js
document.querySelectorAll('.accordion__trigger').forEach(button => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !expanded);
    document.getElementById(button.getAttribute('aria-controls')).hidden = expanded;
  });
});
```

---

## 16. Primacy & Recency — List Ordering

| Field | Value |
|---|---|
| **Category** | Information Architecture |
| **Source** | Lecture 07 — Serial Position Effect |
| **Definition** | Users remember items at the beginning (primacy) and end (recency) of lists best. Middle items are most forgotten. |
| **Purpose** | Place important items first or last, never in the exact middle. |

**Applications:**
- Navigation: most important items first and last (not buried in middle)
- Menu options: critical actions at top or bottom of dropdown
- Onboarding steps: nail the first and last impression
- Form field order: most important fields first

**Implementation note:** MS Word example — users recall File/Print/Save (primacy) and Exit/Quit (recency) but not middle toolbar items.

```html
<!-- Navigation respecting primacy/recency -->
<nav>
  <ul>
    <li><a href="/">Home</a></li>           <!-- Primacy: first -->
    <li><a href="/products">Products</a></li>
    <li><a href="/pricing">Pricing</a></li>
    <li><a href="/docs">Docs</a></li>
    <li><a href="/contact">Contact</a></li>  <!-- Recency: last -->
  </ul>
</nav>
```

---

## 17. Sorting & Information Architecture

| Field | Value |
|---|---|
| **Category** | Information Architecture |
| **Source** | Lecture 06 — "Alphabetical Sorting Must Die" |
| **Definition** | Content ordering strategy based on user mental models and task context. |

**Sorting Hierarchy (best to worst for UX):**
1. **Frequency of use** — most used first
2. **Importance / priority** — critical actions first
3. **Chronological / timeline** — events, logs
4. **Ordinal / sequential** — sizes, levels, steps
5. **Geographic** — location-based content
6. **Alphabetical** — only for known-item lookup (where user knows the exact name)

**When NOT to use alphabetical:** When users don't know the item name; when items have inherent ordering (e.g., t-shirt sizes: XS, S, M, L, XL — not A–Z).

```js
// Sort by frequency of use (most visited pages first)
const navItems = [
  { label: 'Dashboard',  visits: 240 },
  { label: 'Reports',    visits: 80  },
  { label: 'Settings',   visits: 15  },
  { label: 'Users',      visits: 120 },
].sort((a, b) => b.visits - a.visits);
```

---

## 18. Scrolling & Fold Behavior

| Field | Value |
|---|---|
| **Category** | Layout / UX |
| **Source** | Lecture 06 NNG study |
| **Definition** | Content placement strategy based on how users distribute attention vertically. |

**Key Data:**
- 80% of viewing time above the fold (older data)
- 57% above fold (modern sites with taller pages)
- Top 65% of above-fold area = lion's share of attention

**Best Practices:**
- Place highest-priority content/CTAs above the fold
- Use "content signifiers" (cut-off images, partial text) to signal more content below
- Avoid "false floors" — minimalist designs that appear complete but have more content below
- Test page length with real users

```css
/* Content signifier — partially visible card signals more below */
.card-peek {
  height: 80vh;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}

/* Scroll fade-in animation */
.reveal { opacity: 0; transform: translateY(20px); transition: opacity .5s, transform .5s; }
.reveal.visible { opacity: 1; transform: translateY(0); }
```
```js
// Intersection Observer for scroll reveals
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));
```

---

## 19. Typography & Headlines

| Field | Value |
|---|---|
| **Category** | Typography / Content |
| **Source** | Lecture 06 — "Art of Writing Headlines" (NNG) |
| **Definition** | Headline and text design rules for scannability and comprehension. |

**NNG Headline Rules:**
1. Work out of context (standalone meaning)
2. Tell readers something useful
3. Avoid cute/faddish vocabulary — be direct
4. Omit nonessential words
5. Front-load with strong keywords (most important word first)
6. Short: avg 5 words / 34 characters (BBC standard)

**CSS Implementation:**
```css
/* Front-loaded scan-friendly typography */
.article-headline {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -.02em;
  /* Front-load: user sees first 40px before reading */
}

/* Bold scannable identifiers */
.highlight { font-weight: 700; } /* Draw attention to key info */

/* Readable body text */
.body-text {
  font-size: 1rem;
  line-height: 1.7;
  max-width: 65ch; /* Optimal reading width */
  color: var(--color-text);
}
```

---

## 20. Raskin's Laws — Data Integrity & Automation

| Field | Value |
|---|---|
| **Category** | Interaction Design |
| **Source** | Lecture 08 — Asimov's Laws adapted by Jef Raskin |

**Law 1 — Data Integrity:** A computer shall not harm your work.
- Auto-save, version history, undo stacks
- Confirm before any destructive action (GitHub-style: type name to delete)
- Preserve session state and user customizations

**Law 2 — Minimize Unnecessary Work:** A computer shall not waste your time.
- Auto-detect card type from number (don't ask user)
- Auto-fill where possible (autocomplete attributes)
- Smart defaults that reduce decisions

**Law 3 — Humane Interface:** Interface must be responsive to human needs.
- Single locus of attention (don't split user focus)
- Inline status feedback (Caps Lock indicator in input field, not LED)
- Respect cultural values and cognitive limits

**Technical Implementation:**
```js
// Law 1: Auto-save draft
let saveTimer;
document.querySelector('.editor').addEventListener('input', () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem('draft', document.querySelector('.editor').value);
    showToast('Draft saved automatically', 'info');
  }, 1000);
});

// Law 2: Auto-detect credit card type
function detectCardType(number) {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
  };
  return Object.entries(patterns).find(([,re]) => re.test(number))?.[0] || 'unknown';
}
document.getElementById('card-number').addEventListener('input', function() {
  document.getElementById('card-type').textContent = detectCardType(this.value.replace(/\s/g,''));
});
```

---

## 21. Jakob's Law — Convention Adherence

| Field | Value |
|---|---|
| **Category** | UX Principle |
| **Source** | Lecture 08; Lecture 02 |
| **Definition** | Users spend most time on other sites. They expect your site to work like sites they already know. |
| **Purpose** | Leverage existing mental models to reduce cognitive load. |

**Violations to Avoid:**
- Novel navigation patterns (hamburger on desktop, bottom nav on web)
- CTA buttons in unexpected places (bottom-left instead of bottom-right)
- Non-standard form fields ordering
- Logo not linking to home

**Conventions to Always Follow:**
| Element | Expected Convention |
|---|---|
| Logo | Top-left; links to homepage |
| Primary nav | Top horizontal bar |
| Search | Top-center or top-right with magnifying glass icon |
| Cart | Top-right |
| Login/Account | Top-right corner |
| Footer | Bottom: links, legal, social |
| Main CTA | Center or right of header area |

---

## 22. Tesler's Law — Complexity Management

| Field | Value |
|---|---|
| **Category** | Design Principle |
| **Source** | Lecture 08 — Larry Tesler, XEROX PARC |
| **Definition** | Every system has irreducible complexity. The question is: who deals with it — the user or the developer? |
| **Purpose** | Move complexity from users to systems/developers. "LESS IS MORE" — Nielsen. |

**Implications:**
- Hide complexity behind intelligent defaults
- Don't expose implementation details to users
- Complex logic (address parsing, card detection) belongs in code
- Interface clutter → users hunt for what they need
- Focus on the 20% of features used 80% of the time (Pareto)

---

## 23. Pareto (80/20) in Feature Design

| Field | Value |
|---|---|
| **Category** | Product Design |
| **Source** | Lecture 07 — Pareto Principle; Zipf's Law |
| **Definition** | 80% of user occasions use only 20% of features. Prioritize and surface those 20%. |

**Zipf's Principle of Least Effort:** Users want maximum outcome for minimum effort. Design for the path of least resistance.

**Applications:**
- Surface the top 5–7 features prominently (Hick's + Miller's)
- Advanced/rarely used features go in settings or collapsed sections
- Primary nav = only high-frequency destinations
- Dashboard = most used data at a glance

```css
/* Feature priority visual hierarchy */
.feature-primary   { font-size:var(--text-lg); font-weight:700; }
.feature-secondary { font-size:var(--text-base); color:var(--color-text-muted); }
.feature-advanced  { display:none; } /* revealed on "More options" click */
```

---

## 24. Usability Dimensions (5 E's)

| Dimension | Definition | Design Implication |
|---|---|---|
| **Easy to Learn** | First-time task completion rate | Clear onboarding, labeled CTAs, no jargon |
| **Easy to Remember** | Return user proficiency | Consistent UI, saved state, familiar patterns |
| **Effective** | Accuracy of task completion | Error prevention, clear feedback, confirmation |
| **Efficient** | Speed of task completion | Shortcuts, auto-fill, minimal clicks |
| **Enjoyable** | User satisfaction | Microinteractions, smooth animations, good typography |

**Additional Usability Triad:**
- **Useful** = has the features needed
- **Usable** = features are easy and pleasant to use
- **Used** = users actually adopt it (even useful + usable products can fail to be used)

---

## 25. Microinteractions & Animation

| Field | Value |
|---|---|
| **Category** | Microinteraction |
| **Source** | Usability; Feedback principles; Enjoyability |
| **Definition** | Small, contained product moments that accomplish a single task with feedback. |

**Principles:**
- Match animation speed to context: instant feedback < 100ms, transitions 200–300ms
- Never block interaction with animation
- Use motion to communicate meaning (slide in = add, slide out = remove, shake = error)
- Reduce motion for accessibility (prefers-reduced-motion)

```css
/* Global animation tokens */
:root {
  --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);
  --ease-smooth: cubic-bezier(.25, .46, .45, .94);
  --dur-fast:   150ms;
  --dur-normal: 250ms;
  --dur-slow:   400ms;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}

/* Loading skeleton (feedback while content loads) */
.skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
```

---

## 26. Accessibility Guidelines

| Field | Value |
|---|---|
| **Category** | Accessibility |
| **Source** | Universal design principles; keyboard navigation; ARIA |

**Core Requirements:**

| Standard | Requirement |
|---|---|
| Color contrast | 4.5:1 for normal text; 3:1 for large text (WCAG AA) |
| Focus indicators | Visible and at least 3px outline |
| Touch targets | Minimum 44×44px |
| Screen readers | All images have alt text; icons have aria-label |
| Keyboard navigation | All interactive elements focusable; logical Tab order |
| Form labels | Every input has an associated label |
| Error messages | Not color-only; must include text |

```css
/* Focus-visible styles */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Skip to content link (keyboard users) */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  background: var(--color-primary);
  color: #fff;
  padding: var(--space-2) var(--space-4);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  z-index: 9999;
  text-decoration: none;
  font-weight: 600;
}
.skip-link:focus { top: 0; }
```
```html
<!-- Skip to content -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<main id="main-content">...</main>
```

---

## 27. State Management Patterns

### 27.1 All Application States

| State | Definition | Design Treatment |
|---|---|---|
| **Empty State** | No data to display | Illustration + message + primary action CTA |
| **Loading State** | Data being fetched | Skeleton screens (not spinners for content) |
| **Error State** | Something went wrong | Icon + plain-language message + retry action |
| **Success State** | Action completed | Toast/banner + confirmation message |
| **Warning State** | Action risky but allowed | Yellow banner + explicit confirmation |
| **Partial State** | Some data loaded, some missing | Show what exists + placeholder for rest |

```html
<!-- Empty state component -->
<div class="empty-state" role="status">
  <img src="/icons/empty-inbox.svg" alt="" aria-hidden="true" width="96" height="96" />
  <h3 class="empty-state__title">No messages yet</h3>
  <p class="empty-state__desc">When you receive messages, they'll appear here.</p>
  <a href="/compose" class="btn btn--primary">Compose Message</a>
</div>
```
```css
.empty-state { display:flex; flex-direction:column; align-items:center; gap:var(--space-4);
  padding:var(--space-16) var(--space-8); text-align:center; }
.empty-state__title { font-size:var(--text-xl); font-weight:600; }
.empty-state__desc  { color:var(--color-text-muted); max-width:40ch; }
```

---

## 28. Implementation Checklist

Use this as a development checklist when building any frontend feature:

### Navigation & Structure
- [ ] Logo links to home (Jakob's Law)
- [ ] Max 5–7 nav items (Miller's Law)
- [ ] Active page indicated (System Status)
- [ ] Breadcrumbs on deep pages (Location Visibility)
- [ ] Skip-to-content link (Accessibility)
- [ ] Keyboard navigable (Accessibility)

### Layout & Visual Hierarchy
- [ ] High-priority content above the fold
- [ ] Primary content left-aligned or centered
- [ ] Clear H1 → H2 → H3 hierarchy
- [ ] Max line length ~65ch for body text
- [ ] F-pattern respected for key content placement

### Buttons & Interactions
- [ ] Primary CTA is largest, most prominent button
- [ ] Min 44×44px touch target (Fitts' Law)
- [ ] Dangerous actions are smaller and separated (Fitts' Law)
- [ ] Hover/focus/active states on all interactive elements
- [ ] Affordance: buttons look clickable, links look like links

### Forms
- [ ] Labels above all inputs
- [ ] Inline validation on blur (not on keystroke)
- [ ] No Reset button on standard forms (Lecture 06)
- [ ] Password show/hide toggle (Lecture 05)
- [ ] Auto-complete attributes on all relevant fields
- [ ] Default selection for all radio button groups
- [ ] Required fields marked with asterisk + legend

### Feedback & States
- [ ] Loading state for all async operations
- [ ] Success confirmation for all submissions
- [ ] Error messages: plain language, specific, with solution
- [ ] Empty states with CTA
- [ ] Undo available for destructive actions (toast + undo)

### Cognitive Load
- [ ] Max 5–7 options per menu/list section (Miller)
- [ ] Progressive disclosure for advanced options
- [ ] Options sorted by frequency/importance (not alphabetically)
- [ ] Important items at beginning or end of lists (Primacy/Recency)

### Accessibility
- [ ] Color contrast ≥ 4.5:1
- [ ] No information conveyed by color alone
- [ ] All images have alt text
- [ ] ARIA roles/labels on interactive elements
- [ ] Logical Tab order
- [ ] `prefers-reduced-motion` respected

### Convention Adherence (Jakob's Law)
- [ ] Conventional placement of logo, nav, search, cart, account
- [ ] Blue underlined text = links only
- [ ] Back button works as expected
- [ ] Page title reflects current location

---

*Document generated from CS5015 HCI Lectures 01–08 · IIITDM · By AI Design System Extractor*
