/**
 * This file establishes a connection to the Firebase database containing all user preferences. It contains methods
 * for reading from and writing to the database.
 */

//Sets up the firebase database
var admin = require("firebase-admin");

// Service account for Firebase database
var serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

// Initialize Firebase SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://event-bot-2.firebaseio.com"
});

// Get a reference to the database service
var database = admin.database();

// This serves as a reference to the database to be used by external files
var dbRef = {};

// The following functions read from and write to the Firebase database.

/** 
 * Writes data to the database for a particular user, specified by _USERID
 * 
 * @param {string} _userId - The unique ID identifying the user whose data we are updating
 * @param {string} _university - The university to be associated with the user
 * @param {string} _keywords - The keywords to be associated with the user 
 * @param {number} _min - The min value to be associated with the user 
 * @param {number} _max - The max value to be associated with the user 
 * @param {string} _time - The time to be associated with the user 
 * @param {number} _frequency - The frequency to be associated with the user 
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
  
  /**
   * Updates the "university" field in the database for the user associated with _USERID
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {string} _university - The specified university
   */
  dbRef.writeUserUniversity = function(_userId, _university) {
  
    database.ref('users/' + _userId).update({
        "university": _university,
      }); 
  }

  /**
   * Updates the "keywords" field in the database for the user associated with _USERID
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {string} _keywords - The specified keywords
   */
  dbRef.writeUserKeywords = function(_userId, _keywords) {
  
    database.ref('users/' + _userId).update({
        "keywords": _keywords,
      }); 
  }
  
  /**
   * Updates the "min" field in the database for the user associated with _USERID
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {number} _min - The specified min value
   */
  dbRef.writeUserMin = function(_userId, _min) {
  
    database.ref('users/' + _userId).update({
        "min": _min,
      }); 
  }
  
  /**
   * Updates the "max" field in the database for the user associated with _USERID
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {number} _max - The specified max value
   */
  dbRef.writeUserMax = function(_userId, _max) {
  
    database.ref('users/' + _userId).update({
        "max": _max,
      }); 
  }
  
  /**
   * Updates the "time" field in the database for the user associated with _USERID
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {number} _time - The specified time value
   */
  dbRef.writeUserTime = function(_userId, _time) {
  
    database.ref('users/' + _userId).update({
        "time": _time,
      }); 
  }
  
  /**
   * Updates the "frequency" field in the database for the user associated with _USERID
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {number} _frequency - The specified frequency value
   */
  dbRef.writeUserFrequency = function(_userId, _frequency) {
  
    database.ref('users/' + _userId).update({
        "frequency": _frequency,
      }); 
  }
  
  /**
   * Gets all the data from the database for the user associated with _USERID
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {function} callback - The callback function that is called after the data is read
   * @returns {function} - The callback function
   */
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
  
  /**
   * Gets the current university for the user associated with _USERID from the database
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {function} callback - The callback function that is called after the data is read
   * @returns {function|string} - The callback function, or an empty string if there is an error
   */
  dbRef.readUserUniversity = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'university').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  /**
   * Gets the current keywords for the user associated with _USERID from the database
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {function} callback - The callback function that is called after the data is read
   * @returns {function|string} - The callback function, or an empty string if there is an error
   */
  dbRef.readUserKeywords = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'keywords').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  /**
   * Gets the current min value for the user associated with _USERID from the database
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {function} callback - The callback function that is called after the data is read
   * @returns {function|string} - The callback function, or an empty string if there is an error
   */
  dbRef.readUserMin = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'min').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  /**
   * Gets the current max value for the user associated with _USERID from the database
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {function} callback - The callback function that is called after the data is read
   * @returns {function|string} - The callback function, or an empty string if there is an error
   */
  dbRef.readUserMax = function(_userId, callback) {
  
    database.ref('users/' + _userId + '/' + 'max').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  /**
   * Gets the current time value for the user associated with _USERID from the database
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {function} callback - The callback function that is called after the data is read
   * @returns {function|string} - The callback function, or an empty string if there is an error
   */
  dbRef.readUserTime = function(_userId, callback) {
    database.ref('users/' + _userId + '/' + 'time').once("value", function(snapshot) {
      console.log(snapshot.val());
      return callback(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return "";
    });
  }
  
  /**
   * Gets the current frequency value for the user associated with _USERID from the database
   * 
   * @param {string} _userId - The unique ID of the user
   * @param {function} callback - The callback function that is called after the data is read
   * @returns {function|string} - The callback function, or an empty string if there is an error
   */
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
