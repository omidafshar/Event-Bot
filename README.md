# Event Bot

## Description
Event Bot is a Facebook Messenger chat bot that allows university students to search for events connected to the university based on various preferences that they specify. The bot was developed at UC Berkeley's annual hackathon, Cal Hacks, by a team of four UC Berkeley computer science students. Please note that this application is currently still in development, and is not yet available to the general public on the Facebook Messenger platform.

## Authors
Omid Afshar, Nicholas Riasanovsky, Kevin Chang, Jackson Sipple

## Features
Upon opening a chat window with Event Bot, the user should type "help" to see a list of commands that Event Bot understands. Some examples of commands that Event Bot understands are:

  1. "set-keywords {keywords}": Send this command to add the keywords to the list of words used to find events. This must be called before you can get events.
  2. "set-min {number of days}": Send this command to set the minimum number of days in the future you want the events you receive to be.
  3. "set-university {university}": Send this command to set the university that will be the source of events.
  4. "show-university": Send this command to see what university is currently the source of events.
  5. "show-keywords": Send this command to see what keywords are being used to find events.
  6. "events": Send this command to get a list of links to Facebook events that match the preferences you specified.
  
And many more.

## To Be Implemented
1. Support for universities besides UC Berkeley (the bot currently finds events only at UC Berkeley).
2. Automatic notifications: Allow users to set times and the frequency at which they want to receive automatic updates with events from the bot.
3. UI Improvements: Send actual event to user, instead of a link to the event.

