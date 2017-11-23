//Sets up the firebase database
var admin = require("firebase-admin");

var serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://event-bot-2.firebaseio.com"
});

// Get a reference to the database service
var database = admin.database();

// Reference to database to be used by external files
var dbRef = {};

//DataBase functions

/**
 * 
 * @param {*} _userId 
 * @param {*} _university 
 * @param {*} _keywords 
 * @param {*} _min 
 * @param {*} _max 
 * @param {*} _time 
 * @param {*} _frequency 
 */
dbRef.writeUserData = function(_userId, _university, _keywords, _min, _max, _time, _frequency) {
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
  
  dbRef.writeUserUniversity = function(_userId, _university) {
  
    database.ref('users/' + _userId).update({
        "university": _university,
      }); 
  }
  
  dbRef.writeUserKeywords = function(_userId, _keywords) {
  
    database.ref('users/' + _userId).update({
        "keywords": _keywords,
      }); 
  }
  
  dbRef.writeUserMin = function(_userId, _min) {
  
    database.ref('users/' + _userId).update({
        "min": _min,
      }); 
  }
  
  dbRef.writeUserMax = function(_userId, _max) {
  
    database.ref('users/' + _userId).update({
        "max": _max,
      }); 
  }
  
  dbRef.writeUserTime = function(_userId, _time) {
  
    database.ref('users/' + _userId).update({
        "time": _time,
      }); 
  }
  
  dbRef.writeUserFrequency = function(_userId, _frequency) {
  
    database.ref('users/' + _userId).update({
        "frequency": _frequency,
      }); 
  }
  
  dbRef.readUserData = function(_userId, callback) {
  
    dbRef.readUserUniversity(_userId, function(university) {
      dbRef.readUserKeywords(_userId, function(keywords) {
        dbRef.readUserMin(_userId, function(min) {
          dbRef.readUserMax(_userId, function(max) {
            dbRef.readUserTime(_userId, function(time) {
              dbRef.readUserFrequency(_userId, function(frequency) {
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
  
  dbRef.readUserUniversity = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'university').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  dbRef.readUserKeywords = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'keywords').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  dbRef.readUserMin = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'min').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  dbRef.readUserMax = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'max').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  dbRef.readUserTime = function(_userId, callback) {
    database.ref('users/' + _userId + '/' + 'time').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  dbRef.readUserFrequency = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'frequency').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }

  module.exports = dbRef;
