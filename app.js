const STORAGE_KEY = 'planificadorLimpiezaX3.state';
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

function getRetentionKeys(year, month) {
  const currentKey = monthKeyForMonth(year, month);
  const previousDate = new Date(year, month - 1, 1);
  const previousKey = monthKeyForMonth(previousDate.getFullYear(), previousDate.getMonth());

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

function pruneOldAssignments(assignments, year, month) {
  const keepKeys = getRetentionKeys(year, month);

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

    pruneOldAssignments(assignments, currentYear, currentMonth);

    const activeKey = monthKeyForMonth(currentYear, currentMonth);
    const activePeople = assignments[activeKey] ? assignments[activeKey] : createDefaultPeople();
    assignments[activeKey] = clonePeople(activePeople);

    return {
      currentMonth,
      currentYear,
      assignments,
      people: assignments[activeKey]
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

  const keepKeys = getRetentionKeys(state.currentYear, state.currentMonth);

  Object.entries(state.assignments).forEach(([key, people]) => {
    if (keepKeys.has(key)) {
      snapshot.assignments[key] = clonePeople(people);
    }
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('No se pudo guardar el estado en el navegador.', error);
  }
}

const state = loadState();
const peopleList = document.getElementById('peopleList');
const monthLabel = document.getElementById('monthLabel');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

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
  if (!state.assignments[activeKey]) {
    state.assignments[activeKey] = clonePeople(state.people || createDefaultPeople());
  }

  state.people = state.assignments[activeKey];
  pruneOldAssignments(state.assignments, state.currentYear, state.currentMonth);
  monthLabel.textContent = formatMonthLabel();
  renderPeople();
  renderCalendar();
  saveState();
}

function changeMonth(offset) {
  const selectedMonth = new Date(state.currentYear, state.currentMonth + offset, 1);
  state.currentMonth = selectedMonth.getMonth();
  state.currentYear = selectedMonth.getFullYear();
  const monthKey = monthKeyForMonth(state.currentYear, state.currentMonth);
  state.people = state.assignments[monthKey] || createDefaultPeople();
  updateView();
}

prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

updateView();
