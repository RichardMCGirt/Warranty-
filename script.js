// Client ID and API key from the Developer Console
const CLIENT_ID = '882687108659-74s2v301ehngkgr30vuqbgq0b96hfuap.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBUC8x9lsVSvNvOSspfk3nlCHL812fg0Kk';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// Airtable API credentials
const AIRTABLE_API_KEY = 'YOUR_AIRTABLE_API_KEY';
const BASE_ID = 'YOUR_BASE_ID';
const TABLE_NAME = 'YOUR_TABLE_NAME';

let authorizeButton = document.getElementById('authorize_button');
let signoutButton = document.getElementById('signout_button');
let syncButton = document.getElementById('sync_button');
let eventList = document.getElementById('event_list');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
        syncButton.onclick = syncWithAirtable;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        listUpcomingEvents();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        eventList.innerHTML = '';
        document.getElementById('calendar_events').style.display = 'none';
        syncButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function listUpcomingEvents() {
    const calendarIds = [
        'c_45db4e963c3363676038697855d7aacfd1075da441f9308e44714768d4a4f8de@group.calendar.google.com',
        'c_03867438b82e5dfd8d4d3b6096c8eb1c715425fa012054cc95f8dea7ef41c79b@group.calendar.google.com'
    ];

    eventList.innerHTML = ''; // Clear the list before adding new events

    calendarIds.forEach(calendarId => {
        gapi.client.calendar.events.list({
            'calendarId': calendarId,
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        }).then(function(response) {
            let events = response.result.items;

            if (events.length > 0) {
                document.getElementById('calendar_events').style.display = 'block';
                syncButton.style.display = 'block';

                events.forEach(event => {
                    let li = document.createElement('li');
                    li.textContent = `${event.summary} (${event.start.dateTime || event.start.date})`;
                    eventList.appendChild(li);
                });
            } else {
                let li = document.createElement('li');
                li.textContent = 'No upcoming events found for this calendar.';
                eventList.appendChild(li);
            }
        });
    });
}



function syncWithAirtable() {
    let events = Array.from(eventList.children).map(item => item.textContent);
    events.forEach(event => {
        let data = {
            "fields": {
                "Calendar Link": event, // Example of how you might link the event name to your Airtable field
                "Scheduled Service Start Time": event.split('(')[1].split(' ')[0], // Example of mapping start time
                "Scheduled Service End Time": event.split('(')[1].split(' ')[2] // Example of mapping end time
                // Map other fields as needed
            }
        };

        fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        }).catch((error) => {
            console.error('Error:', error);
        });
    });
}

// Load the API client and auth2 library
handleClientLoad();
