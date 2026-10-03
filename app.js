const STORAGE_KEY = 'planificadorLimpiezaX3.state';
const THEME_STORAGE_KEY = 'planificadorLimpiezaX3.theme';
const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const initialPeople = [
  { id: 'monica', name: 'Monica', assignedDay: 'Lunes' },
  { id: 'cristiam', name: 'Cristiam', assignedDay: 'Martes' },
  { id: 'enanillas-cabezoncin', name: 'Enanillas-Cabezoncin', assignedDay: 'Miércoles' }
];

function createDefaultPeople() {
  return initialPeople.map((person) => ({
    id: person.id,
    name: person.name,
    assignedDay: person.assignedDay || null
  }));
}

function createUnassignedPeople() {
  return initialPeople.map((person) => ({
    id: person.id,
    name: person.name,
    assignedDay: null
  }));
}

function clonePeople(people) {
  return people.map((person) => ({
    id: person.id,
    name: person.name,
    assignedDay: person.assignedDay || null
  }));
}

function monthKeyForMonth(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function getRetentionKeys(date = new Date()) {
  const currentKey = monthKeyForMonth(date.getFullYear(), date.getMonth());
  const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const previousKey = monthKeyForMonth(previousMonth.getFullYear(), previousMonth.getMonth());

  return new Set([currentKey, previousKey]);
}

function normalizePeople(rawPeople) {
  const normalized = createDefaultPeople();

  if (!Array.isArray(rawPeople)) {
    return normalized;
  }

  rawPeople.forEach((rawPerson) => {
    if (!rawPerson || typeof rawPerson !== 'object') {
      return;
    }

    const target = normalized.find((person) => person.id === rawPerson.id);

    if (!target) {
      return;
    }

    target.assignedDay = WEEKDAYS.includes(rawPerson.assignedDay) ? rawPerson.assignedDay : null;
  });

  const assignedDays = new Set();

  normalized.forEach((person) => {
    if (person.assignedDay && assignedDays.has(person.assignedDay)) {
      person.assignedDay = null;
    } else if (person.assignedDay) {
      assignedDays.add(person.assignedDay);
    }
  });

  return normalized;
}

function pruneOldAssignments(assignments, date = new Date()) {
  const keepKeys = getRetentionKeys(date);

  Object.keys(assignments).forEach((key) => {
    if (!keepKeys.has(key)) {
      delete assignments[key];
    }
  });
}

function loadState() {
  const today = new Date();
  const fallbackState = {
    currentMonth: today.getMonth(),
    currentYear: today.getFullYear(),
    assignments: {},
    people: createDefaultPeople()
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      const currentKey = monthKeyForMonth(fallbackState.currentYear, fallbackState.currentMonth);
      fallbackState.assignments[currentKey] = clonePeople(fallbackState.people);
      return fallbackState;
    }

    const parsed = JSON.parse(saved);
    const assignments = {};
    const storedMonth = parsed?.currentMonth;
    const currentMonth = Number.isInteger(storedMonth) && storedMonth >= 0 && storedMonth < 12
      ? storedMonth
      : today.getMonth();
    const storedYear = parsed?.currentYear;
    const currentYear =
      Number.isInteger(storedYear) &&
      storedYear >= 100 &&
      storedYear <= 275759 &&
      Number.isFinite(new Date(storedYear, currentMonth, 1).getTime())
        ? storedYear
        : today.getFullYear();
      const retentionKeys = getRetentionKeys(today);

    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.assignments &&
      typeof parsed.assignments === 'object' &&
      !Array.isArray(parsed.assignments)
    ) {
      Object.entries(parsed.assignments).forEach(([key, rawPeople]) => {
        const savedPeople = Array.isArray(rawPeople) ? rawPeople : rawPeople?.people;

        if (Array.isArray(savedPeople)) {
          assignments[key] = normalizePeople(savedPeople);
        }
      });
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.people)) {
      const legacyKey = monthKeyForMonth(currentYear, currentMonth);
      assignments[legacyKey] = normalizePeople(parsed.people);
    }

    pruneOldAssignments(assignments, today);

    const activeKey = monthKeyForMonth(currentYear, currentMonth);
    const isActiveMonthRetained = retentionKeys.has(activeKey);
    const activePeople = assignments[activeKey]
      ? assignments[activeKey]
      : isActiveMonthRetained
        ? createDefaultPeople()
        : createUnassignedPeople();

    if (isActiveMonthRetained) {
      assignments[activeKey] = clonePeople(activePeople);
    }

    return {
      currentMonth,
      currentYear,
      assignments,
      people: isActiveMonthRetained ? assignments[activeKey] : activePeople
    };
  } catch (error) {
    console.warn('No se pudo cargar el estado guardado. Se usa el valor inicial.', error);
    const currentKey = monthKeyForMonth(fallbackState.currentYear, fallbackState.currentMonth);
    fallbackState.assignments[currentKey] = clonePeople(fallbackState.people);
    return fallbackState;
  }
}

