# Acceptance Criteria

## Overview
A static Progressive Web App for crochet enthusiasts to plan and visualise their projects. Users can upload images, overlay numbered grids for stitch patterns, and build colour palettes — all stored locally in the browser with full offline support.

## Target User
Crochet enthusiasts who want a lightweight, browser-based tool to plan projects without needing an account or internet connection.

## Tech Stack
- Language: TypeScript
- Framework(s): React, Vite
- Database: localStorage (browser)
- Hosting/Infrastructure: GitHub Pages

## Functional Requirements

1. The user can upload an image from their device to use as a project reference.
2. The user can overlay a numbered grid on the uploaded image to visualise stitch patterns.
3. The user can configure grid dimensions (number of rows and columns).
4. The user can toggle grid visibility on and off.
5. The user can create a colour palette by selecting colours with a hex colour picker.
6. The user can add multiple colours to their palette, stored in localStorage.
7. The user can delete individual colours from their palette.
8. Colour palettes persist across browser sessions via localStorage.
9. The app works fully offline after the first load (PWA with service worker).
10. The app works normally when online, with no degraded experience.
11. The app is deployable as a static site on GitHub Pages.

## Non-Functional Requirements
- **Offline support:** A service worker caches all assets so the app functions without a network connection after the first visit.
- **Performance:** Initial page load under 3 seconds on a standard broadband connection.
- **Accessibility:** Colour picker and grid controls are keyboard-navigable.
- **Responsive:** Usable on both desktop and tablet screen sizes.

## Out of Scope
- User authentication or accounts
- Backend / server-side storage
- Stitch counter (deferred to post-MVP)
- Camera capture for yarn colour matching (deferred to post-MVP)
- High-resolution image download (deferred to post-MVP)
- Mobile (phone) layout optimisation
