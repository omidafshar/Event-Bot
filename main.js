/**
 * This is the main file containing code implementing the Express server and functionality for the chat bot.
 */

// Provided by the Facebook Introduction to the Messenger API
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const dbRef = require('./db')
const eventFinder = require('./event_finder')
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";

// Initializes the Express app that will handling the routes for the chat bot.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/*
  Provided by the Facebook Introduction to the Messenger API. Performs webhook validation.
*/
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});

/*
  Provided by the Facebook Introduction to the Messenger API. Displays the web page.
*/
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton);
  res.end();
});

/*
  Facebook Introduction to the Messenger API. Performs message processing.
*/
app.post('/webhook', function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // Must send back a 200, within 20 seconds, to let Facebook know
    // you've successfully received the callback. Otherwise, the request
    // will time out and Facebook will keep trying to resend.
    res.sendStatus(200);
  }
});

/**
 * Creates a new entry in the database for the user associated with _USERID. Inserts placeholder values
 * for each field in the schema, which will be updated with real values later.
 * 
 * @param {string} _userId - The unique ID of the user
 */
function initializeUser(_userId) {
  dbRef.writeUserData(_userId, "uc berkeley", "puppies", "1", "7", "1:20 pm", "0");
}


/**
 * Performs incoming events handling for received messages
 * 
 * @param {Object} event - An event object containing information about the message received
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  dbRef.readUserTime(senderID, function(exists) {
  
  if (exists === null) {
    console.log("help");
    initializeUser(senderID);
  }

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
  messageText = messageText.toLowerCase();
  var commands = messageText.split(" ");

  if (commands.length) {
    //Upon receiving a message, send a response based on the content of the received message
    switch (commands[0]) {
      case 'help':
        if (commands.length == 1) {
          sendDefaultHelpMessage(senderID);
        } else if (commands.length == 2) {
          sendCommandHelpMessage(senderID, commands[1]);
        } else {
          sendInvalidCommandMsg(senderID);
        }
        break;
      case 'events':
        if (commands.length != 1) {
          sendInvalidCommandMsg(senderID);
        } else {
          processEventRequest(senderID, function(events) {
            sendEventsMessage(senderID, events);
          });
        }
        break;
      case 'set-min':
        if (commands.length != 2) {
          sendInvalidCommandMsg(senderID);
        } else {
          setMin(senderID, commands[1], function(errorCode) {
            sendSettingsMessage(senderID, commands[0], errorCode);
          });
        }
        break;
      case 'set-max':
        if (commands.length != 2) {
          sendInvalidCommandMsg(senderID);
        } else {
          setMax(senderID, commands[1], function(errorCode) {
            sendSettingsMessage(senderID, commands[0], errorCode);
          });
        }
        break;
      case 'set-keywords':
        if (commands.length != 2) {
          sendInvalidCommandMsg(senderID);
        } else {
          setKeywords(senderID, commands.slice(1));
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      case 'set-frequency':
        if (commands.length != 2) {
          sendInvalidCommandMsg(senderID);
        } else {
          setFrequency(senderID, commands[1], function(errorCode) {
            sendSettingsMessage(senderID, commands[0], errorCode);
          });
        }
        break;
      case 'set-university':
        if (commands.length < 2) {
          sendInvalidCommandMsg(senderID);
        } else{
          setUniversity(senderID, commands.slice(1));
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      case 'set-update-time':
        if (commands.length != 3) {
          sendInvalidCommandMsg(senderID);
        } else if (commands[2] != 'am' && commands[2] != 'pm') {
          sendInvalidCommandMsg(senderID);
        } else if (/^(([0]{1}[0-9]{1})|([1]{1}[0-2]{1})|(\d{1})){1}(:[0-6]{1}\d{1})?$/.test(commands[1])) {
          setUpdateTime(senderID, commands[1] + " " + commands[2]);
          sendSettingsMessage(senderID, commands[0], 0);
        } else {
          sendInvalidCommandMsg(senderID);
        }
        break;
      case 'show-preferences':
        if (commands.length != 1) {
          sendInvalidCommandMsg(senderID);
        } else {
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      case 'show-keywords':
        if (commands.length != 1) {
          sendInvalidCommandMsg(senderID);
        } else {
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      case 'show-university':
        if (commands.length != 1) {
          sendInvalidCommandMsg(senderID);
        } else {
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      case 'show-timespan':
        if (commands.length != 1) {
          sendInvalidCommandMsg(senderID);
        } else {
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      case 'show-frequency':
        if (commands.length != 1) {
          sendInvalidCommandMsg(senderID);
        } else {
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      case 'show-update-time':
        if (commands.length != 1) {
          sendInvalidCommandMsg(senderID);
        } else {
          sendSettingsMessage(senderID, commands[0], 0);
        }
        break;
      //case 'remove-keyword':
        //sendInvalidCommandMsg(senderID);
      default:
        sendInvalidCommandMsg(senderID);
    }
  } else { //In case we want a custom response for a wrong message type later
    sendInvalidCommandMsg(senderID);
  }
});
}

/**
 * Sets the value for what time the user associated with _USERID wants to be updated on events
 * corresponding to their preferences
 * 
 * @param {string} UserID - The unique ID of the user
 * @param {string} time - The specified time
 */
