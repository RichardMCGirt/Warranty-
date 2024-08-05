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
    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';
    const rescheduleEventForm = document.getElementById('reschedule-event-form');
    const rescheduleEventIndexInput = document.getElementById('reschedule-event-index');
    const rescheduleDateInput = document.getElementById('reschedule-date');
    const rescheduleEventTitleInput = document.getElementById('reschedule-event-title');
    const rescheduleEventDescriptionInput = document.getElementById('reschedule-event-description');
    const rescheduleTimeSlotSelect = document.getElementById('reschedule-time-slot');
    const saveRescheduleButton = document.getElementById('save-reschedule');
    const cancelRescheduleButton = document.getElementById('cancel-reschedule');

    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('events')) || {};
    let selectedDateCell = null;

    document.body.appendChild(feedbackMessage);

    function renderCalendar() {
        const today = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        calendarDates.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            calendarDates.appendChild(emptyCell);
        }

        for (let date = 1; date <= lastDate; date++) {
            const dateCell = document.createElement('div');
            dateCell.textContent = date;
            dateCell.classList.add('date-cell');
            dateCell.tabIndex = 0; // Make date cells focusable
            const cellDate = new Date(year, month, date);

            if (cellDate < today.setHours(0, 0, 0, 0)) {
                dateCell.classList.add('past-date');
                dateCell.style.pointerEvents = 'none';
                dateCell.style.opacity = '0.5';
            } else {
                dateCell.addEventListener('click', () => {
                    selectDateCell(dateCell, year, month, date);
                });
                dateCell.addEventListener('keydown', (e) => handleDateKeydown(e, dateCell, year, month, date));
            }
            calendarDates.appendChild(dateCell);
        }
    }

    function selectDateCell(dateCell, year, month, date) {
        if (selectedDateCell) {
            selectedDateCell.classList.remove('selected');
        }
        dateCell.classList.add('selected');
        selectedDateCell = dateCell;

        selectedDateInput.value = `${year}-${month + 1}-${date}`;
        showEventForm();
        updateEventList(selectedDateInput.value);
        updateBookedSlots(selectedDateInput.value);
    }

    function handleDateKeydown(event, dateCell, year, month, date) {
        switch (event.key) {
            case 'ArrowLeft':
                moveFocus(dateCell, -1);
                break;
            case 'ArrowRight':
                moveFocus(dateCell, 1);
                break;
            case 'ArrowUp':
                moveFocus(dateCell, -7);
                break;
            case 'ArrowDown':
                moveFocus(dateCell, 7);
                break;
        }
    }

    function moveFocus(dateCell, offset) {
        const allDates = [...calendarDates.querySelectorAll('.date-cell')];
        const currentIndex = allDates.indexOf(dateCell);
        const newIndex = currentIndex + offset;
        if (newIndex >= 0 && newIndex < allDates.length) {
            allDates[newIndex].focus();
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

    function showRescheduleEventForm() {
        rescheduleEventForm.classList.remove('hidden');
        eventsListSection.classList.add('hidden');
    }

    function hideRescheduleEventForm() {
        rescheduleEventForm.classList.add('hidden');
        eventsListSection.classList.remove('hidden');
    }

    function updateEventList(dateStr) {
        eventList.innerHTML = '';
        if (events[dateStr]) {
            events[dateStr].forEach((event, index) => {
                const eventItem = document.createElement('li');
                eventItem.innerHTML = `
                    ${event.title} at ${event.time}: ${event.description}
                    <button class="reschedule-event" data-date="${dateStr}" data-index="${index}">Reschedule</button>
                    <button class="delete-event" data-date="${dateStr}" data-index="${index}">Delete</button>
                `;
                eventList.appendChild(eventItem);
            });
        }
        eventsListSection.classList.remove('hidden');
    }

    function updateBookedSlots(dateStr) {
        const bookedTimes = events[dateStr]?.map(event => event.time) || [];
        timeSlotSelect.querySelectorAll('option').forEach(option => {
            if (bookedTimes.includes(option.value)) {
                option.disabled = true;
                option.textContent = `${option.value} (Booked)`;
            } else {
                option.disabled = false;
                option.textContent = option.value;
            }
        });
    }

    function showFeedbackMessage(message, success = true) {
        feedbackMessage.textContent = message;
        feedbackMessage.style.backgroundColor = success ? 'green' : 'red';
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }

    addEventButton.addEventListener('click', () => {
        const dateStr = selectedDateInput.value;
        const timeSlot = timeSlotSelect.value;
        const title = eventTitleInput.value.trim();
        const description = eventDescriptionInput.value.trim();

        if (dateStr && title && timeSlot) {
            if (!events[dateStr]) {
                events[dateStr] = [];
            }
            events[dateStr].push({
                title,
                description,
                time: timeSlot
            });
            localStorage.setItem('events', JSON.stringify(events));

            eventTitleInput.value = '';
            eventDescriptionInput.value = '';
            updateEventList(dateStr);
            renderCalendar();
            hideEventForm();
            showFeedbackMessage('Appointment scheduled successfully!', true);
        } else {
            showFeedbackMessage('Please fill in all fields.', false);
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        } else if (e.key === 'ArrowRight') {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('reschedule-event')) {
            const dateStr = e.target.getAttribute('data-date');
            const index = e.target.getAttribute('data-index');
            const event = events[dateStr][index];

            rescheduleEventIndexInput.value = index;
            rescheduleDateInput.value = dateStr;
            rescheduleEventTitleInput.value = event.title;
            rescheduleEventDescriptionInput.value = event.description;
            rescheduleTimeSlotSelect.value = event.time;

            showRescheduleEventForm();
        }

        if (e.target.classList.contains('delete-event')) {
            const dateStr = e.target.getAttribute('data-date');
            const index = e.target.getAttribute('data-index');

            events[dateStr].splice(index, 1);
            if (events[dateStr].length === 0) {
                delete events[dateStr];
            }
            localStorage.setItem('events', JSON.stringify(events));
            updateEventList(dateStr);
            renderCalendar();
            showFeedbackMessage('Appointment canceled successfully!', true);
        }
    });

    saveRescheduleButton.addEventListener('click', () => {
        const oldDateStr = rescheduleDateInput.value;
        const newDateStr = document.getElementById('reschedule-date').value;
        const index = rescheduleEventIndexInput.value;
        const title = rescheduleEventTitleInput.value.trim();
        const description = rescheduleEventDescriptionInput.value.trim();
        const timeSlot = rescheduleTimeSlotSelect.value;

        if (newDateStr && title && timeSlot) {
            const event = {
                title,
                description,
                time: timeSlot
            };

            // Remove event from old date
            if (oldDateStr !== newDateStr) {
                events[oldDateStr].splice(index, 1);
                if (events[oldDateStr].length === 0) {
                    delete events[oldDateStr];
                }
                if (!events[newDateStr]) {
                    events[newDateStr] = [];
                }
                events[newDateStr].push(event);
            } else {
                events[oldDateStr][index] = event;
            }

            localStorage.setItem('events', JSON.stringify(events));

            updateEventList(newDateStr);
            renderCalendar();
            hideRescheduleEventForm();
            showFeedbackMessage('Appointment rescheduled successfully!', true);
        } else {
            showFeedbackMessage('Please fill in all fields.', false);
        }
    });

    cancelRescheduleButton.addEventListener('click', () => {
        hideRescheduleEventForm();
    });

    renderCalendar();
});
