var firebase = null;

$('document').ready(function() {
  var config = {
    apiKey: "AIzaSyDMgyPr0V49Rdf5ODAU9nLY02ZGEUNoxiM",
    authDomain: "remote-testrunner.firebaseapp.com",
    databaseURL: "https://remote-testrunner.firebaseio.com",
    projectId: "remote-testrunner",
    storageBucket: "remote-testrunner.appspot.com",
    messagingSenderId: "183582255751"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
});