function setUpdateTime(UserID, time) {
  dbRef.writeUserTime(UserID, time);
}

/**
 * Sets the value for what keywords the user associated with _USERID wants to see in the events that the bot returns
 * to them.
 * 
 * @param {string} UserID - The unique ID of the user
 * @param {string} keywords - The keywords to be used in filtering events
 */
function setKeywords(UserID, keywords) {
  var i;
  for (i = 0; i < keywords.length; i++) {
    dbRef.writeUserKeywords(UserID, keywords[i]);
  }
}

/**
 * Sets the value for the university corresponding to the user associated with _USERID
 * 
 * @param {string} UserID - The unique ID of the user
 * @param {string} university - The keywords to be used in filtering events
 */
function setUniversity(UserID, university) {
  var i;
  var name = "";
  for (i = 0; i < university.length; i++) {
    name = name + university[i];
    if (i != university.length - 1) {
      name = name + " ";
    }
  }
  dbRef.writeUserUniversity(UserID, name);
}

/**
 * Sets the value for the maximum number of days in advance that the user associated with _USERID wants to see an event
 * 
 * @param {string} UserID - The unique ID of the user
 * @param {string} value - The value for "max"
 * @param {function} callback - The callback function that is called at the end of the function
 * @returns {function} - The callback function
 */
function setMax(UserID, value, callback) {
  var max = convertToInt(value);
  if (!isNaN(max) && max >= 0) {
    return dbRef.readUserMin(UserID, function(min) {    
      min = convertToInt(min);
      if (max < min) {
        dbRef.writeUserMax(UserID, value);
        dbRef.writeUserMin(UserID, value);
        return callback(1);
      }
      dbRef.writeUserMax(UserID, value);
      return callback(0);
    });
  } else {
    return callback(-1);
  }
}

/**
 * Sets the value for the minimum number of days in advance that the user associated with _USERID wants to see an event
 * 
 * @param {string} UserID - The unique ID of the user
 * @param {string} value - The value for "min"
 * @param {function} callback - The callback function that is called at the end of the function
 * @returns {function} - The callback function
 */
function setMin(UserID, value, callback) {
  var min = convertToInt(value);
  if (!isNaN(min) && min >= 0) {
    return dbRef.readUserMax(UserID, function(max) {
    max = convertToInt(max);
    if (max < min) {
      dbRef.writeUserMax(UserID, value);
      dbRef.writeUserMin(UserID, value);
      return callback(1);
    }
    dbRef.writeUserMin(UserID, value);
    return callback(0);
    });
  } else {
    return callback(-1);
  }
}

/**
 * Sets the value for how often (i.e. daily, weekly, etc.) the user associated with _USERID wants to be notified about events
 * 
 * @param {string} UserID - The unique ID of the user
 * @param {string} value - The "frequency" value, in number of days
 * @param {function} callback - The callback function that is called at the end of the function
 * @returns {function} - The callback function
 */
function setFrequency(UserID, value, callback) {
  var freq = convertToInt(value);
  if (!isNaN(freq) && freq >= 0) {
    dbRef.writeUserFrequency(UserID, value)
    return callback(0);
  }
  return callback(-1);
}

/**
 * This is a helper function that converts a string representing a number into an integer
 * 
 * @param {string} value - The string value to convert
 * @returns {number} - The converted value, as an integer
 */
function convertToInt(value) {
  if (/^(\+|-)?\d+$/.test(value)) { //Borrowed from Sime Vidas on Stack Overflow https://stackoverflow.com/questions/4168360/convert-an-entire-string-into-an-integer-in-javascript
    return parseInt(value, 10);
  }
  return NaN;
}

/**
 * Sends message to user indicating successful update of preferences, or error if anything went wrong
 * 
 * @param {string} recipientID - The recipientID of the user
 * @param {string} setting - The setting that was updated
 * @param {number} errorCode - The error code associated with this operation
 */
function sendSettingsMessage(recipientID, setting, errorCode) {
  var message;
  if (errorCode === -1) {
    message = "ERROR: UNABLE TO " + setting.toUpperCase() + ". Make sure the arguments passed in are valid.";
    sendTextMessage(recipientID, message);
  } else if (errorCode === 1) {
      var plurality;
      dbRef.readUserMax(recipientID, function(max) {
        dbRef.readUserMin(recipientID, function(min) {
          if (max === '1') {
            plurality = '';
          }
          else {
            plurality = 's';
          }
          message = "Min successfully set to " + min + " day" + plurality + " away.\n" +
                    "Max successfully set to " + max + " day" + plurality + " away.";
          sendTextMessage(recipientID, message);
        });
      });
  } else {
    switch (setting) {
      case 'set-min':
        dbRef.readUserMin(recipientID, function(min) {
          var plurality;
          if (min === '1') {
            plurality = '';
          }
          else {
            plurality = 's';
          }
          message = "Min successfully set to " + min + " day" + plurality + " away.";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'set-max':
        dbRef.readUserMax(recipientID, function(max) {
          var plurality;
          if (max === '1') {
            plurality = '';
          }
          else {
            plurality = 's';
          }
          message = "Max successfully set to " + max + " day" + plurality + " away.";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'set-keywords':
        dbRef.readUserKeywords(recipientID, function(keyword) {
          message = "Keyword is now " + keyword + ".";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'set-frequency':
        dbRef.readUserFrequency(recipientID, function(freq) {
        var plurality;
        if (freq === '1') {
          plurality = '';
        }
        else {
          plurality = 's';
        }
        message = "Update frequency successfully set to once every " + freq + " day" + plurality + ".";
        sendTextMessage(recipientID, message);
        });
        break;
      case 'set-university':
        dbRef.readUserUniversity(recipientID, function(university) {
          message = "Updated current university to be " + university + ".";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'set-update-time':
        dbRef.readUserTime(recipientID, function(time) {
          message = "Updated the automated message time to be " + time + ".";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'show-preferences':
        dbRef.readUserData(recipientID, function(information) { 
          message = "University is " + information[0] + ".\n" +
                    "Current keyword is " + information[1] + ".\n" +
                    "Current minimum event distance is " + information[2] + " days away.\n" +
                    "Current maximum event distance is " + information[3] + " days away.\n" +
                    "Current notification time is " + information[4] + ".\n" +
                    "Current automatic notification frequency is " + information[5] + ".";
          sendTextMessage(recipientID, message);
        });           
        break;
      case 'show-keywords':
        dbRef.readUserKeywords(recipientID, function(keyword){
          message = "Current keyword is " + keyword + ".";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'show-university':
        dbRef.readUserUniversity(recipientID, function(university){
          message = "University is " + university + ".";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'show-timespan':
        dbRef.readUserMin(recipientID, function(min){
          dbRef.readUserMax(recipientID, function(max) {
            var ending_1;
            if (min === "1") {
              ending_1 = "";
            }
            else {
              ending_1 = "s";
            }
            var ending_2;
            if (max === "1") {
              ending_2 = "";
            }
            else {
              ending_2 = "s";
            }
            message = "All messages are at least " + min + " day" + ending_1 + " from today and at most " + max + " day" + ending_2 + " from today.";
            sendTextMessage(recipientID, message);
        });});
        break;
      case 'show-frequency':
        dbRef.readUserFrequency(recipientID, function(frequency){
          message = "Current automatic notification frequency is " + frequency + ".";
          sendTextMessage(recipientID, message);
        });
        break;
      case 'show-update-time':
        dbRef.readUserTime(recipientID, function(time){
          message = "Current automated message time is " + time + ".";
          sendTextMessage(recipientID, message);
        });
        break;
      //case 'remove-keyword':
        //message = "Not supported yet";
        //break;
    }
  }
}

/**
 * Sends the events that were found
 * 
 * @param {string} recipientID - The recipientID of the user
 * @param {Set} events - The set of events
 */
function sendEventsMessage(recipientID, events) {
  for (let item of events) sendTextMessage(recipientID, item);
}

/**
 * Calls on the eventFinder to find events for the user corresponding to RECIPIENTID
 * 
 * @param {string} recipientID - The recipientID of the user
 * @param {function} callback - The callback function passed into the eventFinder
 * @returns {Set} - The set of events produced by the eventFinder
 */
function processEventRequest(recipientID, callback) {
  return eventFinder.findEvents(recipientID, callback);

}
/**
 * Sends the default help message to the user associated with RECIPIENTID
 * 
 * @param {string} recipientID - The recipientID of the user
 */
function sendDefaultHelpMessage(recipientID) {
  var helpMessage = "Hi I am a bot designed to help you find events in your area. Here are the commands I recognize:\n " +
  "\"events\"\n " +
  "\"set-keywords\"\n " +
  "\"set-min\"\n " +
  "\"set-max\"\n " +
  "\"set-frequency\"\n " +
  "\"set-university\"\n " +
  "\"set-update-time\"\n " +
  "\"show-preferences\"\n " +
  "\"show-keywords\"\n " +
  "\"show-frequency\"\n " +
  "\"show-university\"\n " +
  "\"show-timespan\"\n " +
  "\"show-update-time\"\n " +
  //"\"remove-keyword\"\n " +
  "Type help \{command\} for how to use a command."
  sendTextMessage(recipientID, helpMessage);
}

/**
 * Sends the command help message for the command specified by the user associated with RECIPIENTID
 * 
 * @param {string} recipientID - The recipientID of the user
 * @param {string} command - The command requested
 */
function sendCommandHelpMessage(recipientID, command) {
  var validCommand = true;
  var message;
  switch(command) {
    case 'events':
      message = "Command: \"events\"\n" +
                "Purpose: Call this command to have me return you a list of events for the university you requested. All events will start at your minimum distance at the earliest and your maximum distance at the lastest. You must have at least one keyword set to use this. This command takes no arguments."
      break;
    case 'set-keywords':
      message = "Command: \"set-keywords \{keywords\}\"\n" +
                "Purpose: Call this command to add the following keywords to the list of words used to find events. Events are processed for if they match any keywords not all of them. This must be called before you can get events. This requires at least 1 keyword as an argument."
      break;
    case 'set-min':
      message = "Command: \"set-min \{number days\}\"\n" +
                "Purpose: Use this to set how many days in the future you want the events you receive to have to be. For example calling \"set-min 1\" requests only events that come before tomorrow. If this value is greater than your max it will update your max to be this value as well. By default this value is 1 until it is changed. This requires 1 argument that is a positive integer or 0."
      break;
    case 'set-max':
      message = "Command: \"set-max \{number days\}\"\n" +
                "Purpose: Use this to set how many days in the future you want the events you receive to have to be. For example calling \"set-max 1\" requests only events come after tomorrow. If this value is less than your min it will update your min to be this value as well. By default this value is 7 until it is changed. This requires 1 argument that is a positive integer or 0."
      break;
    case 'set-frequency':
      message = "Command: \"set-frequency \{number days\}\"\n" +
                "Purpose: Use this to set the number of days that will pass before I will send you an automatic update with events that match your keywords. This requires 1 positive integer argument or 0. If the frequency is set to 0 you will not receive automatic updates. The frequency is 0 by default."
    case 'set-university':
      message = "Command: \"set-university \{city\}, \{state\}\"\n" +
                "Purpose: Sets the university that will be the source of events. This will be Berkeley, California by default. Takes in exactly two arguments, each possibly more than 1 word, separated by a comma: the city to be searched and either the two letter state abbreviation or the name of the state."
      break;
    case 'set-update-time':
      message = "Command: \"set-update-time \{time AM/PM\}\"\n" +
                "Purpose: Sets the time at which you want to receive automatic notifications if you choose to receive these. Takes one input which is two words: the first is the time at which you want to updated in the form hh:mm and the second is either am or pm. This is set to 4:20 pm by default."
      break;
    case 'show-preferences':
      message = "Command: \"show-preferences\"\n" +
                "Purpose: Displays all of the current preferences you have set. This takes 0 arguments."
      break;
    case 'show-keywords':
      message = "Command \"show-keywords\"\n" +
                "Purpose: Displays the current keywords you are using to find events. This takes 0 arguments."
      break;
    case 'show-frequency':
      message = "Command \"show-frequency\"\n" +
                "Purpose: Displays the current frequency at which you are receiving automatic updates. This takes 0 arguments."
      break;
    case 'show-university':
      message = "Command \"show-university\"\n" +
                "Purpose: Displays the university from which you are receiving events. This takes 0 arguments."
      break;
    case 'show-timespan':
      message = "Command \"show-timespan\"\n" +
                "Purpose: Displays the minimum and maximum number of days away for which events are being sent. This takes 0 arguments."
      break;
    case 'show-update-time':
      message = "Command \"show-update-time\"\n" +
                "Purpose: Displays the time of day at which you will receive automatic events if you have enabled automatic events. This takes 0 arguments."
      break;
    //case 'remove-keyword':
      //validCommand = true
      //message = "Command \"remove-keyword \{keyword\}\"\n" +
      //        "Purpose: Takes in a single keyword and removes it from the list of keywords used to search for events. This takes 1 argument".
      //break;
    default:
      validCommand = false;
  }

  if (validCommand) {
    sendTextMessage(recipientID, message);
  } else {
    sendInvalidCommandMsg(recipientID);
  }
}

/**
 * Sends the invalid command message to the user associated with RECIPIENTID
 * 
 * @param {string} recipientID - The recipientID for the user
 */
function sendInvalidCommandMsg(recipientID) {
  var messageText = "I'm sorry. I don't recognize that command. Try typing help to get a full list of commands I recognize or type help and a command name to learn how to use a command.";
  sendTextMessage(recipientID, messageText);
}

/*
  Provided by The Facebook Introduction to the Messenger API
*/
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

//////////////////////////
// Sending helpers
//////////////////////////
/*
  Provided by the The Facebook Introduction to the Messenger API
*/
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

/*
  Provided by the The Facebook Introduction to the Messenger API
*/
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});