function saveState() {
  const snapshot = {
    currentMonth: state.currentMonth,
    currentYear: state.currentYear,
    assignments: {}
  };

  const keepKeys = getRetentionKeys();

  Object.entries(state.assignments).forEach(([key, people]) => {
    if (keepKeys.has(key)) {
      snapshot.assignments[key] = clonePeople(people);
    }
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch (error) {
    console.warn('No se pudo guardar el estado en el navegador.', error);
    return false;
  }
}

const state = loadState();
const peopleList = document.getElementById('peopleList');
const monthLabel = document.getElementById('monthLabel');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const saveMonthBtn = document.getElementById('saveMonthBtn');
const downloadCalendarBtn = document.getElementById('downloadCalendarBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const saveStatus = document.getElementById('saveStatus');
const exportStatus = document.getElementById('exportStatus');

function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'black' ? 'black' : 'current';
  } catch (error) {
    console.warn('No se pudo cargar el tema guardado.', error);
    return 'current';
  }
}

function applyTheme(theme) {
  const isBlackTheme = theme === 'black';
  document.documentElement.dataset.theme = isBlackTheme ? 'black' : 'current';
  themeToggleBtn.textContent = isBlackTheme ? 'Tema: Negro' : 'Tema: Actual';
  themeToggleBtn.setAttribute('aria-pressed', String(isBlackTheme));
  themeToggleBtn.setAttribute(
    'aria-label',
    `Tema actual: ${isBlackTheme ? 'Negro' : 'Actual'}. Cambiar tema.`
  );
}

function toggleTheme() {
  const theme = document.documentElement.dataset.theme === 'black' ? 'current' : 'black';
  applyTheme(theme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('No se pudo guardar el tema en el navegador.', error);
  }
}

function clearFeedback(statusElement) {
  statusElement.hidden = true;
  statusElement.textContent = '';
  delete statusElement.dataset.state;
}

function persistCurrentMonth() {
  const activeKey = monthKeyForMonth(state.currentYear, state.currentMonth);

  if (!getRetentionKeys().has(activeKey)) {
    delete state.assignments[activeKey];
    saveState();
    return false;
  }

  state.assignments[activeKey] = clonePeople(state.people);
  return saveState();
}

function saveCurrentMonth() {
  const activeKey = monthKeyForMonth(state.currentYear, state.currentMonth);

  if (!getRetentionKeys().has(activeKey)) {
    delete state.assignments[activeKey];
    saveState();
    saveStatus.textContent = 'Este mes está fuera del período de conservación.';
    saveStatus.dataset.state = 'error';
    saveStatus.hidden = false;
    return;
  }

  const saved = persistCurrentMonth();
  saveStatus.textContent = saved ? 'Mes guardado.' : 'No se pudo guardar el mes.';
  saveStatus.dataset.state = saved ? 'success' : 'error';
  saveStatus.hidden = false;
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (character) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' };
    return entities[character];
  });
}

