# Architecture

## Overview
The project is a small browser-only application for managing a household cleaning schedule. It has no backend or database. The primary concern is to render a month-based calendar and keep the cleaning assignments available across browser sessions.

## Application Structure
- Presentation layer: renders the calendar, person list, and assignment information.
- State and interaction logic: `app.js` holds the displayed month and month-specific assignments, handles user input, and renders the view.
- Persistence: `loadState` and `saveState` in `app.js` read and write browser storage.
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
4. State is saved and entries outside the displayed month and its previous month are removed.

## Browser Persistence Approach
The project is intentionally browser-only. Persistence uses localStorage and stores assignments grouped by month key. The application keeps assignment data only for the current month and the immediately previous month, removing older month entries automatically when the app loads or the displayed month changes.

## Important Boundaries
- No backend service.
- No database.
- No external service dependency for core scheduling logic.
- Storage reads and writes are confined to `loadState` and `saveState`.
- The UI and domain logic remain together in the small, framework-free `app.js` file.
- The project remains intentionally small and avoids framework-heavy patterns.

## Architectural Constraints
- JavaScript only.
- Small project scope.
- No database.
- Browser-based persistence.
- Dark theme UI.
- No application functionality beyond the defined cleaning-planner purpose.
