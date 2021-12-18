# touch-sampler

![tests](https://github.com/GlobeletJS/touch-sampler/actions/workflows/node.js.yml/badge.svg)

A lightweight manager for user interaction with an animated HTML element.

touch-sampler records information about mouse or touch interaction with an
HTML element, and reports that information when requested. This enables the
calling program to **sample** user interactions when it is ready for them,
rather than having to handle them as they occur.

This on-demand reporting of interactions is useful for animations based on
physical modeling. In these animations, the physical state (velocity,
acceleration, etc) is updated once per frame, at typical frame rates of 60
frames per second.

At each frame, the updated physical state depends on both the state from the
previous frame, and any user interactions that have occured *between* the
last and current frames. These interactions are reported to the program by
[DOM events](https://developer.mozilla.org/en-US/docs/Web/Events), which can
fire at arbitrary times, not in sync with the frame rate. touch-sampler helps
keep track of these events by storing information about them until the next
frame, when the main program is ready to use them.

Check out the simple [example][] of touch-sampler being used to interactively
update a Canvas transform.

[example]: https://globeletjs.github.io/touch-sampler/examples/zoom-variable/

## Usage
```javascript
import { initTouch } from "touch-sampler";

const cursor = initTouch(HTMLElement);
```

initTouch takes one argument: the HTML element on which mouse or touch events
will be detected. initTouch returns a cursor object with methods to query and
reset the stored information.

At each frame refresh, the calling code should:
 1. Retrieve information about the cursor state, via cursor.touchStarted(), etc
 2. Reset the state flags for the next call, via cursor.reset()

For details about the API, see src/cursor.js
