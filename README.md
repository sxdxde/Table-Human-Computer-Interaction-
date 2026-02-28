# Tabla — Restaurant Discovery Website


# PLEASE VISIT THE DEMO VIDEO https://drive.google.com/file/d/1yoggJVuMjo1Ss-kz8HULmWFRshEcZrpc/view?usp=sharing


Tabla is a modern, responsive, full-stack, single-page restaurant discovery application targeting urban food enthusiasts. The application features a cinematic scroll-driven introduction, an advanced filtering and search mechanism, and a fully functional MVP reservation system. It is designed following rigorous Human-Computer Interaction (HCI) methodologies.

## Features

- **Cinematic Introduction**: A frame-by-frame scroll-driven onboarding experience using an HTML5 Canvas renderer. Provides immediate engagement and serves as an interactive hero component.
- **Smart Restaurant Grid**: A responsive grid layout featuring real-time search, multi-dimensional filters (quick filters, dietary, ambiance, and price), and lazy-loaded high-quality imagery.
- **Dynamic SPA Routing**: Zero-dependency frontend routing powering six distinct views:
  - **Explore**: The default discovery landing page with full grid and search.
  - **Near Me**: Geo-location based sorting and discovery via `navigator.geolocation`.
  - **Cuisines**: Categorized restaurant browsing by cuisine types.
  - **Saved**: Persistent localized storage of user's favorited spots.
  - **Deals**: Time-sensitive discount cards with live countdown timers.
  - **Sign In**: Mock authentication portal demonstrating user state capabilities.
- **Reservation System**: A comprehensive 3-step modal booking flow (Date/Time Slot Selection -> Contact Details -> Confirmation with Booking Code).
- **HCI Compliant**: Built strictly adhering to core interaction design laws such as Fitts's Law, Hick's Law, Miller's Law, and Jakob's Law, ensuring high usability and low cognitive load.
- **Accessibility & UX Enhancements**: Keyboard shortcut overlay, toast notification queues, and ARIA-compliant focus management.

## Tech Stack

- **Frontend Core**: HTML5, CSS3 (Vanilla, CSS Variables for Design System), TypeScript.
- **Build Tool**: Vite for fast HMR and optimized production bundling.
- **State Management**: `localStorage` for persisting user favorites, bookings, and mock auth state. No external dependency.
- **Architecture**: Modular TypeScript implementation (`main.ts`, `grid.ts`, `pages.ts`, `reservation.ts`, etc.) using an event-driven publish/subscribe integration model.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sxdxde/Table-Human-Computer-Interaction-.git
   cd Table-Human-Computer-Interaction-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Design Philosophy

The interface was constructed keeping in mind several Human-Computer Interaction principles:
- **Progressive Disclosure**: Advanced filters and booking details are hidden until required.
- **Recognition over Recall**: Extensive use of universally recognized icons, emojis, and visual badges (e.g., Open Now, ₹).
- **Error Prevention & Recovery**: Predictive constraints within the booking modal to prevent invalid actions.

## Repository Structure

- `/src`: Contains all modular TypeScript files controlling logic, UI rendering, routing, and event integration.
- `/pics`: Contains all asset images (table screenshots, frames, yelp case study images).
- `index.html`: The core SPA entry point containing base layouts, structural elements, and all application CSS within the `<style>` block.
- `hci_report.tex`: A comprehensive academic HCI report analyzing the application against design laws.

## License

This project is submitted in partial fulfillment of the requirements of CS5015 — Human Computer Interaction at IIITDM Kancheepuram.
