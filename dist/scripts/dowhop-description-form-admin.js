'use strict';

var doWhopDescriptionsRef = database.ref('/DoWhopDescriptions');

var titleDescription = document.getElementById('title-description');
var whyDescription = document.getElementById('why-description');
var whoDescription = document.getElementById('who-description');
var whatDescription = document.getElementById('what-description');
var whenDescription = document.getElementById('when-description');
var whereDescription = document.getElementById('where-description');
var howMuchDescription = document.getElementById('how-much-description');

var creatorDescription = document.getElementById('creator-description');
var doerDescription = document.getElementById('doer-description');

var dowhopImageCapture1 = document.getElementById('dowhop-image-capture1');
var dowhopImageCapture2 = document.getElementById('dowhop-image-capture2');
var dowhopImageCapture3 = document.getElementById('dowhop-image-capture3');

var adminEditDoWhopForm = document.getElementById('admin-edit-dowhop-form');
var selectedForEdit = document.getElementById('selected-for-edit');
var creatorDescriptionUpdate = document.getElementById('creator-description-email-update');
var doerDescriptionUpdate = document.getElementById('doer-description-email-update');

var error = document.getElementById('errorAdmin');

var doWhopPlacard = document.getElementById('dowhop-placard');

var submitNewDoWhopBtn = document.getElementById('create-new-dowhop');
var emailSubmitBtn = document.getElementById('emailSubmit');

submitNewDoWhopBtn.addEventListener('click', submitNewDoWhopEntry);
emailSubmitBtn.addEventListener('click', updateCreatorDoerEmails);


function submitNewDoWhopEntry(e) {
  e.preventDefault();

  validateAddDoWhopDescription(
    files,
    titleDescription.value,
    whyDescription.value,
    whoDescription.value,
    whatDescription.value,
    whenDescription.value,
    whereDescription.value,
    howMuchDescription.value
  );

  var uid = auth.currentUser.uid;
  var doWhopDescriptionKey = doWhopDescriptionsRef.push().key;
  var defaultImageURL = '../images/dowhopicon.gif';
  var creatorDisplayName = auth.currentUser.displayName;

  // We are preparing a first message to the future chat thread:
  function createWelcomingMessage() {
    console.log('creating welcoming msg');
    // Gathering the appropriate data to fill out message:
    var DoWhopTitleDescription, DoWhopWhenDescription, DoWhopWhereDescription;

    doWhopDescriptionsRef.child(doWhopDescriptionKey).once('value').then(function(snap) {
      DoWhopTitleDescription = snap.val().titleDescription;
      DoWhopWhenDescription = snap.val().whenDescription;
      DoWhopWhereDescription = snap.val().whereDescription;
    });

    var teamName = 'Your DoWhop Team';
    var welcomeMessageText =
      'Welcome to your ' +
      DoWhopTitleDescription +
      ' DoWhop!\n\n' +
      'Currently, ' +
      creatorDisplayName +
      ' plans to meet "' +
      DoWhopWhenDescription +
      '" at "' +
      DoWhopWhereDescription +
      '".\n' +
      'Coordinate the details here!';

    var messagesChatsRef = database.ref('messages').child(doWhopDescriptionKey);
    messagesChatsRef.push({
      chatId: doWhopDescriptionKey,
      name: teamName,
      text: welcomeMessageText,
      photoUrl: defaultImageURL
    });
  }

  doWhopDescriptionsRef
    .child(doWhopDescriptionKey)
    .set({
      createdBy: uid,
      doWhopDescriptionKey: doWhopDescriptionKey,
      titleDescription: titleDescription.value,
      whyDescription: whyDescription.value,
      whoDescription: whoDescription.value,
      whatDescription: whatDescription.value,
      whenDescription: whenDescription.value,
      whereDescription: whereDescription.value,
      howMuchDescription: howMuchDescription.value,
      creatorDescription: creatorDescription.value.toLowerCase(),
      doerDescription: doerDescription.value.toLowerCase()
    })
    .then(showConfirmationMessage());

  files.forEach(function(file, idx) {
    var filePath = 'userImages/' + uid + '/' + 'titleDescriptionImage/' + doWhopDescriptionKey + '/' + file.name;
    storage.ref(filePath).put(file).then(function(snapshot) {
      var path = snapshot.metadata.fullPath;
      storage.ref(path).getDownloadURL().then(function(url) {
        var obj = {};
        obj['image' + (idx + 1)] = url;
        doWhopDescriptionsRef.child(doWhopDescriptionKey).child('downloadURL').update(obj);
      });
    });
  });
  createWelcomingMessage();
  clearNewDoWhopEntryForm();
}

var files = [];
function addDoWhopImage(files_arr, node) {
  if (!files_arr[0].type.match('image/.*')) {
    alert('You can only add images at the moment.');
    return;
  }
  node.parentNode.style.color = '#ec1928';
  return files.push(files_arr[0]);
}

function validateAddDoWhopDescription(
  files,
  titleDescription,
  whyDescription,
  whoDescription,
  whatDescription,
  whenDescription,
  whereDescription,
  howMuchDescription
) {
  if (
    titleDescription === '' ||
    whyDescription === '' ||
    whoDescription === '' ||
    whatDescription === '' ||
    whenDescription === '' ||
    whereDescription === '' ||
    howMuchDescription === '' ||
    files.length < 1
  )
    return false;
  return true;
}

function clearNewDoWhopEntryForm() {
  files = [];
  titleDescription.value = '';
  whyDescription.value = '';
  whoDescription.value = '';
  whatDescription.value = '';
  whenDescription.value = '';
  whereDescription.value = '';
  howMuchDescription.value = '';
  dowhopImageCapture1.value = '';
  dowhopImageCapture2.value = '';
  dowhopImageCapture3.value = '';
  dowhopImageCapture1.parentElement.style.color = '#757575';
  dowhopImageCapture2.parentElement.style.color = '#757575';
  dowhopImageCapture3.parentElement.style.color = '#757575';
  creatorDescription.value = '';
  doerDescription.value = '';
}

