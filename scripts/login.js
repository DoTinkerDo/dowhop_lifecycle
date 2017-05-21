(function LoginUsers() {
  "use strict";

  var uiConfig = {
  'callbacks': {
    'signInSuccess': function(user, credential, redirectUrl) {
      handleSignedInUser(user);
      // Do not redirect.
      return false;
    }
  },
  'signInFlow': 'popup',
    // signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ]
  };

  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  ui.start('#firebaseui-auth-container', uiConfig);

  function writeUserData(userId, name, email, photoURL, UID) {
    firebase.database().ref('logged_users/' + userId).set({
      username: name,
      email: email,
      userUID: UID,
      photoURL: photoURL,
      UID: UID
    });
  }

  var loginPage = document.getElementById('login-container');
  var applicationPage = document.getElementById('application-container');

  function handleSignedInUser(user) {
    loginPage.style.display = 'none';
    applicationPage.style.display = 'block';
    writeUserData(user.uid, user.displayName, user.email, user.photoURL, user.uid);
    console.log('USER SIGNED IN WITH USER.UID -> ', user.uid);
  }

  function handleSignedOutUser() {
    loginPage.style.display = 'block';
    applicationPage.style.display = 'none';
    ui.start('#firebaseui-auth-container', uiConfig);
    console.log('USER SIGNED OUT');
  }

  function handleOnAuthStateChange() {
    firebase.auth().onAuthStateChanged(function(user) {
      user ? handleSignedInUser(user) : handleSignedOutUser();
    });
  }

  window.addEventListener('load', handleOnAuthStateChange, false);

}) ();


// legacy code...

var auth = firebase.auth();
var googleAuthProvider = new firebase.auth.GoogleAuthProvider();

var person = null;
auth.onAuthStateChanged(function(user) {
  if (user) {
    person = user;
  } else {
    console.log('LEGACY signed out');
  }
});

var currentUserDoWhopId = null;
var currentDoWhopProto = null;
firebase.database().ref().child('proto_user/').once('value', function(snapshot) {

 snapshot.forEach(function(data) {
    var name = "\"" + person.displayName + "\"";
    var name = person.displayName;
    if (data.key === name) {
      currentUserDoWhopId = data.val();
    }
  });

  firebase.database().ref().child('proto/' + currentUserDoWhopId).once('value', function(snapshot) {
    currentDoWhopProto = snapshot.val();
  });

});
