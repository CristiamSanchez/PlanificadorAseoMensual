# Requirements

## Project Objective
The project is a small household cleaning planner for a family group of three people. It helps visualize which person is responsible for cleaning on each day of the week and presents the schedule in a monthly calendar view, with assignment information preserved in the browser between sessions.

## Users
The application is intended for household members who need to manage and consult the cleaning schedule. At initial definition, the users are the people represented in the planner:

- Monica
- Cristiam
- Enanillas-Cabezoncin

## Functional Requirements
- FR-001: The application shall show a monthly calendar view for the current month.
- FR-002: The application shall present the three initial household members: Monica, Cristiam, and Enanillas-Cabezoncin.
- FR-003: The application shall allow each person to be assigned a cleaning day within the weekly schedule.
- FR-004: The calendar shall update when the user navigates to a different month.
- FR-005: The application shall persist assignment data between browser sessions.
- FR-006: The application shall display the cleaning assignment in the context of the month and day-of-week layout.
- FR-007: The application shall use a dark visual theme.
- FR-008: Assignments shall be stored by month and retained only for the current month and the immediately previous month.

## Non-Functional Requirements
- NFR-001 Usability: The interface must be readable and visually coherent, with sufficient styling to be pleasant to use.
- NFR-002 Persistence: Assignment data must persist in the browser without a server-side database.
- NFR-003 Responsiveness: The layout should adapt to common desktop and laptop browser sizes without major usability issues.
- NFR-004 Maintainability: The project must remain small and straightforward to support the learning purpose of the methodology.
- NFR-005 Portability: The app should operate as a browser-based tool without requiring a backend service for the initial scope.

## Scope
### In Scope
- A small browser-based cleaning planner
- Three initial people and a cleaning-day assignment model
- Monthly calendar display
- Month navigation
- Persistence in the browser
- Dark theme styling
- Simple, small-scale implementation suitable for practice

### Out of Scope
- Server-side persistence or database
- User accounts or authentication
- Multi-user synchronization across devices
- Automatic notifications or reminders
- Complex recurrence logic beyond a weekly household schedule
- Advanced analytics, reporting, or export features
- External frameworks or libraries unless required by project constraints

## Requirements Status
No requirements questions remain open. The weekday assignment policy and localStorage retention behavior are recorded in `docs/decision-log.md`.
