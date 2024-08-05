document.addEventListener('DOMContentLoaded', () => {
    const monthYear = document.getElementById('month-year');
    const calendarDates = document.getElementById('calendar-dates');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const selectedDateInput = document.getElementById('selected-date');
    const eventTitleInput = document.getElementById('event-title');
    const eventDescriptionInput = document.getElementById('event-description');
    const addEventButton = document.getElementById('add-event');
    const cancelEventButton = document.getElementById('cancel-event');
    const eventList = document.getElementById('event-list');
    const eventForm = document.getElementById('event-form');
    const eventsListSection = document.getElementById('events-list');

    let currentDate = new Date();
    let events = {}; // Stores events keyed by date

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        
        calendarDates.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            calendarDates.innerHTML += '<div></div>';
        }

        for (let day = 1; day <= lastDate; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const eventCount = events[dateStr] ? events[dateStr].length : 0;
            calendarDates.innerHTML += `
                <div class="calendar-date" data-date="${dateStr}">
                    ${day} ${eventCount > 0 ? `<span class="event-count">${eventCount}</span>` : ''}
                </div>
            `;
        }
        
        // Add click event listeners to dates
        document.querySelectorAll('.calendar-date').forEach(dateDiv => {
            dateDiv.addEventListener('click', () => {
                selectDate(dateDiv.dataset.date);
            });
        });
    }

    function selectDate(dateStr) {
        selectedDateInput.value = dateStr;
        eventForm.classList.remove('hidden');
        updateEventList(dateStr);
        eventsListSection.classList.add('hidden');
    }

    function updateEventList(dateStr) {
        eventList.innerHTML = '';
        if (events[dateStr]) {
            events[dateStr].forEach(event => {
                eventList.innerHTML += `<li><strong>${event.title}</strong>: ${event.description}</li>`;
            });
        }
    }

    addEventButton.addEventListener('click', () => {
        const dateStr = selectedDateInput.value;
        if (dateStr && eventTitleInput.value) {
            if (!events[dateStr]) {
                events[dateStr] = [];
            }
            events[dateStr].push({
                title: eventTitleInput.value,
                description: eventDescriptionInput.value
            });
            eventTitleInput.value = '';
            eventDescriptionInput.value = '';
            updateEventList(dateStr);
            renderCalendar();
        }
    });

    cancelEventButton.addEventListener('click', () => {
        eventForm.classList.add('hidden');
        eventsListSection.classList.remove('hidden');
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
