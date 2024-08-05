document.addEventListener('DOMContentLoaded', () => {
    const adminEventList = document.getElementById('admin-event-list-ul');
    let events = {};

    // Fetch events from local storage
    if (localStorage.getItem('events')) {
        events = JSON.parse(localStorage.getItem('events'));
    }

    function updateAdminEventList() {
        adminEventList.innerHTML = '';
        for (let date in events) {
            events[date].forEach(event => {
                const eventItem = document.createElement('li');
                eventItem.textContent = `${date} - ${event.title} at ${event.time}: ${event.description}`;
                adminEventList.appendChild(eventItem);
            });
        }
    }

    updateAdminEventList();
});
