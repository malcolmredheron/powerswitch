powerswitch
===========

The source for the PowerSwitch Chrome extension

# Setup

Follow the instructions at http://developer.chrome.com/extensions/getstarted.html (in "Load the extension") to load your git checkout of PowerSwitch into Chrome. The directory containing this file is the one that you should load.

# Code

This is a pretty standard extension. It uses a background page to keep track of the order of the tabs (which it updates when callbacks inform it that a different tab or window has been selected). The background page also responds to the switch_tab command by showing the popup.

The popup shows the list of tabs and allows the user to choose one.
