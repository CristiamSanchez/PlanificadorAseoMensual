# Domain Model

## Overview
The domain is a simple household cleaning schedule. The model centers on the people involved, the weekday assigned to each person, and the monthly calendar that shows the schedule.

## Main Concepts

### Person
Purpose: Represents an individual responsible for one cleaning day in the household schedule.

Rules:
- The project initially includes exactly three people: Monica, Cristiam, and Enanillas-Cabezoncin.
- A person may be represented with a name and an identifier used in the UI.
- A person may have one assigned weekday or no assignment.

Relationships:
- A person has zero or one cleaning assignment.
- A person belongs to the same household schedule as the other persons.

### CleaningAssignment
Purpose: Represents the relationship between a person and the day of the week on which they clean.

Rules:
- The assignment connects a Person to a Weekday.
- The assignment may be displayed in the calendar.
- The project must keep track of which person is assigned to which weekday.
- A weekday may be assigned to at most one person; assigning it to another person clears the previous assignment.

Relationships:
- Many assignments may exist in a schedule.
- Each assignment belongs to a single person.
- A weekday may be assigned to at most one person.

### Weekday
Purpose: Represents the day of the week used in the cleaning rotation.

Rules:
- The weekly cycle is based on the seven days of the week.
- The schedule is organized around weekdays, not arbitrary dates.
- The day names must be consistent with a standard calendar.
- Each weekday may be assigned to at most one person.
- Unassigned weekdays and people are displayed as "Sin asignar" where applicable.

Relationships:
- A Weekday can be assigned to zero or one person.

### CalendarMonth
Purpose: Represents the month being displayed in the planner.

Rules:
- It defines the month and year currently shown in the UI.
- It determines which calendar dates are rendered.
- It is used as the month key for saved assignments.
- Navigation uses the previous and next calendar month, including year boundaries.
- Each month has its own independent person-to-weekday assignments.
- Assignment retention is based on the real current calendar month and its immediately previous month, not on the displayed month.
- Months outside the retention window display without assignments and are not persisted.

Relationships:
- A month contains calendar cells used to display assignments.
- The current month is part of the schedule display state.

## Business Rules
- Each initial person may have an assigned weekday or be unassigned.
- The application displays a monthly calendar as the primary view.
- Assignment data must remain available in the browser between sessions.
- Month navigation loads the destination month's assignment independently without changing the real-date retention window.
- Explicit save persists the displayed month's assignments only when it is in the real-date retention window; automatic persistence remains enabled for those months.
- The project remains intentionally small and limited to a family cleaning planner.

## Important Constraints
- Assignments may be changed or cleared through the UI.
- No database or backend persistence is included in the current scope.
