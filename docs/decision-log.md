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

Status: Superseded by Decision 004.

Date: 2026-10-02

### Decision
The initial storage policy retained the displayed month and its chronological previous month. Phase 5 superseded this policy with the navigation window in Decision 004.

### Reason
The original requirements limited assignment persistence to a two-month window to prevent indefinite growth of browser data.

### Alternatives Considered
- Keeping all historical months forever
- Keeping only the current month
- Storing assignment data in a single flat object without a month key

### Consequences
- This policy is historical; current retention behavior is described by Decision 004.
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

---

## Decision 004

Status: Superseded by Decision 008.

Date: 2026-10-02

### Decision
During Phase 5, retain the displayed month and the adjacent month just navigated from, storing the latter as `retainedMonthKey`.

### Reason
This was a Phase 5 response to backward navigation losing the month just left. Phase 6 replaces it because retention must be based on the real current calendar month, not navigation.

### Alternatives Considered
- Keep only the displayed month and chronological previous month
- Keep all browsed month assignments
- Keep the displayed month and the adjacent month just left

### Consequences
- This policy is historical and no longer controls retention.
- Existing `retainedMonthKey` data is ignored by the real-date policy in Decision 008.

---

## Decision 005

Date: 2026-10-02

### Decision
Keep automatic assignment persistence and add an explicit "Guardar mes" action with visible success or failure feedback.

### Reason
Users asked for clear confirmation that the displayed month's assignments were saved, while navigation must remain safe without requiring a manual save.

### Alternatives Considered
- Replace automatic persistence with a manual-only save
- Keep automatic persistence and add an explicit save confirmation

### Consequences
- Navigation and assignment changes continue to save automatically.
- The explicit action writes a snapshot for the displayed month and confirms whether localStorage accepted it.

---

## Decision 006

Date: 2026-10-02

### Decision
Persist the selected theme in a separate localStorage key from assignment data.

### Reason
Theme preference should survive refreshes without being affected by monthly assignment pruning.

### Alternatives Considered
- Do not persist the theme
- Store theme preference inside the month-scoped assignment state
- Use a separate theme preference key

### Consequences
- Theme toggling does not change or prune assignments.
- The preference remains browser-local and independent of the two-month assignment window.

---

## Decision 007

Date: 2026-10-02

### Decision
Generate the calendar image with a curated SVG and rasterize it to PNG using the browser Canvas API, without a third-party library.

### Reason
The calendar has a small fixed structure, so a controlled image layout can reproduce its content reliably without capturing unrelated controls or adding dependencies.

### Alternatives Considered
- Add a DOM-to-image library
- Capture the application UI as a screenshot
- Generate a dedicated SVG calendar and rasterize it locally

### Consequences
- Export works client-side and contains only the title, month, weekday headers, days, and assignments.
- The generated PNG is 1080 by 1180 pixels, uses initials in date cells, and maps them to full names in a legend for phone-sized viewing.

---

## Decision 008

Date: 2026-10-02

### Decision
Retain assignment data only for the real current calendar month and the immediately previous real calendar month, independent of the month currently displayed.

### Reason
Browsing to older or future months must not shift the retention window or delete assignments for the real current/previous months.

### Alternatives Considered
- Base retention on the displayed month
- Retain the month just navigated from
- Base retention on the real current calendar month

### Consequences
- Older and future month keys are pruned on load and save.
- An out-of-window month with no stored data displays unassigned and does not create a persistent assignment bucket.
- Phase 5 `retainedMonthKey` metadata is ignored.