function buildCalendarSvg() {
  const width = 1080;
  const height = 1180;
  const padding = 40;
  const gap = 8;
  const cellWidth = (width - padding * 2 - gap * 6) / 7;
  const headerY = 164;
  const headerHeight = 48;
  const calendarY = 226;
  const cellHeight = 126;
  const monthLabelText = escapeXml(formatMonthLabel());
  const title = 'Planificador de Limpieza';
  const shortWeekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const weekdays = shortWeekdays.map((day, index) => {
    const x = padding + index * (cellWidth + gap);
    return `<rect x="${x}" y="${headerY}" width="${cellWidth}" height="${headerHeight}" rx="10" fill="#17212b"/><text x="${x + cellWidth / 2}" y="${headerY + 32}" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="700">${escapeXml(day)}</text>`;
  }).join('');
  const personMarkers = {
    monica: { marker: 'M', color: '#147a56' },
    cristiam: { marker: 'C', color: '#2563eb' },
    'enanillas-cabezoncin': { marker: 'E', color: '#c2410c' }
  };
  const firstDay = new Date(state.currentYear, state.currentMonth, 1);
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    const column = index % 7;
    const row = Math.floor(index / 7);
    const x = padding + column * (cellWidth + gap);
    const y = calendarY + row * (cellHeight + gap);
    const isInMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    const fill = isInMonth ? '#ffffff' : '#e9edf0';
    let content = `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" rx="10" fill="${fill}" stroke="#cbd3d9" stroke-width="2"/>`;

    if (!isInMonth) {
      return content;
    }

    const date = new Date(state.currentYear, state.currentMonth, dayNumber);
    const assignedPerson = getAssignedPersonForDay(getDayNameFromDate(date));
    const assignment = assignedPerson ? personMarkers[assignedPerson.id] : { marker: '-', color: '#747d84' };

    content += `<text x="${x + 12}" y="${y + 34}" fill="#17212b" font-size="32" font-weight="700">${dayNumber}</text>`;
    content += `<circle cx="${x + cellWidth / 2}" cy="${y + 84}" r="24" fill="${assignment.color}"/><text x="${x + cellWidth / 2}" y="${y + 95}" text-anchor="middle" fill="#ffffff" font-size="32" font-weight="700">${assignment.marker}</text>`;
    return content;
  }).join('');

  const legend = [
    { marker: 'M', name: 'Monica', color: personMarkers.monica.color, x: 40 },
    { marker: 'C', name: 'Cristiam', color: personMarkers.cristiam.color, x: 220 },
    { marker: 'E', name: 'Enanillas-Cabezoncin', color: personMarkers['enanillas-cabezoncin'].color, x: 430 },
    { marker: '-', name: 'Sin asignar', color: '#747d84', x: 800 }
  ].map(({ marker, name, color, x }) =>
    `<circle cx="${x + 16}" cy="1127" r="15" fill="${color}"/><text x="${x + 16}" y="1136" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="700">${marker}</text><text x="${x + 38}" y="1135" fill="#17212b" font-size="30">${escapeXml(name)}</text>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f3f6f7"/><text x="${padding}" y="76" fill="#17212b" font-size="42" font-weight="700">${title}</text><text x="${padding}" y="132" fill="#176b50" font-size="34" font-weight="700">${monthLabelText}</text>${weekdays}${cells}<text x="${padding}" y="1075" fill="#17212b" font-size="28" font-weight="700">Asignaciones</text>${legend}</svg>`;
}

function createCalendarPng(svg) {
  return new Promise((resolve, reject) => {
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(svgUrl);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas no disponible.'));
        return;
      }

      context.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('No se pudo crear la imagen.'));
        }
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('No se pudo procesar el calendario.'));
    };
    image.src = svgUrl;
  });
}

async function downloadCalendarImage() {
  downloadCalendarBtn.disabled = true;
  clearFeedback(exportStatus);

  try {
    const imageBlob = await createCalendarPng(buildCalendarSvg());
    const imageUrl = URL.createObjectURL(imageBlob);
    const downloadLink = document.createElement('a');
    const monthKey = monthKeyForMonth(state.currentYear, state.currentMonth);
    downloadLink.href = imageUrl;
    downloadLink.download = `planificador-limpieza-${monthKey}.png`;
    document.body.appendChild(downloadLink);
    try {
      downloadLink.click();
    } finally {
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
    }
    exportStatus.textContent = 'Calendario descargado.';
    exportStatus.hidden = false;
  } catch (error) {
    console.warn('No se pudo exportar el calendario.', error);
    exportStatus.textContent = 'No se pudo descargar el calendario.';
    exportStatus.dataset.state = 'error';
    exportStatus.hidden = false;
  } finally {
    downloadCalendarBtn.disabled = false;
  }
}

applyTheme(loadTheme());

function getDayNameFromDate(date) {
  const dayNumber = date.getDay();

  if (dayNumber === 0) {
    return 'Domingo';
  }

  return WEEKDAYS[dayNumber - 1];
}

function getAssignedPersonForDay(dayName) {
  return state.people.find((person) => person.assignedDay === dayName) || null;
}

