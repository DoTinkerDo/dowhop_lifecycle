const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = functions.config();
const moment = require('moment');

admin.initializeApp(config.firebase);

const doWhopIcon =
  'https://firebasestorage.googleapis.com/v0/b/dowhop-lifecycle.appspot.com/o/dowhop-icons%2Fdowhop-icon.png?alt=media&token=4ce2cb46-d5f0-4bbc-bb9d-b25ca886e634';
const tokens = [
  'ctP8hLYg7CQ:APA91bHdby2BZuag0HJJxHudP4rBQxfnjFSbOFCkwfuUGIklDkqIS_x7OuODj9YO70eaHd9Pzs8SI5hzI_TsatW9tCTFU2amyVlzbjvwbZmske5dRi6J5ZIUlnIBUzIKsWgsxKSGqM1C',
  'cU1YolfMcGM:APA91bH-uMLNUivsr1L4gGlESiDl-GbgQGl4Qhr1wT165AHyFsOeBPKMBLIXRkHjHERV-u-kdMUtUKZehpTCmNqjGqQb9-8atr2zCB0lwcqdZSQwOqRIeEnB_DgWF21dSlWlsQU6_oQk'
];

exports.ChatMessageAlert = functions.database.ref('/messages/{pushKey}/').onWrite(event => {
  const newMessage = event.data.val();
  const previousMessage = event.data.previous.val();
  const key = event.params.pushKey;

  console.log('NEW-MESSAGE FIRED FOR -> ', key);

  const getDoWhopDescriptionTitle = admin
    .database()
    .ref('DoWhopDescriptions')
    .child(key)
    .once('value')
    .then(snapshot => {
      return snapshot.val().titleDescription;
    });

  const logRef = admin.database().ref('log/');

  const getUser = admin.auth().getUser('O4AMv4CS96RamaG1D6urKhea4VN2');

  Promise.all([getUser, getDoWhopDescriptionTitle]).then(([user, title]) => {
    const logDetails = {
      DoWhop: title || 'Title not found :(',
      alert: 'Coordinate Message Change',
      dateUTC: moment().format('dddd, MMMM Do YYYY, h:mm:ss a'),
      icon: doWhopIcon
    };
    logRef.push(logDetails);
  });
});

exports.DoWhopDescriptionDateAlert = functions.database
  .ref('/DoWhopDescriptions/{pushKey}/whenDateTime')
  .onWrite(event => {
    const newDate = event.data.val();
    const previousDate = event.data.previous.val();
    const key = event.params.pushKey;

    console.log('NEW-DATE -> ', newDate, ' ====== ', previousDate, ' ====== ', key);

    const getDoWhopDescriptionTitle = admin
      .database()
      .ref('DoWhopDescriptions')
      .child(key)
      .once('value')
      .then(snapshot => {
        return snapshot.val().titleDescription;
      });

    const logRef = admin.database().ref('log/');

    Promise.all([tokens, getDoWhopDescriptionTitle]).then(([tokens, title]) => {
      const logDetails = {
        DoWhop: title || 'Title not found :(',
        alert: `Date changed to ${newDate} from ${previousDate}`,
        dateUTC: moment().format('dddd, MMMM Do YYYY, h:mm:ss a'),
        icon: doWhopIcon
      };
      logRef.push(logDetails);
    });
  });

exports.DoWhopDescriptionLocationAlert = functions.database
  .ref('/DoWhopDescriptions/{pushKey}/whereAddress')
  .onWrite(event => {
    const newLocation = event.data.val();
    const previousLocation = event.data.previous.val();
    const key = event.params.pushKey;

    const logRef = admin.database().ref('log/');

    const getDoWhopDescriptionTitle = admin
      .database()
      .ref('DoWhopDescriptions')
      .child(key)
      .once('value')
      .then(snapshot => {
        return snapshot.val().titleDescription;
      });

    Promise.all([tokens, getDoWhopDescriptionTitle]).then(([tokens, title]) => {
      const logDetails = {
        DoWhop: title || 'Title not found :(',
        alert: `Location changed to ${newLocation} from ${previousLocation}`,
        dateUTC: moment().format('dddd, MMMM Do YYYY, h:mm:ss a'),
        icon: doWhopIcon
      };
      logRef.push(logDetails);
    });
  });

exports.DoWhopDescriptionAlert = functions.database.ref('/DoWhopDescriptions/{pushKey}').onWrite(event => {
  const newDescription = event.data.val();
  const key = event.params.pushKey;

  const logRef = admin.database().ref('log/');

  console.log('DESCRIPTION-ALERT -> ');

  const getTokens = admin.database().ref('app_users').once('value').then(snapshot => {
    const tokens = [
      'ctP8hLYg7CQ:APA91bHdby2BZuag0HJJxHudP4rBQxfnjFSbOFCkwfuUGIklDkqIS_x7OuODj9YO70eaHd9Pzs8SI5hzI_TsatW9tCTFU2amyVlzbjvwbZmske5dRi6J5ZIUlnIBUzIKsWgsxKSGqM1C'
    ];
    snapshot.forEach(user => {
      const token = user.child('token').val();
      const doerDescription = (newDescription && newDescription.doerDescription) || '';
      const creatorDescription = (newDescription && newDescription.creatorDescription) || '';
      if (
        token &&
        (doerDescription.split(', ').some(doerDescriptionEmail => doerDescriptionEmail === user.val().email) ||
          creatorDescription === user.val().email)
      ) {
        tokens.push(token);
      }
    });
    return tokens;
  });

  const getUser = admin.auth().getUser('O4AMv4CS96RamaG1D6urKhea4VN2');

  Promise.all([getTokens, getUser]).then(([tokens, user]) => {
    const payload = {
      notification: {
        title: (newDescription && newDescription.titleDescription) || 'Title not found :(',
        body: 'Has been created and or updated',
        icon: doWhopIcon
      }
    };
    const logDetails = {
      DoWhop: (newDescription && newDescription.titleDescription) || 'Title not found :(',
      alert: 'Has been created and or updated',
      dateUTC: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
      // icon: doWhopIcon,
      // editedByName: user.displayName || 'default Name',
      // editedByEmail: user.email || 'default Email'
    };
    logRef.push(logDetails);
    admin.messaging().sendToDevice(tokens, payload).catch(error => console.log('ERROR IN INDEX.js -> ', error));
  });
});