function registerDoWhopDescriptionCallback() {
  doWhopDescriptionsRef.once('value').then(function(snapshot) {
    var doWhopDescriptions = _.map(snapshot.val()).reverse();
    var div = document.createElement('div');
    doWhopPlacard.innerHTML = '';
    doWhopDescriptions.forEach(function(doWhopDescription) {
      var imageURL =
        (doWhopDescription.downloadURL && doWhopDescription.downloadURL.image1) || doWhopDescription.downloadURL;

      div.innerHTML +=
        '<aside  class="mdl-card dowhop-selector" id="' +
        doWhopDescription.doWhopDescriptionKey +
        '">' +
        '<div class="">' + "<h2>" + doWhopDescription.titleDescription + "</h2>"
        // '<div class="dowhop-selector-header" style="background-image: url(' +
        // imageURL +
        // ');">' +
        // '<h1>' +
        // doWhopDescription.titleDescription +
        // '</h1>' +
        // '</div>' +
        // '<div class="dowhop-selector-body mdl-layout__content">' +
        // '<h5>What?</h5>' +
        // '<p>' +
        // doWhopDescription.whatDescription +
        // '</p>' +
        // '<h5>Why?</h5>' +
        // '<p>' +
        // doWhopDescription.whyDescription +
        // '</p>' +
        // '<h5>Who?</h5>' +
        // '<p>' +
        // doWhopDescription.whoDescription +
        // '</p>' +
        // '<h5>When?</h5>' +
        // '<p>' +
        // (doWhopDescription.whenDescription || 'By request') +
        // '</p>' +
        // '<h5>Where?</h5>' +
        // '<p>' +
        // doWhopDescription.whereDescription +
        // '</p>' +
        // '<h5>How much?</h5>' +
        // '<p>' +
        // doWhopDescription.howMuchDescription +
        // '</p>' +
        // '<h5>Who is the creator?</h5>' +
        // '<p>' +
        // (doWhopDescription.creatorDescription || 'TBD') +
        // '</p>' +
        // '<h5>Who is doer?</h5>' +
        // '<p>' +
        // (doWhopDescription.doerDescription || 'TBD') +
        // '</p>' +
        '</div>' +
        '</aside>';
      doWhopPlacard.append(div);
    });
  }).then(
    initiateEventListenersPerDoWhop
  );
}

// Add Doer(s) or a Creator email to a DoWhopDescription
var doWhopDescriptionKeyForUpdate = '';

function revealEditEmailForm(node) {
  adminEditDoWhopForm.removeAttribute('hidden');
  var currentNodeTitle = '';
  doWhopDescriptionKeyForUpdate = node.id;
  var doWhopDescriptionRef = doWhopDescriptionsRef.child(doWhopDescriptionKeyForUpdate);
  doWhopDescriptionRef.once('value', function(data) {
    var doWhopDescription = data.val();
    var currentNodeTitle = doWhopDescription.titleDescription;
    selectedForEdit.innerHTML = 'Edit: ' + currentNodeTitle;
    creatorDescriptionUpdate.value = doWhopDescription.creatorDescription;
    doerDescriptionUpdate.value = doWhopDescription.doerDescription;
  });
}

function updateCreatorDoerEmails(e) {
  e.preventDefault();
  adminEditDoWhopForm.removeAttribute('hidden');
  doWhopDescriptionsRef.child(doWhopDescriptionKeyForUpdate).update({
    creatorDescription: creatorDescriptionUpdate.value.toLowerCase(),
    doerDescription: doerDescriptionUpdate.value.toLowerCase()
  });
  selectedForEdit.innerHTML = 'Edit your DoWhop';
  error.innerHTML = 'Emails have been updated!';
  adminEditDoWhopForm.reset();
}

function showConfirmationMessage() {
  window.alert('Thanks for submitting your DoWhop!');
}

// Adding function to add a chosen dowhop a user's list.
// TODO Determing if this is still used...
function addToMyDoWhops(node) {
  console.log('ADDTOMYDOWHOPS CALLED IN ADMIN -> ', node);
  database
    .ref('app_users')
    .child(auth.currentUser.uid)
    .child('doer')
    .child(node.parentElement.id)
    .update({ doer: true });
}

// Grabbing and iterating all doWhops to add listeners:
function initiateEventListenersPerDoWhop() {
  var doWhopList = document.getElementsByClassName('dowhop-selector');

  for (var i=0; i<doWhopList.length; i++){
      // console.log('testing',doWhopList[i])
      if (doWhopList[i]) {
        doWhopList[i].addEventListener('click', addDoWhopSpecificProtocols);
      }
  }

  function retrieveChatSentAtTime(doWhopID) {
    var selectedDoWhop = doWhopID
    var myRef = firebase.database().ref('messages').child(selectedDoWhop).limitToLast(1);
    myRef.orderByKey().on('child_added', setMessage);
  }

  function addDoWhopSpecificProtocols() {
    retrieveChatSentAtTime(this.id)
    revealEditEmailForm(this);
  }
}

// Adding prototype functionality to demo last-active date-time:
var doWhopDashboardDemo = document.getElementById('dowhop-dashboard-demo');

function setMessage(data) {
    var val = data.val();
    var output = 'Re: ' + data.key + ',\n Last message sent at ' + val.sentAt;
    output += '\n' + val.name + ' says >>>>> ' + val.text; 
    doWhopDashboardDemo.innerText = output;
  }

  $(document).ready(initiateEventListenersPerDoWhop());
