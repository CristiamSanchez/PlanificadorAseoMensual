# Architecture

## Overview
The project is a small browser-only application for managing a household cleaning schedule. It has no backend or database. The primary concern is to render a month-based calendar and keep the cleaning assignments available across browser sessions.

## Application Structure
- Presentation layer: renders the calendar, person list, and assignment information.
- State and interaction logic: `app.js` holds the displayed month and month-specific assignments, handles user input, and renders the view.
- Persistence: `loadState` and `saveState` in `app.js` read and write browser storage.
- Calendar export: builds a clean SVG from the displayed month and assignment state, then uses Canvas to download a PNG without capturing UI controls.
- Theme preference: applies the selected CSS theme and stores it separately from assignment data.
- Domain model: defines the concepts used by the app (person, weekday, assignment, calendar month).

## Main Components
### Calendar view
Responsible for rendering the month layout and day cells.

### Person schedule model
Represents the three initial people and their assigned cleaning days.

### Persistence
Reads and writes the schedule state from browser storage so data survives refreshes and reopening the browser. Invalid stored entries are ignored or normalized; unavailable storage does not prevent the interface from rendering.

### Theme and styling
Provides the dark, coherent visual treatment expected for the application.

## Responsibilities
- Display the monthly calendar.
- Show the current month and allow month changes.
- Associate people with cleaning days.
- Keep assignment data available between sessions.
- Keep the application small and easy to understand for learning and maintenance.

## Data Flow
1. The app loads and normalizes saved schedule state from browser storage, or uses defaults.
2. The displayed month and its assignments are rendered.
3. User interactions change the month or assignment state.
4. State is saved and assignment entries outside the real current month and its immediately previous month are removed, regardless of the displayed month.

## Browser Persistence Approach
The project is intentionally browser-only. Persistence uses localStorage and stores assignments grouped by month key. The retention window is calculated from the real system date: the real current month and immediately previous calendar month. It does not depend on the displayed month. Assignment buckets outside that window are pruned on load and save; viewing an out-of-window month shows it unassigned and does not create a persistent bucket. Existing `retainedMonthKey` values from Phase 5 are ignored. The separate theme preference key is not subject to month cleanup.

The "Guardar mes" action explicitly writes a snapshot of the active month and reports success or failure. Automatic persistence remains enabled for assignments and navigation.

PNG export is generated locally: JavaScript creates a controlled SVG calendar, the browser rasterizes it through Canvas, and a PNG download link is triggered. This avoids third-party code and excludes application controls by construction.

## Important Boundaries
- No backend service.
- No database.
- No external service dependency for core scheduling logic.
- Assignment storage reads and writes are confined to `loadState` and `saveState`; theme preference uses the separate `loadTheme` and `toggleTheme` functions.
- The UI and domain logic remain together in the small, framework-free `app.js` file.
- The project remains intentionally small and avoids framework-heavy patterns.

## Architectural Constraints
- JavaScript only.
- Small project scope.
- No database.
- Browser-based persistence.
- Dark theme UI.
- No application functionality beyond the defined cleaning-planner purpose.
