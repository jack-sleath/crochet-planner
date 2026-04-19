# Milestones

## Tech Stack
- Language: TypeScript
- Framework(s): React, Vite
- Database: localStorage (browser)
- Hosting/Infrastructure: GitHub Pages

---

## Milestone 1 — Project Scaffold
**Goal:** A working React + TypeScript + Vite app that builds, runs locally, and deploys to GitHub Pages.

**Tasks:**
- Initialise Vite project with React + TypeScript template
- Configure GitHub Pages deployment via GitHub Actions
- Add a basic `index.html` with an `<App />` root component
- Verify the app builds with `vite build` and serves with `vite preview`

**Done when:**
- [ ] `npm run dev` starts the dev server with no errors
- [ ] `npm run build` produces a `dist/` folder
- [ ] A placeholder "Crochet Planner" heading is visible in the browser
- [ ] GitHub Actions deploys the build to GitHub Pages on push to `main`

---

## Milestone 2 — Image Upload
**Goal:** Users can upload an image from their device and see it rendered in the app.

**Tasks:**
- Add a file input that accepts image formats (PNG, JPG, WEBP)
- Read the selected file with `FileReader` and render it in an `<img>` or `<canvas>` element
- Display a placeholder/prompt when no image has been uploaded

**Done when:**
- [ ] Clicking "Upload Image" opens the OS file picker
- [ ] Selected image renders visibly in the app
- [ ] App does not crash on unsupported file types (shows an error message)

---

## Milestone 3 — Grid Overlay
**Goal:** Users can overlay a configurable numbered grid on top of the uploaded image.

**Tasks:**
- Render a `<canvas>` overlay on top of the image using absolute positioning
- Draw grid lines and cell numbers based on row/column inputs
- Add number inputs for rows and columns with sensible defaults (e.g. 10×10)
- Add a toggle to show/hide the grid

**Done when:**
- [ ] A numbered grid renders correctly over the uploaded image
- [ ] Changing row/column values updates the grid in real time
- [ ] Grid toggle hides and shows the overlay
- [ ] Grid numbers are legible on both light and dark images

---

## Milestone 4 — Colour Palette Builder
**Goal:** Users can build a colour palette using a hex picker and have it persist across sessions.

**Tasks:**
- Add a colour picker input (`<input type="color">`) and an "Add colour" button
- Display saved colours as swatches with their hex values
- Allow individual colours to be removed from the palette
- Persist the palette to `localStorage` and reload it on app start

**Done when:**
- [ ] User can pick a colour and add it to the palette
- [ ] Palette swatches display the correct colour and hex value
- [ ] Removing a colour updates the palette immediately
- [ ] Palette survives a browser refresh

---

## Milestone 5 — PWA & Offline Support
**Goal:** The app works offline after the first visit and is installable as a PWA.

**Tasks:**
- Add a `manifest.json` with app name, icons, and theme colour
- Register a Vite PWA plugin (`vite-plugin-pwa`) to generate a service worker
- Configure the service worker to cache all static assets
- Test offline mode using browser DevTools (Network → Offline)

**Done when:**
- [ ] App loads and is fully functional with network disabled in DevTools
- [ ] Browser shows an "Install" prompt (app is installable from the address bar)
- [ ] No console errors in offline mode
- [ ] Online mode continues to work normally (no regressions)

---

## Milestone 6 — Polish & Accessibility
**Goal:** The app is visually polished, responsive on desktop/tablet, and keyboard-navigable.

**Tasks:**
- Apply a consistent visual style (typography, spacing, colour scheme)
- Ensure all interactive controls are reachable and operable by keyboard
- Add `aria-label`s to icon-only buttons and colour swatches
- Test layout at common breakpoints (1280px desktop, 768px tablet)
- Fix any remaining console warnings

**Done when:**
- [ ] App passes a basic Lighthouse accessibility audit (no critical issues)
- [ ] Layout is usable and unbroken at 768px and 1280px widths
- [ ] All Acceptance Criteria functional requirements are met end-to-end
