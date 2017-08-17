const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = functions.config();

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

  console.log('NEW-MESSAGE -> ', newMessage, ' ====== ', previousMessage, ' ====== ', key);

  const getDoWhopDescriptionTitle = admin
    .database()
    .ref('DoWhopDescriptions')
    .child(key)
    .once('value')
    .then(snapshot => {
      return snapshot.val().titleDescription;
    });

  Promise.all([tokens, getDoWhopDescriptionTitle]).then(([tokens, title]) => {
    const payload = {
      notification: {
        title: title || 'Coordinate Message Change',
        body: `Message changed to ${newMessage} from ${previousMessage}`,
        icon: doWhopIcon
      }
    };
    admin.messaging().sendToDevice(tokens, payload).catch(error => console.log('ERROR IN INDEX.js -> ', error));
  });
});

exports.DoWhopDescriptionDateAlert = functions.database.ref('/DoWhopDescriptions/{pushKey}/whenDate').onWrite(event => {
  const newDate = event.data.val();
  const previousDate = event.data.previous.val();
  const key = event.params.pushKey;

  console.log('NEW-DATE', newDate, ' ====== ', previousDate, ' ====== ', key);

  const getDoWhopDescriptionTitle = admin
    .database()
    .ref('DoWhopDescriptions')
    .child(key)
    .once('value')
    .then(snapshot => {
      return snapshot.val().titleDescription;
    });

  Promise.all([tokens, getDoWhopDescriptionTitle]).then(([tokens, title]) => {
    const payload = {
      notification: {
        title: title || 'Coordinate Date Change',
        body: `Date changed to ${newDate} from ${previousDate}`,
        icon: doWhopIcon
      }
    };
    admin.messaging().sendToDevice(tokens, payload).catch(error => console.log('ERROR IN INDEX.js -> ', error));
  });
});

exports.DoWhopDescriptionLocationAlert = functions.database
  .ref('/DoWhopDescriptions/{pushKey}/whereAddress')
  .onWrite(event => {
    const newLocation = event.data.val();
    const previousLocation = event.data.previous.val();
    const key = event.params.pushKey;

    console.log('NEW-LOCATION', newLocation, ' ====== ', previousLocation, ' ====== ', key);

    const getDoWhopDescriptionTitle = admin
      .database()
      .ref('DoWhopDescriptions')
      .child(key)
      .once('value')
      .then(snapshot => {
        return snapshot.val().titleDescription;
      });

    Promise.all([tokens, getDoWhopDescriptionTitle]).then(([tokens, title]) => {
      const payload = {
        notification: {
          title: title || 'Coordinate Location Change',
          body: `Location changed to ${newLocation} from ${previousLocation}`,
          icon: doWhopIcon
        }
      };
      admin.messaging().sendToDevice(tokens, payload).catch(error => console.log('ERROR IN INDEX.js -> ', error));
    });
  });

exports.DoWhopDescriptionAlert = functions.database.ref('/DoWhopDescriptions/{pushKey}').onWrite(event => {
  const newDescription = event.data.val();
  const key = event.params.pushKey;

  console.log('DESCRIPTION-ALERT', newDescription);

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

  // getUser is for testing purposes only...
  const getUser = admin.auth().getUser('VYw0lPDFD3btHJadneuSFGjy8wk1');

  Promise.all([getTokens, getUser]).then(([tokens, user]) => {
    const payload = {
      notification: {
        title: (newDescription && newDescription.titleDescription) || 'DoWhopTitle Placeholder',
        body: 'Has been created and or updated',
        icon: doWhopIcon
      }
    };
    admin.messaging().sendToDevice(tokens, payload).catch(error => console.log('ERROR IN INDEX.js -> ', error));
  });
});
