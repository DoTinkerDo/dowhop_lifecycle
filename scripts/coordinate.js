'use strict';

// Use code to coordinate DoWhops.
var currentSessionID;
var doerUserObjects = [];
var creatorUserObjects = [];
var currentDate = new Date();

var datePicker = new flatpickr('#whenDateTimePending', {
  minDate: currentDate.setDate(currentDate.getDate() - 1),
  enableTime: true,
  altInput: true,
  dateFormat: 'Y-m-d H:i'
});

function getSesh(clickedID) {
  setLandingTab(clickedID); // New.
  console.log('running getSesh...');
  FriendlyChat.prototype.getSession();
}

FriendlyChat.prototype.getSessionTab = function() {
  // To-Do: Refactor like so.
  var userID = person.uid;
  var sessionRef = database.ref('/session').child(userID);
  var currentTab;
  // sessionRef.on('value', function(snap) {
  //   currentTab = snap.val();
  // });
  sessionRef.once('value').then(function(snap) {
    currentTab = snap.val();
  });
  return currentTab;
};

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.adminDiv = document.getElementById('admin-input-form'); // Check.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit-message-button');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  // this.signInSnackbar = document.getElementById('must-signin-snackbar');
  this.messageFormWhenDateTimePending = document.getElementById('whenDateTimePending');
  this.messageFormWherePending = document.getElementById('whereAddressPending');

  // Shortcuts to DOM elements for notification messages:
  this.approvalForm = document.getElementById('approve-pending-form');
  this.rescindingForm = document.getElementById('rescind-pending-form');
  this.pendingDiv = document.getElementById('pending-div');

  this.submitApprovalActionBtn = document.getElementById('send-approval-button');
  this.submitDenialActionBtn = document.getElementById('send-denial-button');
  this.submitRescind = document.getElementById('submit-rescind-button');

  // Load chat data:
  this.chatItemData = document.getElementById('coordinate-tab');
  this.chatItemData.addEventListener('click', this.loadMessages.bind(this)); // <-- Developer: return to this.
  // Save message on form submit:
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));

  // Toggle for the button:
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for time-change-approval buttons:
  this.submitApprovalActionBtn.addEventListener('click', this.sendApprovalAction.bind(this));
  this.submitDenialActionBtn.addEventListener('click', this.sendDenialAction.bind(this));

  this.submitRescind.addEventListener('click', this.sendRescind.bind(this));

  // Events for image upload:
  this.submitImageButton.addEventListener(
    'click',
    function(e) {
      e.preventDefault();
      this.mediaCapture.click();
    }.bind(this)
  );
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth:
FriendlyChat.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

FriendlyChat.prototype.checkForAdmin = function() {
  var adminDiv = document.getElementById('admin-input-form');
};

FriendlyChat.prototype.sendApprovalAction = function(e) {
  e.preventDefault();
  console.log('you clicked send approval!');
  var choice, newDateTime, newWhere, status;
  
  this.chatItemDataSpecific = document.getElementById('dowhop-selector-container').children[0].id;
  var myRef = this.database.ref().child('DoWhopDescriptions').child(this.chatItemDataSpecific);
  var myRefPending = this.database.ref().child('DoWhopDescriptions/' + this.chatItemDataSpecific + '/pending');
  var messagesRef = this.database.ref().child('messages/' + this.chatItemDataSpecific);
  var approvalForm = document.getElementById('approve-pending-form');
  var rescindingForm = document.getElementById('rescind-pending-form');
  var pendingDiv = document.getElementById('pending-div');

  // Updating these checks to make it more modular... (ie, avoid over-writing!).
  myRef.once('value').then(function(snap) {
    if (snap.val().pending.whenDateTimePending) {
      newDateTime = snap.val().pending.whenDateTimePending;
      myRef.update({
        whenDateTime: newDateTime || 'tbd'
      });
    }
    if (snap.val().pending.whereAddressPending) {
      newWhere = snap.val().pending.whereAddressPending;
      myRef.update({
        whereAddress: newWhere || 'tbd'
      });
    }
  });
  // .then(function() {
  //   myRef.update({
  //     whenDateTime: newDateTime || 'tbd',
  //     whereAddress: newWhere || 'tbd'
  //   });
  // })();

  status = 'approved';

  // if (newDateTime != null) {
  // myRef.update({
  //   whenDateTime: newDateTime || 'tbd',
  //   whereAddress: newWhere || 'tbd'
  // });
  // }
  // if (newTime != null) {
  //   myRef.update({ whenTime: newTime });
  // }
  // if (newWhere != null) {
  // myRef.update({ whereAddress: newWhere });
  // }

  this.database
    .ref()
    .child('DoWhopDescriptions/' + this.chatItemDataSpecific + '/pending/')
    .update({
      status: status
    })
    .then(approvalForm.reset());

  messagesRef.push({
    chatId: this.chatItemDataSpecific,
    name: '',
    text: person.displayName + ' has ' + status + ' the request.',
    photoUrl: '../images/searching-a-person.png'
  });

  // Notify the user of a change here:
  window.alert('You have approved of the change request!');

  // Clear the leftover pending object data:
  myRefPending.remove();

  // Add UI reset information here:
  approvalForm.setAttribute('hidden', 'true');
  rescindingForm.setAttribute('hidden', 'true');
  pendingDiv.innerHTML = '';
  pendingDiv.setAttribute('hidden', 'true');
};

