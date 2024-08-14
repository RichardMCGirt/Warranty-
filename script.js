// Client ID and API key from the Developer Console
const CLIENT_ID = '882687108659-74s2v301ehngkgr30vuqbgq0b96hfuap.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBUC8x9lsVSvNvOSspfk3nlCHL812fg0Kk';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// Airtable API credentials
const AIRTABLE_API_KEY = 'patJrhO2Eme64eA4v.fc14f699da347bf22712bc3833eb29ba384d37dfe36ed08c0aa4dafe283015d8';
const BASE_ID = 'appO21PVRA4Qa087I';
const TABLE_NAME = 'tbl6EeKPsNuEvt5yJ';

let authorizeButton = document.getElementById('authorize_button');
let signoutButton = document.getElementById('signout_button');
let syncButton = document.getElementById('sync_button');
let eventList = document.getElementById('event_list');

function handleClientLoad() {
    console.log("Loading Google API client...");
    gapi.load('client:auth2', initClient);
}

function initClient() {
    console.log("Initializing Google API client...");
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        console.log("Google API client initialized.");
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state immediately when the page loads.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch(function(error) {
        console.error("Error initializing Google API client:", error);
    });
}

function updateSigninStatus(isSignedIn) {
    console.log("Sign-in status changed:", isSignedIn);
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        listUpcomingEvents(); // Fetch events automatically if signed in
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        eventList.innerHTML = '';
        document.getElementById('calendar_events').style.display = 'none';
        syncButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    console.log("Sign-in button clicked.");
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    console.log("Sign-out button clicked.");
    gapi.auth2.getAuthInstance().signOut();
}

function listUpcomingEvents() {
    const calendarIds = [
        'c_45db4e963c3363676038697855d7aacfd1075da441f9308e44714768d4a4f8de@group.calendar.google.com',
        'c_03867438b82e5dfd8d4d3b6096c8eb1c715425fa012054cc95f8dea7ef41c79b@group.calendar.google.com'
    ];

    eventList.innerHTML = ''; // Clear the list before adding new events
    console.log("Fetching events from calendars...");

    calendarIds.forEach(calendarId => {
        gapi.client.calendar.events.list({
            'calendarId': calendarId,
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 900,
            'orderBy': 'startTime'
        }).then(function(response) {
            let events = response.result.items;
            console.log("Events fetched from calendar:", calendarId, events);

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
        }).catch(function(error) {
            console.error("Error fetching events from calendar:", calendarId, error);
        });
    });
}

function syncWithAirtable() {
    console.log("Syncing events with Airtable...");
    let events = Array.from(eventList.children).map(item => item.textContent);
    events.forEach(event => {
        console.log("Syncing event:", event);
        let data = {
            "fields": {
                "Calendar Link": event, // The link to the calendar event
                "Scheduled Service Start Time": event.split('(')[1].split(' ')[0], // Start time (assuming it's in the event text)
                "Scheduled Service End Time": event.split('(')[1].split(' ')[2], // End time (assuming it's in the event text)

                // Additional fields (mock values for now, you'll replace these with actual data from events)
                "Status": "Pending", // Static value or derive from the event
                "Branch": "Main Branch", // Static value or derive from event details
                "Builder": "Builder Name", // If applicable, map from event description or attendees
                "Picture(s) of Issue": ["https://linktoimage.com/image1.jpg"], // Example link, map from event description if available
                "Warranty Period (Days)": "365", // Example value, derive from event details
                "Date Warranty Started": "2024-08-01", // Example date, derive from event
                "Billable/ Non Billable": "Billable", // Example value, derive from event
                "Repair Charge Amount (If Billable)": "100.00", // Example value, derive from event details
                "Billable Reason (If Billable)": "Repair needed", // Example reason, derive from event
                "Warranty Billable Check": true, // Boolean, derive from event
                "Lot Number and Community/Neighborhood": "Lot 42, Example Community", // Derive from event description or other details
                "Homeowner Name": "John Doe", // Map from event description or attendees
                "Street Address": "1234 Elm Street", // Map from event description
                "City": "Some City", // Map from event description
                "State": "CA", // Map from event description
                "Zip Code": "90210", // Map from event description
                "Contact Email": "johndoe@example.com", // Map from event attendees or description
                "Materials Needed": ["Material A", "Material B"], // Derive from event description
                "Material Vendor": "Vendor Name", // Map from event description
                "Vendor PO #1": "PO12345", // Example PO, derive from event
                "Vendor #1 Cost": "250.00", // Example cost, derive from event
                "Secondary Vendor": "Secondary Vendor Name", // Map from event description or attendees
                "Vendor PO #2": "PO54321", // Example PO, derive from event
                "Vendor #2 Cost": "150.00", // Example cost, derive from event
                "Vendor Email": "vendor@example.com", // Map from event description or attendees
                "Vendor Secondary Email": "secondary@example.com", // Map from event description or attendees
                "Vendor Return Email": "return@example.com", // Map from event description or attendees
                "Vendor Secondary Return Email": "secondaryreturn@example.com", // Map from event description or attendees
                "Secondary Vendor Email": "secondaryvendor@example.com", // Map from event description or attendees
                "Secondary Vendor Second Email": "secondsecondary@example.com", // Map from event description or attendees
                "Secondary Vendor Return Email": "secondaryreturn@example.com" // Map from event description or attendees
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
            console.log('Airtable sync success:', data);
        }).catch((error) => {
            console.error('Airtable sync error:', error);
        });
    });
}

handleClientLoad();
