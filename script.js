function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }
  
  function initClient() {
    gapi.client.init({
      apiKey: 'AIzaSyDtA526gymCrlVgsvNtrA9O375djwOzvPc',
      clientId: '1094517026467-3rru8ro2el9kipr88hv8nmmdb56anano.apps.googleusercontent.com',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      scope: "https://www.googleapis.com/auth/calendar"
    }).then(function () {
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    }, function(error) {
      console.error(JSON.stringify(error, null, 2));
    });
  }
  
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      createEvent();
    } else {
      // Show the sign-in button if not signed in
      document.getElementById('signInButton').style.display = 'block';
    }
  }
  
  function handleSignInClick() {
    gapi.auth2.getAuthInstance().signIn();
  }
  
  function handleSignOutClick() {
    gapi.auth2.getAuthInstance().signOut();
  }
  
  function createEvent() {
    var calendarId = 'c_d113e252e0e5c8cfbf17a13149707a30d3c0fbeeff1baaac7a46940c2cc448ca@group.calendar.google.com'; // Replace this with your specific calendar ID
    
    var event = {
      'summary': 'Meeting with Client',
      'location': '123 Main St',
      'description': 'Discussing project requirements.',
      'start': {
        'dateTime': '2024-08-14T10:00:00-07:00',
        'timeZone': 'America/Los_Angeles',
      },
      'end': {
        'dateTime': '2024-08-14T11:00:00-07:00',
        'timeZone': 'America/Los_Angeles',
      },
      'attendees': [
        {'email': 'client@example.com'},
      ],
    };
  
    var request = gapi.client.calendar.events.insert({
      'calendarId': calendarId,
      'resource': event
    });
  
    request.execute(function(event) {
      if (event.error) {
        console.error('Error creating event:', event.error.message);
      } else {
        console.log('Event created: ' + event.htmlLink);
      }
    });
  }
  