FriendlyChat.prototype.sendDenialAction = function(e) {
  e.preventDefault();
  console.log('you clicked send denial!');
  var choice, newDate, newTime, newWhere;
  this.chatItemDataSpecific = document.getElementById('dowhop-selector-container').children[0].id;
  var myRef = this.database.ref().child('DoWhopDescriptions').child(this.chatItemDataSpecific);
  var myRefPending = this.database.ref().child('DoWhopDescriptions/' + this.chatItemDataSpecific + '/pending');
  var messagesRef = this.database.ref().child('messages/' + this.chatItemDataSpecific);
  var status;
  var approvalForm = document.getElementById('approve-pending-form');
  var rescindingForm = document.getElementById('rescind-pending-form');
  var pendingDiv = document.getElementById('pending-div');

  // Updating these checks to make it more modular... (ie, avoid over-writing!).
  myRefPending.once('value', function(snap) {
    if (snap.val().whenDatePending) {
      newDate = snap.val().whenDatePending;
    }

    if (snap.val().whereAddressPending) {
      newWhere = snap.val().whereAddressPending;
    }
  });

  status = 'denied';
  this.database
    .ref()
    .child('DoWhopDescriptions/' + this.chatItemDataSpecific + '/pending/')
    .update({
      status: status
    })
    .then(approvalForm.reset());

  messagesRef.push({
    chatId: this.chatItemDataSpecific,
    name: '',
    text: person.displayName + ' has ' + status + ' the request.',
    photoUrl: '../images/searching-a-person.png'
  });

  // Notify the user of a change here:
  window.alert('You have denied the change request.');

  // Clear the leftover pending object data:
  myRefPending.remove();

  // Add UI reset information here:
  approvalForm.setAttribute('hidden', 'true');
  rescindingForm.setAttribute('hidden', 'true');
  pendingDiv.innerHTML = '';
  pendingDiv.setAttribute('hidden', 'true');
};

FriendlyChat.prototype.sendRescind = function(e) {
  e.preventDefault();
  this.chatItemDataSpecific = document.getElementById('dowhop-selector-container').children[0].id; // <-- Refactor
  this.database.ref().child('DoWhopDescriptions/' + this.chatItemDataSpecific + '/pending/').remove();
  // Send a notification to the user:
  window.alert('You have rescinded!');
  // Add UI reset information here:
  this.approvalForm.setAttribute('hidden', 'true');
  this.rescindingForm.setAttribute('hidden', 'true');
  this.pendingDiv.innerHTML = ''; // Return.
  this.pendingDiv.setAttribute('hidden', 'true');
};

// Add dynamic 'When' form:
// FriendlyChat.prototype.showDateTimeInputs = function() {};

FriendlyChat.prototype.removeChats = function() {
  messageList = document.getElementById('messages');
  this.messageList.innerHTML = '';
};