function setPersonAssignment(personId, selectedDay) {
  const person = state.people.find((entry) => entry.id === personId);

  if (!person) {
    return;
  }

  const normalizedDay = selectedDay && WEEKDAYS.includes(selectedDay) ? selectedDay : null;

  if (normalizedDay) {
    const conflictingPerson = state.people.find(
      (entry) => entry.id !== personId && entry.assignedDay === normalizedDay
    );

    if (conflictingPerson) {
      conflictingPerson.assignedDay = null;
    }
  }

  person.assignedDay = normalizedDay;
  clearFeedback(saveStatus);

  updateView();
}

function renderPeople() {
  peopleList.innerHTML = '';

  state.people.forEach((person) => {
    const item = document.createElement('li');
    item.className = 'person-item';

    const nameLabel = document.createElement('label');
    nameLabel.className = 'person-label';
    nameLabel.textContent = person.name;

    const select = document.createElement('select');
    select.className = 'day-select';
    select.setAttribute('aria-label', `Asignación para ${person.name}`);

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Sin asignar';
    select.appendChild(emptyOption);

    WEEKDAYS.forEach((day) => {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      select.appendChild(option);
    });

    select.value = person.assignedDay || '';
    select.addEventListener('change', (event) => {
      setPersonAssignment(person.id, event.target.value);
    });

    item.append(nameLabel, select);
    peopleList.appendChild(item);
  });
}

function formatMonthLabel() {
  const monthDate = new Date(state.currentYear, state.currentMonth, 1);
  return new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric'
  }).format(monthDate);
}

function renderCalendar() {
  calendarGrid.innerHTML = '';

  const firstDayOfMonth = new Date(state.currentYear, state.currentMonth, 1);
  const totalDaysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const today = new Date();

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - startOffset + 1;
    const dateForCell = new Date(state.currentYear, state.currentMonth, dayNumber);
    const dayCell = document.createElement('div');

    if (dayNumber < 1 || dayNumber > totalDaysInMonth) {
      dayCell.className = 'day-cell empty';
      calendarGrid.appendChild(dayCell);
      continue;
    }

    const dayName = getDayNameFromDate(dateForCell);
    const assignedPerson = getAssignedPersonForDay(dayName);
    dayCell.className = 'day-cell';

    const dayNumberElement = document.createElement('span');
    dayNumberElement.className = 'day-number';
    dayNumberElement.textContent = String(dayNumber);

    const assignmentElement = document.createElement('span');
    assignmentElement.className = 'day-assignment';
    assignmentElement.textContent = assignedPerson ? assignedPerson.name : 'Sin asignar';

    const isCurrentDay =
      state.currentMonth === today.getMonth() &&
      state.currentYear === today.getFullYear() &&
      dayNumber === today.getDate();

    if (isCurrentDay) {
      dayCell.classList.add('is-today');
    }

    dayCell.append(dayNumberElement, assignmentElement);
    calendarGrid.appendChild(dayCell);
  }
}

function updateView() {
  const activeKey = monthKeyForMonth(state.currentYear, state.currentMonth);
  const retentionKeys = getRetentionKeys();

  if (retentionKeys.has(activeKey)) {
    state.assignments[activeKey] = clonePeople(state.people || state.assignments[activeKey] || createDefaultPeople());
    state.people = state.assignments[activeKey];
  } else {
    delete state.assignments[activeKey];
    state.people = state.people || createUnassignedPeople();
  }

  pruneOldAssignments(state.assignments);
  monthLabel.textContent = formatMonthLabel();
  renderPeople();
  renderCalendar();
  saveState();
}

function changeMonth(offset) {
  persistCurrentMonth();
  const selectedMonth = new Date(state.currentYear, state.currentMonth + offset, 1);
  state.currentMonth = selectedMonth.getMonth();
  state.currentYear = selectedMonth.getFullYear();
  const monthKey = monthKeyForMonth(state.currentYear, state.currentMonth);
  const retentionKeys = getRetentionKeys();
  const monthPeople = state.assignments[monthKey] ||
    (retentionKeys.has(monthKey) ? createDefaultPeople() : createUnassignedPeople());
  state.people = clonePeople(monthPeople);
  clearFeedback(saveStatus);
  clearFeedback(exportStatus);
  updateView();
}

saveMonthBtn.addEventListener('click', saveCurrentMonth);
downloadCalendarBtn.addEventListener('click', downloadCalendarImage);
themeToggleBtn.addEventListener('click', toggleTheme);
prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

updateView();
