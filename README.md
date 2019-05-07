# Touchy
A lightweight manager for user interaction with an animated HTML element.

Touchy is designed for map-type controls, enabling click/drag and zoom actions.

The factory function in main.js takes one argument, an HTML element, and
adds event handlers. These events may be fired at arbitrary times. 
For an animation, however, we will be checking for user input once per 
frame. We therefore store the latest inputs in cursor.js.

At each frame refresh, the calling code should:
 1. Retrieve information about the cursor state, via cursor.touchStarted(), etc
 2. Reset the state flags for the next call, via cursor.reset()

The only return is the cursor object. For details about the API, see cursor.js
