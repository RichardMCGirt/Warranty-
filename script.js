document.addEventListener('DOMContentLoaded', () => {
    const monthYear = document.getElementById('month-year');
    const calendarDates = document.getElementById('calendar-dates');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const selectedDateInput = document.getElementById('selected-date');
    const eventForm = document.getElementById('event-form');
    const eventsListSection = document.getElementById('events-list');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventAddressInput = document.getElementById('event-address');
    const eventPhotoInput = document.getElementById('event-photo');
    const timeSlotSelect = document.getElementById('time-slot');
    const addEventButton = document.getElementById('add-event');
    const cancelEventButton = document.getElementById('cancel-event');
    const eventList = document.getElementById('event-list');
    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';
    const rescheduleEventForm = document.getElementById('reschedule-event-form');
    const rescheduleEventIndexInput = document.getElementById('reschedule-event-index');
    const rescheduleDateInput = document.getElementById('reschedule-date');
    const rescheduleEventDescriptionInput = document.getElementById('reschedule-event-description');
    const rescheduleEventAddressInput = document.getElementById('reschedule-event-address');
    const rescheduleEventPhotoInput = document.getElementById('reschedule-event-photo');
    const rescheduleTimeSlotSelect = document.getElementById('reschedule-time-slot');
    const saveRescheduleButton = document.getElementById('save-reschedule');
    const cancelRescheduleButton = document.getElementById('cancel-reschedule');
    const scheduledAppointments = document.getElementById('scheduled-appointments');
    const todayButton = document.getElementById('today-button');

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
        const today = new Date();
        if (selectedDateCell) {
            selectedDateCell.classList.remove('selected');
        }
        dateCell.classList.add('selected');
        selectedDateCell = dateCell;

        selectedDateInput.value = `${year}-${month + 1}-${date}`;
        showEventForm();
        updateEventList(selectedDateInput.value);
        updateBookedSlots(selectedDateInput.value);

        if (year === today.getFullYear() && month === today.getMonth() && date === today.getDate()) {
            todayButton.classList.add('hidden');
        } else {
            todayButton.classList.remove('hidden');
        }
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
        if (!eventForm) return;
        eventForm.classList.remove('hidden');
        if (eventsListSection) eventsListSection.classList.add('hidden');
    }

    function hideEventForm() {
        if (!eventForm) return;
        eventForm.classList.add('hidden');
        if (eventsListSection) eventsListSection.classList.remove('hidden');
    }

    function showRescheduleEventForm() {
        if (!rescheduleEventForm) return;
        rescheduleEventForm.classList.remove('hidden');
        if (eventsListSection) eventsListSection.classList.add('hidden');
    }

    function hideRescheduleEventForm() {
        if (!rescheduleEventForm) return;
        rescheduleEventForm.classList.add('hidden');
        if (eventsListSection) eventsListSection.classList.remove('hidden');
    }

    function updateEventList(dateStr) {
        if (!eventList) return;
        eventList.innerHTML = '';
        if (events[dateStr]) {
            events[dateStr].forEach((event, index) => {
                const eventItem = document.createElement('li');
                eventItem.innerHTML = `
                    <img src="${event.photo}" alt="Event Photo" width="50" height="50" />
                    ${event.description} at ${event.time}, ${event.address}
                    <button class="reschedule-event" data-date="${dateStr}" data-index="${index}">Reschedule</button>
                    <button class="delete-event" data-date="${dateStr}" data-index="${index}">Delete</button>
                `;
                eventList.appendChild(eventItem);
            });
        }
        if (eventsListSection) eventsListSection.classList.remove('hidden');
        updateScheduledAppointments();
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

    function updateScheduledAppointments() {
        if (!scheduledAppointments) return;
        scheduledAppointments.innerHTML = '';
        for (const [dateStr, eventsOnDate] of Object.entries(events)) {
            if (eventsOnDate && eventsOnDate.length) {
                eventsOnDate.forEach((event, index) => {
                    const appointmentItem = document.createElement('div');
                    appointmentItem.classList.add('appointment-item');
                    appointmentItem.innerHTML = `
                        <strong>Date:</strong> ${dateStr} <br>
                        <strong>Time:</strong> ${event.time} <br>
                        <strong>Description:</strong> ${event.description} <br>
                        <strong>Address:</strong> ${event.address} <br>
                        <img src="${event.photo}" alt="Event Photo" width="50" height="50" />
                        <button class="reschedule-event" data-date="${dateStr}" data-index="${index}">Reschedule</button>
                        <button class="delete-event" data-date="${dateStr}" data-index="${index}">Delete</button>
                    `;
                    scheduledAppointments.appendChild(appointmentItem);
                });
            }
        }
    }

    function showFeedbackMessage(message, success = true) {
        if (!feedbackMessage) return;
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
        const description = eventDescriptionInput.value.trim();
        const address = eventAddressInput.value.trim();
        const photoFile = eventPhotoInput.files[0];

        if (dateStr && description && timeSlot && address && photoFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const photo = e.target.result;
                if (!events[dateStr]) {
                    events[dateStr] = [];
                }
                events[dateStr].push({
                    description,
                    address,
                    time: timeSlot,
                    photo
                });
                localStorage.setItem('events', JSON.stringify(events));

                eventDescriptionInput.value = '';
                eventAddressInput.value = '';
                eventPhotoInput.value = '';
                updateEventList(dateStr);
                renderCalendar();
                hideEventForm();
                showFeedbackMessage('Appointment scheduled successfully!', true);
                location.reload();  // Refresh the page
            };
            reader.readAsDataURL(photoFile);
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
            rescheduleEventDescriptionInput.value = event.description;
            rescheduleEventAddressInput.value = event.address;
            rescheduleTimeSlotSelect.value = event.time;

            showRescheduleEventForm();
        }

        if (e.target.classList.contains('delete-event')) {
            const dateStr = e.target.getAttribute('data-date');
            const index = e.target.getAttribute('data-index');

            if (events[dateStr] && events[dateStr][index]) {
                events[dateStr].splice(index, 1);
                if (events[dateStr].length === 0) {
                    delete events[dateStr];
                }
                localStorage.setItem('events', JSON.stringify(events));
                updateEventList(dateStr);
                renderCalendar();
                showFeedbackMessage('Appointment canceled successfully!', true);
                location.reload();  // Refresh the page
            }
        }
    });

    saveRescheduleButton.addEventListener('click', () => {
        const oldDateStr = rescheduleDateInput.value;
        const newDateStr = document.getElementById('reschedule-date').value;
        const index = rescheduleEventIndexInput.value;
        const description = rescheduleEventDescriptionInput.value.trim();
        const address = rescheduleEventAddressInput.value.trim();
        const photoFile = rescheduleEventPhotoInput.files[0];
        const timeSlot = rescheduleTimeSlotSelect.value;

        if (newDateStr && description && timeSlot && address) {
            const event = {
                description,
                address,
                time: timeSlot
            };

            if (photoFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    event.photo = e.target.result;
                    rescheduleEvent(event, oldDateStr, newDateStr, index);
                };
                reader.readAsDataURL(photoFile);
            } else {
                event.photo = events[oldDateStr][index].photo;
                rescheduleEvent(event, oldDateStr, newDateStr, index);
            }
        } else {
            showFeedbackMessage('Please fill in all fields.', false);
        }
    });

    function rescheduleEvent(event, oldDateStr, newDateStr, index) {
        if (oldDateStr !== newDateStr) {
            if (events[oldDateStr] && events[oldDateStr][index]) {
                events[oldDateStr].splice(index, 1);
                if (events[oldDateStr].length === 0) {
                    delete events[oldDateStr];
                }
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
        location.reload();  // Refresh the page
    }

    cancelRescheduleButton.addEventListener('click', () => {
        hideRescheduleEventForm();
    });

    todayButton.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
        todayButton.classList.add('hidden');
    });

    renderCalendar();
    updateScheduledAppointments(); // Initial load of scheduled appointments
});