FriendlyChat.prototype.getSession = function() {
  // I. Link to db where we want to listen.
  var user = person;
  var userID = person.uid;
  var currentDoWhopID;
  var currentTabID;
  // var mySessionRef = firebase.database().ref('session/' + userID);
  var messagesRef = firebase.database().ref().child('messages/');
  var sessionRef = database.ref('/session').child(userID);

  // II. Grabbing relevant DOM elements for UI.

  // A) DoWhop Selector
  var doWhopSelector = document.getElementById('dowhop-selector-container');

  // B) Pending notifications
  var approvalForm = document.getElementById('approve-pending-form');
  var rescindingForm = document.getElementById('rescind-pending-form');
  var pendingDiv = document.getElementById('pending-div');

  // C) Chat Messages
  var messageList = document.getElementById('messages');
  var messageInput = document.getElementById('message');

  // All cases, check which item we're currently on:
  sessionRef.on('value', function(snap) {
    currentDoWhopID = snap.val().current_dowhop;
    currentTabID = snap.val().current_tab;
  });
  // console.log("current location:", currentDoWhopID, '---', currentTabID); // <-- Debugging.

  // All cases, we load pending div forms for current session:
  var checkForPendings = function(data) {
    // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var requesterName = 'Someone'; // NOTE: just in case we are looking at old data.

    if (data.pending && data.pending.requesterName) {
      requesterName = data.pending.requesterName;
    }
    var pendingNotification = requesterName + ' has requested to meet!\n';

    // Check if there are pending data:
    if (data && data.pending != null && data.pending.status != 'approved' && data.pending.status != 'denied') {
      // console.log('pending status true. showing pending div.');
      // NEW: Default status is that the creator of the event changes their own info (so we still show it at top):
      if (data.pending.whenDateTimePending) {
        pendingNotification +=
          'on ' +
          moment(data.pending.whenDateTimePending).format('dddd MMMM D, YYYY') +
          ' at ' +
          moment(data.pending.whenDateTimePending).format('hh:mmA') +
          '\n';
      }
      if (data.pending.whereAddressPending) pendingNotification += '\n' + data.pending.whereAddressPending;

      document.getElementById('pending-div').removeAttribute('hidden');
      document.getElementById('pending-div').innerText = pendingNotification;
      // This means visiting user is the creator of event:
      if (firebase.auth().currentUser.email == data.creatorDescription) {
        // console.log('visiting user is the creator. showing approval form, hiding rescind form.');
        document.getElementById('pending-div').innerText = pendingNotification;
        document.getElementById('approve-pending-form').removeAttribute('hidden');
        document.getElementById('rescind-pending-form').setAttribute('hidden', 'true');

        // This means visiting user is a requestor of event change:
      } else if (firebase.auth().currentUser.uid == data.pending.requester) {
        // console.log('visiting user requested a change. showing rescinding form, hiding approval form.'
        document.getElementById('pending-div').innerText = pendingNotification;
        document.getElementById('rescind-pending-form').removeAttribute('hidden');
        document.getElementById('approve-pending-form').setAttribute('hidden', 'true');
      }
      // All other cases:
    } else {
      // console.log('this means it has passed over logic tests.');
      document.getElementById('approve-pending-form').setAttribute('hidden', 'true');
      document.getElementById('pending-div').innerText = '';
      document.getElementById('approve-pending-form').setAttribute('hidden', 'true');
      document.getElementById('rescind-pending-form').setAttribute('hidden', 'true');
    }
  };

  sessionRef.on('value', function(data) {
    var doWhopSelectorDiv = '';
    // Setting the header and check for pendings for the current DoWhop session:
    // Checking for changed pendings in real-time:
    firebase
      .database()
      .ref()
      .child('DoWhopDescriptions/' + data.val().current_dowhop)
      .on('child_changed', function(data) {
        checkForPendings(data.val());
      });

    // Executing functions that are triggered by clicking on a selector block:
    firebase.database().ref().child('DoWhopDescriptions/' + data.val().current_dowhop).on('value', function(data) {
      // Check for pending notifications:
      checkForPendings(data.val());

      // Weave together header
      if (data.val()) {
        var imageUrl =
          (data.val().downloadURL && data.val().downloadURL.image1) ||
          data.val().downloadURL ||
          defaultDoWhopDescriptionImage;

        var doWhopDescriptionTitle = data.val().titleDescription || 'Your DoWhops Will Appear Here';

        // Adding these logic checks so that when users update their information, new times, dates, etc render in 'View':
        var renderWhenInformation = data.val().whenDescription;
        var renderWhereInformation = data.val().whereDescription;
        var renderWhoDescription = data.val().whoDescription;
        var whoInformation = data.val().doerDescription; // In progress:  Update with first names dynamically.
        var renderCreatorIcon = '';
        var renderDoerIcons = '';
        var appUsersRef = database.ref('app_users');
        var doerEmails = whoInformation.split(', ');
        var creatorEmail = data.val().creatorDescription;

        appUsersRef
          .once('value')
          .then(function(snap) {
            doerUserObjects.length = 0; // Resetting the global variable.
            creatorUserObjects.length = 0;
            snap.forEach(function(childSnap) {
              // console.log('Checking childSnaps...');
              // console.log(doerEmails);
              doerEmails.filter(function(doerEmail) {
                if (doerEmail === childSnap.val().email) {
                  // console.log('it matches!');
                  // console.log(childSnap.val());
                  doerUserObjects.push(childSnap.val());
                }
              });
              if (creatorEmail === childSnap.val().email) {
                creatorUserObjects.push(childSnap.val());
              }
            });
          })
          .then(
            (function() {
              if (creatorUserObjects && creatorUserObjects.length > 0) {
                _.map(creatorUserObjects, function(userObject) {
                  renderCreatorIcon +=
                    '<div class="user-avatar-container">' +
                    "<a href='/profile.html?" +
                    userObject.uid +
                    "'>" +
                    "<div class='user-avatar'>" +
                    "<img src='" +
                    userObject.photoURL +
                    "'>" +
                    '</img>' +
                    '</div>' +
                    '<div class="user-handle">' +
                    userObject.displayName +
                    '</div>' +
                    '</a>' +
                    '</div>';
                });
                // Adding a closing segment that will separate Creators from Doers in View:
                renderCreatorIcon +=
                  '<div class="user-avatar-container user-avatar-separator">' + 'will meet' + '</div>';
              }

              if (doerUserObjects && doerUserObjects.length > 0) {
                _.map(doerUserObjects, function(userObject) {
                  renderCreatorIcon +=
                    '<div class="user-avatar-container">' +
                    "<a href='/profile.html?" +
                    userObject.uid +
                    "'>" +
                    "<div class='user-avatar'>" +
                    "<img class='user-avatar' src='" +
                    userObject.photoURL +
                    "'>" +
                    '</img>' +
                    '</div>' +
                    '<div class="user-handle">' +
                    userObject.displayName +
                    '</div>' +
                    '</a>' +
                    '</div>';
                });
              }
            })()
          );
        // console.log('final results....', doerUserObjects, creatorUserObjects);
        if (data.val().whereAddress && data.val().whereAddress != 'By request') {
          renderWhereInformation = data.val().whereAddress;
        }

        if (
          data.val().whenDate &&
          data.val().whenDate != 'By request' &&
          data.val().whenTime &&
          data.val().whenTime != 'By request'
        ) {
          renderWhenInformation =
            moment(data.val().whenDate).format('dddd MMMM D, YYYY') +
            ' at: ' +
            moment(data.val().whenDate).format('h:mmA');
        } else if (data.val().whenDate || data.val().whenTime) {
          renderWhenInformation =
            moment(data.val().whenDate).format('dddd MMMM D, YYYY') +
            ' at: ' +
            moment(data.val().whenDate).format('h:mmA');
        }

        return (doWhopSelectorDiv +=
          "<section id='" +
          data.key +
          "' class='dowhop-selector-block' onclick='setSession(this)''>" +
          "<div class='dowhop-selector-header-top' style='background-image: url(" +
          imageUrl +
          ");'>" +
          '<h1>' +
          doWhopDescriptionTitle +
          '</h1>' +
          '</div>' +
          '<div id="selector-body" class="mdl-layout__content dowhop-selector-body">' +
          '<div class="mdl-card__title">' +
          '<h1 class="mdl-card__title-text">' +
          doWhopDescriptionTitle +
          ' Description' +
          '</h1>' +
          '</div>' +
          '<div class=" user-avatar-section">' +
          renderCreatorIcon +
          renderDoerIcons +
          '</div>' +
          '<div class="mdl-card__supporting-text">' +
          '<h4>Why?</h4>' +
          '<p>' +
          data.val().whyDescription +
          '</p>' +
          '<h4>Who?</h4>' +
          '<p>' +
          renderWhoDescription +
          '</p>' +
          '<h4>What?</h4>' +
          '<p>' +
          data.val().whatDescription +
          '</p>' +
          '<h4>When?</h4>' +
          '<p>' +
          renderWhenInformation +
          '</p>' +
          '<h4>Where?</h4>' +
          '<p>' +
          renderWhereInformation +
          '</p>' +
          '<h4>How much?</h4>' +
          '<p>' +
          data.val().howMuchDescription +
          '</p>' +
          '</div>' +
          '</div>' +
          '</section>');
      }
    });
    doWhopSelector.innerHTML = doWhopSelectorDiv;
  });

  // We only load messages if current tab is clicked:
  if (currentTabID === 'coordinate-tab') {
    document.getElementById('messages-card').removeAttribute('hidden');
    document.getElementById('selector-body').setAttribute('hidden', 'true');

    FriendlyChat.prototype.loadMessages();
  } else if (currentTabID === 'edit-tab') {
    // We only load edit form if edit tab is clicked:
    document.getElementById('messages-card').setAttribute('hidden', 'true');
    document.getElementById('selector-body') && document.getElementById('selector-body').removeAttribute('hidden');
    showEditForm(doWhopSelector.firstChild);
    fillInEditForm(doWhopSelector.firstChild);
  } else if (currentTabID === 'review-tab') {
    // TO-DO: Good to clear all unwanted UI elements if nothing's chosen.
    document.getElementById('messages-card').setAttribute('hidden', 'true');
    document.getElementById('selector-body').setAttribute('hidden', 'true');
  } else {
    document.getElementById('messages-card').setAttribute('hidden', 'true');
    document.getElementById('selector-body') && document.getElementById('selector-body').setAttribute('hidden', 'true');
  }
};

