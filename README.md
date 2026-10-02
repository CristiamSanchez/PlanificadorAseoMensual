# Planificador de Limpieza

A small household planner for Monica, Cristiam, and Enanillas-Cabezoncin. It assigns cleaning weekdays and displays the schedule on a monthly calendar.

## Technologies

- HTML, CSS, and plain JavaScript
- Browser `localStorage` for persistence
- No framework, package manager, backend, or database

## Run Locally

From the project directory, start a static server:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). No build or dependency installation is required. A static server is recommended because browser storage behavior for directly opened `file:` pages varies by browser.

## Data and Retention

Assignments are saved in this browser under `planificadorLimpiezaX3.state`, grouped by `YYYY-MM` month keys. The app retains the displayed month and the immediately previous month; older entries are removed when the app loads or the displayed month changes. Data stays in this browser and is not synchronized or backed up.

## Project Structure

```text
index.html        Application markup
styles.css        Dark theme and responsive layout
app.js            Calendar, assignments, and localStorage behavior
docs/             Requirements, architecture, domain, decisions, and state
AGENTS.md         Project-specific AI working instructions
```
