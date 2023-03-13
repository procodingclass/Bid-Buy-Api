var firebase = require("firebase-admin");

var serviceAccount = require("./key.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://testing-6bab2-default-rtdb.firebaseio.com"
});

const db = firebase.firestore();
console.log("Hello From Firestore");

module.exports = db;

// const docRef = fireStore.collection('users').doc('alovelace').set({
//   first: 'Ada',
//   last: 'Lovelace',
//   born: 1815
// });