function generateUserIcon(userObjectsArray) {}

// Loads messages history and listens for upcoming ones:
FriendlyChat.prototype.loadMessages = function() {
  var user = person.uid;
  var messageList = document.getElementById('messages');
  var chatIdCurrent;
  var sessionRef = firebase.database().ref('/session').child(person.uid).child('current_dowhop');
  sessionRef.on('value', function(snap) {
    return (chatIdCurrent = snap.val());
  });
  this.messagesRef = firebase.database().ref().child('messages/' + chatIdCurrent);

  // Make sure we remove all previous listeners and clear the UI.
  this.messagesRef.off();
  messageList.innerText = '';

  // Loads the last x number of messages and listen for new ones:
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl, val.senderId);
  }.bind(this);
  this.messagesRef.orderByKey().on('child_added', setMessage);
  this.messagesRef.orderByKey().on('child_changed', setMessage); // TIP: To restrict number of messages, include .limitToLast(X) in db query.
};

// Saves a new message on the Firebase DB:
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();

  // Mke sure this chat and message get sent to two appropriate places:
  var currentDoWhopID;
  var userID = person.uid;
  var sessionRef = firebase.database().ref('/session').child(userID);
  sessionRef.on('value', function(snap) {
    currentDoWhopID = snap.val().current_dowhop;
    // currentTabID = snap.val().current_tab;
  });

  // Nesting the message content under chat-id node headings:
  var messagesChatsRef = database.ref().child('messages').child(currentDoWhopID);
  var currentUser = person;
  var whenDatePending = this.whenDatePending;
  var whereAddressPending = this.messageFormWherePending;

  // For only all three attributes: Time, Date, Where:

  if (this.messageFormWhenDateTimePending.value || this.messageFormWherePending.value) {
    var chatsRef = this.database.ref().child('DoWhopDescriptions/' + currentDoWhopID + '/pending/');

    var messageText = '';

    messageText += currentUser.displayName + ' has requested to meet!\n';
    if (this.messageFormWherePending.value) messageText += this.messageFormWherePending.value;
    if (this.messageFormWhenDateTimePending.value) {

      messageText +=
        '\non ' +
        datePicker.formatDate(new Date(datePicker.selectedDates), 'l F j, Y') +
        ' at ' +
        datePicker.formatDate(new Date(datePicker.selectedDates), 'h:iK') +
        '\n';
    }
    // if (this.messageFormWhenDatePending.value) messageText += this.messageFormWhenDatePending.value + '\n';

    messagesChatsRef.push({
      chatId: currentDoWhopID,
      senderId: currentUser.uid, // We need this in order to interact with users objects.
      name: currentUser.displayName,
      text: messageText,
      photoUrl: '/images/placeholder-image1.jpg'
    });

    chatsRef.update({ status: true, requester: currentUser.uid, requesterName: currentUser.displayName }); // Refactoring to make it a dis-aggregated update.
    if (this.messageFormWhenDateTimePending.value)
      chatsRef.update({ whenDateTimePending: this.messageFormWhenDateTimePending.value }).then(this.resetDateTime);
    if (this.messageFormWherePending.value)
      chatsRef.update({ whereAddressPending: this.messageFormWherePending.value }).then(this.resetWhere);
    this.resetDateTimeWhere; // Catch-all.
  }

  // We'll only save the message if the length isn't an empty string...
  if (this.messageInput.value.length > 0) {
    messagesChatsRef
      .push({
        chatId: currentDoWhopID,
        senderId: currentUser.uid,
        name: currentUser.displayName,
        text: this.messageInput.value,
        photoUrl: currentUser.photoURL || '/images/user-icon.png' // Check.
      })
      .then(
        function() {
          document.getElementById('message').value = ''; //  Clearing text field last because it would erase above otherwise.
          this.resetDateTimeWhere; // Catch-all.
        }.bind(this)
      )
      .catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
      });
    this.resetDateTimeWhere; // Check.
  }
};


