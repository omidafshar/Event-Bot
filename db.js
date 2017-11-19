//Sets up the firebase database
var admin = require("firebase-admin");

var serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://event-bot-2.firebaseio.com"
});

// Get a reference to the database service
var database = admin.database();

//DataBase functions

function writeUserData(_userId, _university, _keywords, _min, _max, _time, _frequency) {
    database.ref('users/' + _userId).set({
      university: _university,
      keywords: _keywords,
      min: _min,
      max: _max,
      time: _time,
      frequency: _frequency
    }, function(error) {
      if (error) {
      console.log("Data could not be saved." + error);
    } else {
      console.log("Data saved successfully.");
    }
    });
  }
  
  function writeUserUniversity(_userId, _university) {
  
    database.ref('users/' + _userId).update({
        "university": _university,
      }); 
  }
  
  function writeUserKeywords(_userId, _keywords) {
  
    database.ref('users/' + _userId).update({
        "keywords": _keywords,
      }); 
  }
  
  function writeUserMin(_userId, _min) {
  
    database.ref('users/' + _userId).update({
        "min": _min,
      }); 
  }
  
  function writeUserMax(_userId, _max) {
  
    database.ref('users/' + _userId).update({
        "max": _max,
      }); 
  }
  
  function writeUserTime(_userId, _time) {
  
    database.ref('users/' + _userId).update({
        "time": _time,
      }); 
  }
  
  function writeUserFrequency(_userId, _frequency) {
  
    database.ref('users/' + _userId).update({
        "frequency": _frequency,
      }); 
  }
  
  function readUserData(_userId, callback) {
  
    readUserUniversity(_userId, function(university) {
      readUserKeywords(_userId, function(keywords) {
        readUserMin(_userId, function(min) {
          readUserMax(_userId, function(max) {
            readUserTime(_userId, function(time) {
              readUserFrequency(_userId, function(frequency) {
                var stringArray = [];
                stringArray.push(university);
                stringArray.push(keywords);
                stringArray.push(min);
                stringArray.push(max);
                stringArray.push(time);
                stringArray.push(frequency);
                return callback(stringArray);
    });});});});});});
  }
  
  function readUserUniversity(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'university').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  function readUserKeywords(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'keywords').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  function readUserMin(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'min').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  function readUserMax(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'max').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  function readUserTime(_userId, callback) {
    database.ref('users/' + _userId + '/' + 'time').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  function readUserFrequency(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'frequency').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }