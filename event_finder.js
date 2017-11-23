/**
 * This file contains the code that finds events based on a user's preferences. 
 */

// Establish a reference to the database
const dbRef = require('./db')

// This serves as a reference for external files to use to find Facebook events
var eventFinder = {}

/**
 * Finds Facebook events corresponding to the preferences associated with the user specified by _USERID. Uses the
 * Facebook Graph API to search for events.
 * 
 * @param {string} UserID - The unique ID of the user
 * @param {function} callback - The callback function that is called when the request for events is complete
 * @returns {function} - The callback function
 */
eventFinder.findEvents = function(UserID, callback) {
    /** Search for all places within location. */
    //var school = readSchool(UserID);
    var uriLink = 'https://graph.facebook.com/v2.10/search?q='
        + "UC Berkeley"
        + '&type=page&fields=name, events.order(chronological){name, start_time, description}&method=GET';
    var rawData = request({
            uri:uriLink,
                qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
                method: 'POST',
                }, function(error, response, body) {
                  if (!error && response.statusCode == 200) {
                    return dbRef.readUserMin(UserID, function(min) {
                            dbRef.readUserMax(UserID, function(max) {
                              dbRef.readUserKeywords(UserID, function(keyword) {
                                var min_date = createNewDate(new Date(), parseInt(min));
                                var max_date = createNewDate(new Date(), parseInt(max));
                                var parsedData = JSON.parse(body);
                                var i = 0;
                                var j = 0;
                                var urls = new Set();
                                while (!(parsedData.data[i] === undefined)) {
                                  while (!(parsedData.data[i].events.data[j] === undefined)) {
                                    var start_time = parsedData.data[i].events.data[j].start_time;
                                    var segments = start_time.split(/-|T/);
                                    var name = parsedData.data[i].events.data[j].name;
                                    var description = parsedData.data[i].events.data[j].description;
                                    var event_date = new Date(segments[0], segments[1] - 1, segments[2]);
                                    if ((name.indexOf(keyword) !== -1) || (description !== undefined) && (description.indexOf(keyword) !== -1)) {
                                      var min_comparison = compareDates(event_date, min_date);
                                      var max_comparison = compareDates(event_date, max_date);
                                      if (!(min_comparison == 1 || max_comparison == -1)) {
                                        urls.add("facebook.com/" + parsedData.data[i].events.data[j].id);
                                      }
                                    }
                                    j += 1;
                                  }
                                  j = 0;
                                  i += 1;
                                }
                                return callback(urls);
                        });});});
                  } else {
                    console.error(response);
                    console.error(error);
                  }

        });
    }

/**
 * This is a helper function that compares two dates.
 * 
 * @param {Date} date1 - The first date
 * @param {Date} date2 - The second date
 * @returns {number} - 1 if the second date is greater than the first date, -1 if 
 * the first date is greater than the first day, and 0 if the two dates are equal.
 */
function compareDates(date1, date2) {
  if (date2.getFullYear() > date1.getFullYear()) {
    return 1;
  } else if (date1.getFullYear() > date2.getFullYear()) {
    return -1;
  } else {
    if (date2.getMonth() > date1.getMonth()) {
      return 1;
    } else if (date1.getMonth() > date2.getMonth()) {
      return -1;
    } else {
      if (date2.getDate() > date1.getDate()) {
        return 1;
      } else if (date1.getDate() > date2.getDate()) {
        return -1;
      } else {
        return 0;
      }
    }
  }
}

/**
 * This is a helper function that creates a new date that is a certain number of days in the future from an inputted
 * date.
 * 
 * @param {Date} date - The input date
 * @param {number} days - The number of days in the future you want the new date to be
 * @returns {Date} - A new date
 */
function createNewDate(date, days) {
    var total_days = date.getDate() + days;
    var curr_month = date.getMonth(); 
    var curr_year = date.getFullYear();
    while (total_days >= monthDays(curr_month, curr_year)) {
      total_days -= monthDays(curr_month, curr_year);
      curr_month += 1;
      if (!(curr_month % 12)) {
        curr_year += 1;
        curr_month = 0;
      }
    }
    return new Date(curr_year, curr_month, total_days);
  }
  
  /**
   * This is a helper function that determines the number of days in a month
   * 
   * @param {number} month - The specified month
   * @param {number} year - The specified year
   * @returns {number} - The number of days in the specified month for that year
   */
  function monthDays(month, year) {
    if (month == 3 || month == 5 || month == 8 || month == 10) {
      return 30;
    } else if (month == 1) {
      if (!(year % 400)) {
        return 29;
      } else if (!(year % 100)) {
        return 28;
      } else if (!(year % 4)) {
        return 29;
      } else {
        return 28;
      }
    } else {
      return 31;
    }
  }

  module.exports = eventFinder;