FriendlyChat.prototype.resetDateTime = function() {
  document.getElementById('when-date-time-pending-hidden').setAttribute('hidden', 'true');
  var dateTimePending = document.getElementById('whenDateTimePending');
  dateTimePending.value = null;
  dateTimePending.placeholder = 'Select to enter date and time';
};

FriendlyChat.prototype.resetWhere = function() {
  document.getElementById('whereAddressPending').value = null;
};

FriendlyChat.prototype.resetDateTimeWhere = function() {
  var dateTimePending = document.getElementById('whenDateTimePending');
  dateTimePending.value = null;
  dateTimePending.placeholder = 'Select to enter date and time';

  document.getElementById('whereAddressPending').value = null;
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    firebase.storage().refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    window.alert('You can only share images. Please try again.');
    return;
  }
  // Check if the user is signed-in
  // We add a message with a loading icon that will get updated with the shared image.
  var currentUser = person;
  this.messagesRef
    .push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/user-icon.png'
    })
    .then(
      function(data) {
        // Upload the image to Cloud Storage.
        var filePath = 'userImages/' + currentUser.uid + '/' + 'messageImages/' + data.key + '/' + file.name;
        return this.storage.ref(filePath).put(file).then(
          function(snapshot) {
            // Get the file's Storage URI and update the chat message placeholder.
            var fullPath = snapshot.metadata.fullPath;
            return data.update({ imageUrl: this.storage.ref(fullPath).toString() });
          }.bind(this)
        );
      }.bind(this)
    )
    .catch(function(error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });
  this.resetDateTimeWhere; // Check.
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat and resets views:
FriendlyChat.prototype.signOut = function() {
  // this.removeChats();
  this.pendingDiv.setAttribute('hidden', 'true');
  this.approvalForm.setAttribute('hidden', 'true');
  this.rescindingForm.setAttribute('hidden', 'true');
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.

// auth.onAuthStateChanged(function(user) {
//   if (user) {
//     // Create userData objec and set uid
//     readUserData(user);
//
//     // Using user session object in Firebase to find currentDoWhop
//     var messageList = document.getElementById('messages')// this.messageList;
//     var messageInput = document.getElementById('message')// this.messageInput;
//     var loadMessagesOnClick = function(id) {
//
//         console.log('you chose', id);
//         var messagesRef = this.database.ref().child('messages/' + id);
//
//         // Make sure we remove all previous listeners and clear the UI.
//         messagesRef.off();
//         messageList.innerText = '';
//         // Loads the last x number of messages and listen for new ones:
//         var setMessage = function(data) {
//           var val = data.val();
//           displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
//         }.bind(this);
//         messagesRef.orderByKey().limitToLast(12).on('child_added', setMessage);
//         messagesRef.orderByKey().limitToLast(12).on('child_changed', setMessage);
//         // end new.
//     };
//
//     var sessionRef = database.ref('/session').child(user.uid).child('current_dowhop');
//     sessionRef.on('value', function(snapshot) {
//       selectedDoWhopKey = snapshot.val();
//
//       // LOAD messages
//       loadMessagesOnClick(snapshot.val());
//
//     });
//   }
// });

FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) {
    // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;
    // this.checkForAdmin();
    // Add event listener for event session changes:
    // this.getSession(currentSessionID);
    // We save the Firebase Messaging Device token and enable notifications.
    // this.saveMessagingDeviceToken();
  } else {
    // User is signed out!
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  if (person) {
    return true;
  }
  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first, please!',
    timeout: 2000
  };
  // this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves the messaging device token to the datastore.
