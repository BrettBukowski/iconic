iconic
======

[![Build Status](https://travis-ci.org/BrettBukowski/iconic.png?branch=master)](https://travis-ci.org/BrettBukowski/iconic)

[![Code Climate](https://codeclimate.com/github/BrettBukowski/iconic.png)](https://codeclimate.com/github/BrettBukowski/iconic)

UI component to facilitate setting a profile picture (à la Trello): Snap a webcam pic, crop it: nang profile pic.

![][demo]

## Installation

First, [Component] must be installed as a prereq.

Then,

    $ component install brettbukowski/iconic

## Usage

Check the example.html file for a demo.

If you don't want to use component, include the [.min.js file][js] on the page:

    <script src="build/iconic.min.js"></script>

And the [CSS][css]:

    <link rel="stylesheet" type="text/css" href="build/iconic.css">

## API

This is basically a glue wrapper around the [sensorium] and [cropper] components.

### Initialization

Require and create a new instance.

    var Iconic = require('iconic'),
        iconic = new Iconic('#my-image');

  The first parameter is a selector / HTMLElement to place the control into.

### Options

All options specified in the optional second param hash pass thru to [sensorium][sensorium-options] and [cropper][cropper-options].

### Starting

    iconic.startCapture();

Starts sensorium's getUserMedia process.

### Events

All events from sensorium and cropper are propagated out thru iconic.

When the user finally confirms a cropped image to use, the `cropped` event is fired.

      iconic.on('cropped', function (uri) {
        var img = document.createElement('img');
        img.src = uri;

        img.addEventListener('load', function () {
          document.body.appendChild(img);

          // Now is when you'd send the base64 data string off to the server...
        });
      });


## License

Copyright (c) 2013 Brett Bukowski

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[demo]: http://dl.dropboxusercontent.com/u/302368/github/iconic.gif
[component]: https://github.com/component/component/
[js]: https://github.com/BrettBukowski/iconic/blob/gh-pages/build/iconic.min.js
[css]: https://github.com/BrettBukowski/iconic/blob/gh-pages/build/cropper.css
[sensorium]: https://github.com/BrettBukowski/sensorium
[sensorium-options]: https://github.com/BrettBukowski/sensorium#initialization
[cropper]: https://github.com/BrettBukowski/cropper
[cropper-options]: https://github.com/BrettBukowski/cropper#options
