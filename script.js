document.addEventListener('DOMContentLoaded', () => {
    const monthYear = document.getElementById('month-year');
    const calendarDates = document.getElementById('calendar-dates');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const selectedDateInput = document.getElementById('selected-date');
    const eventForm = document.getElementById('event-form');
    const eventsListSection = document.getElementById('events-list');
    const eventTitleInput = document.getElementById('event-title');
    const eventDescriptionInput = document.getElementById('event-description');
    const timeSlotSelect = document.getElementById('time-slot');
    const addEventButton = document.getElementById('add-event');
    const cancelEventButton = document.getElementById('cancel-event');
    const eventList = document.getElementById('event-list');

    let currentDate = new Date();
    let events = {};

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        // Get first and last day of the month
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Clear previous dates
        calendarDates.innerHTML = '';

        // Add padding for first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            calendarDates.appendChild(emptyCell);
        }

        // Add dates of the month
        for (let date = 1; date <= lastDate; date++) {
            const dateCell = document.createElement('div');
            dateCell.textContent = date;
            dateCell.classList.add('date-cell');
            dateCell.addEventListener('click', () => {
                selectedDateInput.value = `${year}-${month + 1}-${date}`;
                showEventForm();
                updateEventList(selectedDateInput.value);
            });
            calendarDates.appendChild(dateCell);
        }
    }

    function showEventForm() {
        eventForm.classList.remove('hidden');
        eventsListSection.classList.add('hidden');
    }

    function hideEventForm() {
        eventForm.classList.add('hidden');
        eventsListSection.classList.remove('hidden');
    }

    function updateEventList(dateStr) {
        eventList.innerHTML = '';
        if (events[dateStr]) {
            events[dateStr].forEach(event => {
                const eventItem = document.createElement('li');
                eventItem.textContent = `${event.title} at ${event.time}: ${event.description}`;
                eventList.appendChild(eventItem);
            });
        }
        eventsListSection.classList.remove('hidden');
    }

    addEventButton.addEventListener('click', () => {
        const dateStr = selectedDateInput.value;
        const timeSlot = timeSlotSelect.value;
        if (dateStr && eventTitleInput.value && timeSlot) {
            if (!events[dateStr]) {
                events[dateStr] = [];
            }
            events[dateStr].push({
                title: eventTitleInput.value,
                description: eventDescriptionInput.value,
                time: timeSlot
            });
            eventTitleInput.value = '';
            eventDescriptionInput.value = '';
            updateEventList(dateStr);
            renderCalendar();
            hideEventForm();
        }
    });

    cancelEventButton.addEventListener('click', () => {
        hideEventForm();
    });

    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});