FriendlyChat.prototype.saveMessagingDeviceToken = function() {
  firebase
    .messaging()
    .getToken()
    .then(
      function(currentToken) {
        if (currentToken) {
          // Saving the Device Token to the datastore.
          firebase.database().ref('/fcmTokens').child(currentToken).set(firebase.auth().currentUser.uid);
        } else {
          // Need to request permissions to show notifications.
          this.requestNotificationsPermissions();
        }
      }.bind(this)
    )
    .catch(function(error) {
      console.error('Unable to get messaging token.', error);
    });
};

// Requests permissions to show notifications.
FriendlyChat.prototype.requestNotificationsPermissions = function() {
  firebase
    .messaging()
    .requestPermission()
    .then(
      function() {
        // Notification permission granted.
        this.saveMessagingDeviceToken();
      }.bind(this)
    )
    .catch(function(error) {
      console.error('Unable to get permission to notify.', error);
    });
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  if (element.parentNode.MaterialTextfield) {
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
  }
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<a class="spacing"><div class="pic"></div></a>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  '</div>';

// Templates for Chats:
FriendlyChat.CHAT_TEMPLATE =
  '<button type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect dowhop-button">' +
  '</button>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Tempalte for approval-denial of time-change form:
FriendlyChat.APPROVAL_TEMPLATE =
  '<div class="pending-style">' +
  '<div>' +
  '<button type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect dowhop-button">' +
  '</button>' +
  '</div>' +
  '</div>';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri, senderId) {
  var messageList = document.getElementById('messages');
  var messageInput = document.getElementById('message');
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    container.firstChild.firstChild.setAttribute('href', '/profile.html?' + senderId); // Check routes.
    div.setAttribute('id', key);
    messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) {
    // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) {
    // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener(
      'load',
      function() {
        messageList.scrollTop = messageList.scrollHeight;
      }.bind(this)
    );
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in.
  setTimeout(function() {
    div.classList.add('visible');
  }, 1);
  messageList.scrollTop = messageList.scrollHeight;
  messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert(
      'You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.'
    );
  } else if (config.storageBucket === '') {
    window.alert(
      'Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.'
    );
  }
};

window.onload = function() {
  window.friendlyChat = new FriendlyChat();
};
