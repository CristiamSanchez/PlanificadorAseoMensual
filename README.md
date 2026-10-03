# Planificador de Limpieza

A small household planner for Monica, Cristiam, and Enanillas-Cabezoncin. It assigns cleaning weekdays, displays them on a monthly calendar, and can save or export the displayed month.

## Technologies

- HTML, CSS, and plain JavaScript
- Browser `localStorage` for persistence
- Browser SVG and Canvas APIs for PNG export
- No framework, package manager, backend, or database

## Run Locally

From the project directory, start a static server:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). No build or dependency installation is required. A static server is recommended because browser storage behavior for directly opened `file:` pages varies by browser.

## Data and Retention

Assignments are saved in this browser under `planificadorLimpiezaX3.state`, grouped by `YYYY-MM` month keys. Changes save automatically; **Guardar mes** also explicitly saves the displayed month and confirms the result. Retention is based on the real calendar date: only the real current month and immediately previous month are stored, regardless of which month is displayed. Other months display without assignments and are not persisted. Data stays in this browser and is not synchronized or backed up.

Use **Descargar calendario** to download a 1080 × 1180 PNG of the displayed month. Dates use person initials with a full-name legend for phone-sized viewing. **Tema: Actual/Negro** switches between the original blue-gray theme and a black/charcoal theme; the preference is stored separately under `planificadorLimpiezaX3.theme`.

## Project Structure

```text
index.html        Application markup
styles.css        Dark theme and responsive layout
app.js            Calendar, assignments, and localStorage behavior
docs/             Requirements, architecture, domain, decisions, and state
AGENTS.md         Project-specific AI working instructions
```
