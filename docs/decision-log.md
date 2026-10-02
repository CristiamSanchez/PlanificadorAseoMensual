# Decision Log

## Decision 001

Date: 2026-10-02

### Decision
The project will be a small JavaScript application for a household cleaning planner with no backend or database.

### Reason
The known project requirements specify JavaScript, browser persistence, no database, and a small scope intended for practice of the ProgramingAssistedAI methodology.

### Alternatives Considered
- Server-side application with database persistence
- Static UI with no persistence
- Separate mobile or desktop clients

### Consequences
- Browser-only storage will be used for persistence.
- The project will remain intentionally small and easy to understand.
- Functionality will stay limited to the current definition.

---

## Decision 002

Date: 2026-10-02

### Decision
Assignments are stored by month in localStorage and only retained for the current month and the immediately previous month.

### Reason
The final phase requires assignment persistence to be limited to the active monthly context while preventing indefinite growth of browser data.

### Alternatives Considered
- Keeping all historical months forever
- Keeping only the current month
- Storing assignment data in a single flat object without a month key

### Consequences
- Old assignment data is automatically removed when the app loads or when a new month is selected.
- Month navigation continues to work without leaving stale assignments behind.
- The application remains simple and browser-only.

---

## Decision 003

Date: 2026-10-02

### Decision
Only one person may be assigned to a weekday at a time. Assignments can be changed or cleared, and unassigned people are allowed.

### Reason
The planner needs predictable weekday display and editable assignments while supporting an explicit unassigned state.

### Alternatives Considered
- Multiple people per weekday
- One person per weekday, with reassignment clearing the previous owner
- Fixed assignments only

### Consequences
- Calendar display has at most one responsible person for each weekday.
- A person may be left unassigned or have their assignment cleared.
