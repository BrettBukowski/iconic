
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("brettbukowski-sensorium/index.js", function(exports, require, module){
"use strict";
module.exports = require("./lib/Sensorium");

});
require.register("brettbukowski-sensorium/lib/Sensorium.js", function(exports, require, module){
/**
 * Exposed as a public interface.
 */

"use strict";

var Video = require('./Video'),
    VideoControls = require('./VideoControls'),
    bind = require('bind'),
    emitter = require('emitter');

module.exports = Sensorium;

navigator.getUserMedia = navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia;

/**
 * ## Sensorium
 * Sets up the video.
 * @constructor
 * @param {Object|String} container Element to insert the video into;
 *  Either an HTMLElement or String selector
 * @param {Object=} [options={}] Options:
 *
 * - width: {String} width (in pixels) defaults to 400px
 * - height: {String} height (in pixels) defaults to 300px
 * - img: {String|Object} String selector or HTMLElement: image element to
 *    receive the captured image.
 *
 * *****
 *
 *  Width and height should be specified in a 4:3 aspect ratio.
 *  If not supplied in that way, the browser will still maintain
 *  the proper aspect ratio according to the max width or height
 *  specified but adds padding width or height in the other axis
 *  accomodate.
 */
function Sensorium (container, options) {
  this._init(container, options);
}

Sensorium.prototype = {
  _init: function (container, options) {
    this._setContainer(container);
    this.options = this._extend({
      width: '400px',
      height: '300px'
    }, options);

    emitter(this);
  },

  /**
   * Sets the container.
   * Defaults to `document.body` if a valid
   * element can't be found.
   */
  _setContainer: function (container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    this.container = container || document.body;
  },

  _extend: function (dest, source) {
    if (source) {
      for (var i in source) {
        var val = source[i];
        if (typeof val !== 'undefined') {
          dest[i] = val;
        }
      }
    }

    return dest;
  },

  _userMediaError: function (err) {
    // **getUserMedia:error event**: passed error object
    this.emit('getUserMedia:error', err);
  },

  _userMediaSuccess: function (stream) {
    this._initVideo();

    // **getUserMedia:success event**: passed the MediaStream and video object
    this.emit('getUserMedia:success', stream, this.vid);

    this.vid.setMediaStream(stream);
  },

  _initVideo: function () {
    this.videoControls = this._createVideoControls();
    this.vid = this._createVideo().attachControls(this.videoControls);
  },

  _createVideo: function () {
    return new Video(this.options).attachTo(this.container);
  },

  _createVideoControls: function () {
    var controls = new VideoControls(Sensorium.Labels);

    controls.on('cancel', bind(this, this.stop));
    controls.on('capture', bind(this, this.capture));

    return controls;
  },

  // The video stream's content has to be drawn to a canvas
  // in order to get a frame. Fortunately, this canvas
  // doesn't have to be actually inserted into the document.
  _createCanvas: function () {
    var canvas = document.createElement('canvas');
    canvas.width = parseFloat(this.options.width);
    canvas.height = parseFloat(this.options.height);

    return canvas;
  },

  _getRenderedCanvasData: function () {
    this._canvas || (this._canvas = this._createCanvas());
    this._canvas.getContext('2d').drawImage(this.vid.getVideoElement(), 0, 0, parseFloat(this.options.width), parseFloat(this.options.height));

    return this._canvas.toDataURL('image/png');
  },

  // If `img` was specified in the options to Sensorium,
  // its `src` attribute is updated to the captured image frame.
  _updateImage: function (dataURI) {
    if (this.options.img) {
      if (typeof this.options.img === 'string') {
        this.options.img = document.querySelector(this.options.img);
      }

      if ('src' in this.options.img) {
        this.options.img.src = dataURI;

        return true;
      }
    }

    return false;
  },

  /**
   * ### start
   * Call to start the media capture process.
   * This will trigger the browser asking the user
   * if she wants to allow access.
   */
  start: function () {
    navigator.getUserMedia({ video: true }, bind(this, this._userMediaSuccess), bind(this, this._userMediaError));
  },

  /**
   * ### capture
   * Call to capture an image on the media stream.
   * `start` must have already have been called.
   */
  capture: function () {
    var data = this._getRenderedCanvasData();
    this._updateImage(data);
    // **capture event**: passed the data URI image data
    this.emit('capture', data);
  },

  /**
   * ### stop
   * Call to stop capturing and to destroy the video element.
   * `start` must have already have been called.
   */
  stop: function () {
    this.videoControls.destroy();
    this.vid.destroy();
    // **stop event**
    this.emit('stop');
  }
};

/**
 * ## Sensorium.Labels
 * Labels used for the UI.
 */
Sensorium.Labels = {
  // cancel label
  CANCEL: 'Cancel',
  // take picture label
  TAKE_PICTURE: 'Take Picture'
};

});
require.register("brettbukowski-sensorium/lib/Video.js", function(exports, require, module){
/**
 * Internal use only - not exposed as a public interface.
 */

"use strict";

var bind = require('bind');

module.exports = Video;

window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

/**
 * ## Video
 * Encapsulates the video element.
 * @param {Object=} [attrs={}] Options:
 *
 * - width: {String} pixels
 * - height: {String} pixels
 */
function Video (attrs) {
  this.options = attrs;

  this._init();
}

Video.prototype = {
  _init: function () {
    this.vidContainer = this._createVideoContainer();
    this.vid = this.vidContainer.appendChild(this._createVideo());
  },

  _createVideo: function () {
    var vid = document.createElement('video');
    vid.autoplay = true;

    return vid;
  },

  _createVideoContainer: function () {
    var container = document.createElement('div');
    container.className = 'sensorium';
    container.style.width = this._toPixels(this.options.width);
    container.style.height = this._toPixels(this.options.height);

    return container;
  },

  _toPixels: function (val) {
    return (typeof val === 'string' && val.indexOf('px') > 0) ? val : val + 'px';
  },

  /**
   * ### attachTo
   * Attach the video element onto the given container element.
   * @chainable
   * @param  {Object} container Parent
   * @return {Video}
   */
  attachTo: function (container) {
    container.appendChild(this.vidContainer);

    return this;
  },

  /**
   * ### attachControls
   * Attach controls into the video container.
   * Controls should be duck-typed to:
   *
   * - `header()`: returns an HTMLElement
   * - `footer()`: returns an HTMLElement
   *
   * @chainable
   * @param  {Object} controls
   * @return {Video}
   */
  attachControls: function (controls) {
    this.controlPanel = document.createElement('div');
    this.vid.parentNode.insertBefore(this.controlPanel, this.vid);

    this.controlPanel.appendChild(controls.header());
    this.controlPanel.appendChild(controls.footer());

    return this;
  },

  /**
   * ### setMediaStream
   * Sets the video `src` to the given MediaStream.
   * @param {Object} stream
   * @return {Video}
   */
  setMediaStream: function (stream) {
    this.stream = stream;

    this.vid.src = window.URL ? window.URL.createObjectURL(stream) : stream;

    return this;
  },

  /**
   * ### getVideoElement
   * Returns the Video element.
   * @return {HTMLElement}
   */
  getVideoElement: function () {
    return this.vid;
  },

  /**
   * Kills the video element, stops the media stream. Closes up shop.
   * @return {Video}
   */
  destroy: function () {
    this.stream.stop();

    this.vidContainer.parentNode.removeChild(this.vidContainer);

    this.vid = this.vidContainer = null;

    return this;
  }
};

});
require.register("brettbukowski-sensorium/lib/VideoControls.js", function(exports, require, module){
/**
 * Internal use only - not exposed as a public interface.
 */

"use strict";

var emitter = require('emitter');
var bind = require('bind');

module.exports = VideoControls;

/**
 * ## VideoControls
 * Encapsulates video controls.
 * @param {Object} labels
 */
function VideoControls (labels) {
  this.labels = labels;

  emitter(this);
}

VideoControls.prototype = {
  _createElement: function (tagName, attrs) {
    var el = document.createElement(tagName);

    for (var i in attrs) {
      if (attrs.hasOwnProperty(i)) {
        el[i] = attrs[i];
      }
    }

    return el;
  },

  _removeElement: function (el) {
    if (el) {
      return el.parentNode.removeChild(el);
    }
  },

  _createLabel: function (text, className) {
    return '<i class="' + className + '"></i> <span class="label">' + text + '</span>';
  },

  /**
   * Creates header HTMLElement containing single `<a>` close link.
   */
  _createHeader: function () {
    var header = this._createElement('div', { className: 'controls header' }),
        a = this._createElement('a', {
          href: '#',
          innerHTML: this._createLabel(this.labels.CANCEL, VideoControls.Classes.CANCEL)
        });

    // **cancel event**: called when the header link is clicked
    a.addEventListener('click', bind(this, this.clickHandler, 'cancel'));

    header.appendChild(a);

    return header;
  },

  /**
   * Creates footer HTMLElement containing single `<button>` capture button.
   */
  _createFooter: function () {
    var footer = this._createElement('div', { className: 'controls footer' }),
        button = this._createElement('button', {
          type: 'button',
          innerHTML: this._createLabel(this.labels.TAKE_PICTURE, VideoControls.Classes.TAKE_PICTURE)
        });

    // **capture event**: called when the footer button is clicked
    button.addEventListener('click', bind(this, this.clickHandler, 'capture'));

    footer.appendChild(button);

    return footer;
  },

  /**
   * ### header
   * Returns the HTMLElement to be used for the controls header.
   */
  header: function () {
    return (this._header || (this._header = this._createHeader()));
  },

  /**
   * ### footer
   * Returns the HTMLElement to be used for the controls footer.
   */
  footer: function () {
    return (this._footer || (this._footer = this._createFooter()));
  },

  clickHandler: function (name, e) {
    e && e.preventDefault();

    this.emit(name);
  },

  /**
   * Destroy the elements and close up shop.
   */
  destroy: function () {
    this._removeElement(this._header);
    this._removeElement(this._footer);

    this._header = this._footer = null;
  }
};

/**
 * ## VideoControls.Classes
 * Icon classes for UI components.
 */
VideoControls.Classes = {
  CANCEL:       'icon-remove',
  TAKE_PICTURE: 'icon-camera'
};

});
require.register("brettbukowski-cropper/index.js", function(exports, require, module){
"use strict";
module.exports = require("./lib/Cropper");

});
require.register("brettbukowski-cropper/lib/Cropper.js", function(exports, require, module){
"use strict";

var CropPane = require('./CropPane.js');
var ImageCanvas = require('./ImageCanvas.js');
var emitter = require('emitter');
var bind = require('bind');

module.exports = Cropper;

/**
 * # Cropper
 * @param {Object} img     Image element to crop
 * @param {Object=}
 *
 * - options:
 *
 * - ratio: {String} none, square, 4:3, 5:2, 5:4, 3:2, 6:4, 7:5, 10:8, 16:9 (defaults to none)
 * - minWidth: {Number} Minimum width (px) of the cropped area (defaults to 20)
 * - minHeight: {Number} Minimum height (px) of the cropped area (defaults to 20)
 * - maxWidth: {Number} Maximum width (px) of the cropped area
 * - minHeight: {Number} Maximum height (px) of the cropped area
 * - defaultHeight: {Number} Default crop area height (px) (defaults to 100)
 * - defaultWidth: {Number} Default crop area width (px) (defaults to 100)
 *
 */
function Cropper (img, options) {
  options = this._defaultOptions(options || {});

  this.img = img;
  this.cropPane = new CropPane(options);
  this.canvas = new ImageCanvas(img);

  emitter(this);

  this._init();
}

Cropper.prototype = {
  _defaultOptions: function (supplied) {
    var defaults = {
      ratio:          'none',
      minWidth:       20,
      minHeight:      20,
      defaultWidth:   100,
      defaultHeight:  100
    },
    options = supplied;

    for (var i in defaults) {
      if (defaults.hasOwnProperty(i) && !(i in options)) {
        options[i] = defaults[i];
      }
    }

    return options;
  },

  _init: function () {

    this.canvas.draw();

    this.cropPane.on('change', bind(this, this._cropChange));
    this.cropPane.draw(this.img);
  },

  _cropChange: function (position) {
    this._croppedPosition = position;

    // **Change Event**
    this.emit('change', position);

    this.canvas.drawMask(position);
  },

  get: function (imageType) {
    return this.canvas.toDataUrl(this._croppedPosition, imageType);
  },

  setRatio: function (ratio) {
    this.cropPane.setRatio(ratio);
    this.cropPane.refresh();
  },

  destroy: function () {
    this.canvas.destroy();
    this.cropPane.destroy();

    this.canvas = this.cropPane = null;
  }
};

// Options
// - container: place inside this element instead of overlaying original image
//
// TK
// - Better touch support (ideally multi-touch radness)

});
require.register("brettbukowski-cropper/lib/CropPane.js", function(exports, require, module){
"use strict";

var Resizer = require('./Resizer'),
    Position = require('./Position'),
    domTool = require('./DOMTools'),
    draggable = require('./Draggable'),
    emitter = require('emitter'),
    bind = require('bind');

module.exports = CropPane;

/**
 * # CropPane
 * @param {Object} options Options hash
 */
function CropPane (options) {
  this.options = options;

  this.setRatio(this.options.ratio);

  emitter(this);
  draggable(this);
}

CropPane.prototype = {
  /**
   * Draws the pane for the first time.
   * @param  {Object} reference Parent element
   */
  draw: function (reference) {
    this.el || (this._createPane(reference));
  },

  /**
   * Moves to the given coordinates.
   * @param  {Number=} x
   * @param  {Number=} y
   */
  moveTo: function (x, y) {
    var movement = {};

    if (typeof x === 'number') {
      movement.left = x + 'px';
    }
    if (typeof y === 'number') {
      movement.top = y + 'px';
    }

    this.refresh(movement);
  },

  /**
   * Sets the ratio.
   * @param {String} ratio none|square|number:number
   */
  setRatio: function (ratio) {
    ratio = ratio.toString().toLowerCase();

    if (ratio === 'none' || ratio === 'square') {
      this.ratio = ratio;
    }
    else if (/^\d{1,2}:\d{1,2}$/.test(ratio)) {
      var split = ratio.split(':');
      this.ratio = parseInt(split[0], 10) / parseInt(split[1], 10);
    }
    else {
      throw new TypeError("Don't know what to do with " + ratio);
    }
  },

  /**
   * Hook method for Draggable interface.
   * @param  {Number} diffX Difference in x coordinates
   * @param  {Number} diffY Difference in y coordinates
   */
  onDrag: function (diffX, diffY) {
    var newX, newY;

    if (diffX) {
      newX = parseFloat(this.el.style.left) + diffX;
    }
    if (diffY) {
      newY = parseFloat(this.el.style.top) + diffY;
    }

    this.moveTo(newX, newY);
  },

  /**
   * Redraws with the given transforms.
   * @param  {Object=} changes CSS styles to change (if any)
   */
  refresh: function (changes) {
    this._performTransform(changes);
    // **Change Event**
    this.emit('change', Position.relative(this.el));
  },

  destroy: function () {
    domTool.remove(this.parentBounds);
    domTool.remove(this.el);

    this.parentBounds = this.el = null;
  },

  _keepInBounds: function (coordinate, max, min) {
    coordinate = parseFloat(coordinate);
    coordinate = Math.max(coordinate, min || 0);
    coordinate = Math.min(coordinate, max || Number.MAX_VALUE);

    return coordinate;
  },

  /**
   * Modifies the height attribute to properly conform to
   * the current crop ratio.
   * @param  {Object=} pendingTransforms Transforms to be applied (if any)
   * @return {Object=} Object with modified height property or pendingTransforms
   */
  _enforceRatio: function (pendingTransforms) {
    var currentWidth = (pendingTransforms) ?
            parseFloat(pendingTransforms.width) :
            Position.relative(this.el).width,
        newHeight,
        ratio = this.ratio;

    if (ratio === 'square') {
      newHeight = currentWidth;
    }
    else if (typeof ratio === 'number') {
      newHeight = currentWidth / ratio;
    }
    if (newHeight) {
      pendingTransforms || (pendingTransforms = {});
      pendingTransforms.height = newHeight + 'px';
    }

    return pendingTransforms;
  },

  _enforceBounds: function (pendingTransforms) {
    var currentSize = Position.relative(this.el),
        bounds = {
          left:   { parent: 'width', self: 'width' },
          width:  { parent: 'width', self: 'x' },
          top:    { parent: 'height', self: 'height' },
          height: { parent: 'height', self: 'y' }
        },
        bound,
        boundCalculation;

    for (bound in bounds) {
      if (bounds.hasOwnProperty(bound) && bound in pendingTransforms) {
        boundCalculation = bounds[bound];
        pendingTransforms[bound] = this._keepInBounds(pendingTransforms[bound], domTool[boundCalculation.parent](this.parentBounds) - currentSize[boundCalculation.self]) + 'px';
      }
    }

    return pendingTransforms;
  },

  _enforceSize: function (pendingTransforms) {
    if ('width' in pendingTransforms) {
      pendingTransforms.width = this._keepInBounds(pendingTransforms.width, this.options.maxWidth, this.options.minWidth) + 'px';
    }
    if ('height' in pendingTransforms) {
      pendingTransforms.height = this._keepInBounds(pendingTransforms.height, this.options.maxHeight, this.options.minHeight) + 'px';
    }

    return pendingTransforms;
  },

  _performTransform: function (changes) {
    changes = this._enforceRatio(changes);

    if (changes) {
      changes = this._enforceBounds(changes);
      changes = this._enforceSize(changes);

      domTool.setStyles(this.el, changes);
    }
  },

  _createPane: function (reference) {
    this.parentBounds = this._createBounds(reference);
    var parentSize = Position.relative(this.parentBounds);

    var el = document.createElement('div');
    el.className = 'cropper-crop-pane';

    this.el = this.parentBounds.appendChild(el);
    this._performTransform({
      position: 'absolute',
      height:   this.options.defaultHeight + 'px',
      width:    this.options.defaultWidth + 'px',
      top:      (parentSize.height / 2) - (this.options.defaultHeight / 2) + 'px',
      left:     (parentSize.width / 2) - (this.options.defaultWidth / 2) + 'px'
    });

    this.makeDraggable(el, this.parentBounds);
    this._addResizers(el);

    this.refresh();
  },

  _addResizers: function (el) {
    for (var i = 0, regions = ['ne', 'se', 'nw', 'sw'], len = regions.length, sizer; i < len; i++) {
      sizer = new Resizer(regions[i], this.parentBounds);
      sizer.on('move', bind(this, this._onResize));
      el.appendChild(sizer.el);
    }
  },

  /**
   * Handler for resizer's 'move' event.
   * @param  {String} region ne, se, nw, sw
   * @param  {Number} x      Delta x
   * @param  {Number} y      Delta y
   */
  _onResize: function (region, x, y) {
    var currentPosition = Position.relative(this.el),
        operations = this._bounds[region],
        transform = {};

    for (var bound in operations) {
      if (operations.hasOwnProperty(bound)) {
        transform[bound] = this._bounds[bound](currentPosition, x, y, operations[bound]);
      }
    }

    this.refresh(transform);
  },

  _bounds: {
    ne: {
      width:  1,
      top:    1,
      height: -1
    },
    se: {
      height: 1,
      width:  1
    },
    nw: {
      top:    1,
      height: -1,
      left:   1,
      width:  -1
    },
    sw: {
      height: 1,
      left:   1,
      width:  -1
    },

    width: function (currentPosition, x, y, direction) {
      return currentPosition.width + (x * direction) + 'px';
    },
    height: function (currentPosition, x, y, direction) {
      return currentPosition.height + (y * direction) + 'px';
    },
    top: function (currentPosition, x, y, direction) {
      return currentPosition.y + (y * direction) + 'px';
    },
    left: function (currentPosition, x, y, direction) {
      return currentPosition.x + (x * direction) + 'px';
    }
  },

  _createBounds: function (reference) {
    var el = document.createElement('div');

    domTool.setStyles(el, {
      position: 'absolute',
      zIndex:   101
    });
    domTool.keepSnapped(el, reference);

    return reference.parentNode.insertBefore(el, reference);
  }
};

});
require.register("brettbukowski-cropper/lib/Position.js", function(exports, require, module){
"use strict";

module.exports = {
  relative: function (reference) {
    var computedStyle = window.getComputedStyle(reference);

    return {
      x: reference.offsetLeft,
      y: reference.offsetTop,
      width: parseFloat(computedStyle.getPropertyValue('width')),
      height: parseFloat(computedStyle.getPropertyValue('height'))
    };
  },

  absolute: function (reference) {
    var box = reference.getBoundingClientRect();

    return { x: box.left, y: box.top };
  }
};

});
require.register("brettbukowski-cropper/lib/Resizer.js", function(exports, require, module){
"use strict";

var bind = require('bind'),
    emitter = require('emitter'),
    draggable = require('./Draggable');

module.exports = Resizer;

function Resizer (name, bounds) {
  this.name = name;

  emitter(this);
  draggable(this);

  this._init(bounds);
}

Resizer.prototype = {
  _init: function (bounds) {
    this.el = document.createElement('div');
    this.el.className = 'cropper-sizer cropper-sizer-' + this.name;

    this.makeDraggable(this.el, bounds);
  },

  /**
   * Hook method for Draggable interface.
   * @param  {Number} diffX Difference in x coordinates
   * @param  {Number} diffY Difference in y coordinates
   */
  onDrag: function (diffX, diffY) {
    // *Event move*
    this.emit('move', this.name, diffX, diffY);
  }
};

});
require.register("brettbukowski-cropper/lib/DOMTools.js", function(exports, require, module){
"use strict";

var Position = require('./Position');

var setStyles = module.exports.setStyles = function (el, styles) {
  for (var prop in styles) {
    if (styles.hasOwnProperty(prop)) {
      el.style[prop] = styles[prop];
    }
  }

  return el;
};

var snap = module.exports.snap = function (el, source) {
  var bounds = Position.relative(source);

  setStyles(el, {
    height: bounds.height + 'px',
    width:  bounds.width + 'px',
    top:    bounds.y + 'px',
    left:   bounds.x + 'px'
  });
};

module.exports.keepSnapped = function (el, source) {
  snap(el, source);

  setInterval(function () {
    snap(el, source);
  }, 200);
};

module.exports.remove = function (el) {
  return el.parentNode.removeChild(el);
};

function getComputedStyle (el, style) {
  var computedStyle = window.getComputedStyle(el);

  return computedStyle.getPropertyValue(style);
}

module.exports.width = function (el) {
  return parseFloat(getComputedStyle(el, 'width'));
};

module.exports.height = function (el) {
  return parseFloat(getComputedStyle(el, 'height'));
};

});
require.register("brettbukowski-cropper/lib/ImageCanvas.js", function(exports, require, module){
"use strict";

var emit = require('emitter'),
    domTool = require('./DOMTools'),
    Position = require('./Position');

module.exports = ImageCanvas;

function ImageCanvas (img, options) {
  this.img = img;
  this.options = options;
  this._create(img);
}

ImageCanvas.prototype = {
  draw: function () {
    this.ctx.drawImage(this.img, 0, 0);

    return this;
  },

  unmask: function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    return this;
  },

  drawMask: function (area) {
    // None of the global composite effects do what I need.
    // So: draw four rectangles around the crop area.
    this.unmask().draw();

    this.ctx.fillStyle = 'rgba(0, 0, 0, .5)';
    this.ctx.fillRect(0, 0, area.x, this.canvas.height);
    this.ctx.fillRect(area.x, 0, area.width, area.y);
    this.ctx.fillRect(area.x, area.height + area.y, area.width, this.canvas.height);
    this.ctx.fillRect(area.width + area.x, 0, this.canvas.width, this.canvas.height);

    return this;
  },

  /**
   *
   * @return {String} DataUri
   * @throws {SecurityError} DOM Exception 18 if the image is
   * from a different, non CORS proxy
   */
  toDataUrl: function (area, imageType) {
    var canvas = document.createElement('canvas');
    canvas.width = area.width;
    canvas.height = area.height;
    canvas.getContext('2d').drawImage(this.canvas, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

    return canvas.toDataURL(imageType || 'image/png');
  },

  destroy: function () {
    domTool.remove(this.canvas);

    this.ctx = this.canvas = null;

    return this;
  },

  _create: function (img) {
    var overlayInfo = Position.relative(img),
        canvas = domTool.setStyles(document.createElement('canvas'), {
          position:   'absolute',
          zIndex:     100,
          top:        overlayInfo.y + 'px',
          left:       overlayInfo.x + 'px'
        });

    canvas.height = overlayInfo.height;
    canvas.width = overlayInfo.width;
    canvas.className = 'cropper-canvas';

    domTool.keepSnapped(canvas, img);

    this.ctx = canvas.getContext('2d');
    this.canvas = img.parentNode.insertBefore(canvas, img);
  }
};

});
require.register("brettbukowski-cropper/lib/Draggable.js", function(exports, require, module){
"use strict";

module.exports = Draggable;

var bind = require('bind');

function mixin (obj) {
  for (var i in Draggable.prototype) {
    if (i === 'onDrag' && i in obj) continue;

    obj[i] = Draggable.prototype[i];
  }

  return obj;
}

/**
 * Adds `document.scrollLeft` and `document.scrollTop`
 * onto the given coordinates.
 * @param  {Number} x
 * @param  {Number} y
 * @return {Object}  Has x, y properties
 */
function truePosition (x, y) {
  var docEl = document.documentElement;

  return {
    x: x + docEl.scrollLeft,
    y: y + docEl.scrollTop
  };
}

function subscribe (element, eventMap, context) {
  for (var evt in eventMap) {
    if (eventMap.hasOwnProperty(evt)) {
      element.addEventListener(evt, bind(context, eventMap[evt]));
    }
  }
}

/**
 * May be used as a mixin or instantiated
 * by itself.
 * @param {Object} obj Attach prototype props onto
 */
function Draggable (obj) {
  if (obj) {
    return mixin(obj);
  }
}

Draggable.prototype = {
  makeDraggable: function (el, bounds) {
    subscribe(el, {
      mouseup:      this.onMouseUp,
      mousedown:    this.onMouseDown
    }, this);

    subscribe(bounds, {
      mouseup:      this.onMouseUp,
      mouseout:     this.onMouseOut,
      mousemove:    this.onMouseMove
    }, this);
  },

  onMouseOut: function (e) {
    var mouse = truePosition(e.clientX, e.clientY),
        bounds = e.currentTarget.getBoundingClientRect();

    if (mouse.x <= bounds.left || mouse.x >= bounds.right || mouse.y <= bounds.top || mouse.y >= bounds.bottom) {
      this.onMouseUp(e);
    }
    else {
      // The rest of the subscribers don't need to care.
      e.stopPropagation();
    }
  },

  onMouseUp: function (e) {
    this._dragging = false;
    e.preventDefault();
  },

  onMouseDown: function (e) {
    if (e.button !== 0) return this.onMouseUp(e);

    this._dragging = true;

    this.lastMouse = truePosition(e.clientX, e.clientY);

    e.stopPropagation();
    e.preventDefault();
  },

  onMouseMove: function (e) {
    if (!this._dragging) return;

    e.preventDefault();

    var currentPosition = truePosition(e.clientX, e.clientY),
        diffX = currentPosition.x - this.lastMouse.x,
        diffY = currentPosition.y - this.lastMouse.y;

    this.lastMouse = currentPosition;

    this.onDrag(diffX, diffY);
  },

  /**
   * Callers should implement this method.
   */
  onDrag: function (diffX, diffY) {
    console.log("Hook method called onDrag should be implemented");
    console.log(diffX + ', ' + diffY);
  }
};

});
require.register("iconic/index.js", function(exports, require, module){
"use strict";
module.exports = require("./lib/Iconic");

});
require.register("iconic/lib/Iconic.js", function(exports, require, module){
"use strict";

var Sensorium = require('sensorium'),
    Cropper = require('cropper'),
    ConfirmLayer = require('./ConfirmLayer'),
    bind = require('bind'),
    emitter = require('emitter');

module.exports = Iconic;


/**
 * Copies properties from `defaults` onto
 * `supplied` if the properties aren't already
 * on `supplied`.
 * @param  {Object} defaults Default options
 * @param  {Object} supplied User supplied options
 *                           take precedence
 * @return {Object}          supplied with the
 *                                    mixed in defaults
 */
function defaultOptions (defaults, supplied) {
  var options = supplied;

  for (var i in defaults) {
    if (defaults.hasOwnProperty(i) && !(i in options)) {
      options[i] = defaults[i];
    }
  }

  return options;
}

/**
 * # Iconic
 * @param {Object|String} container Element to insert the control into;
 *  Either an HTMLElement or String selector
 * @param {Object=} options   Options to pass down to
 * Sensorium and Cropper.
 */
function Iconic (container, options) {
  this.options = options || {};
  this._init(container, options);
  emitter(this);
}

Iconic.prototype = {
  _init: function (container, options) {
    this.sensorium = this._initSensorium(container, options);
  },

  /**
   * Initializes the capture process.
   */
  startCapture: function () {
    this.sensorium.start();
  },

  /**
   * Called each time the user takes a still.
   * Cancel handler is added each time as a one time handler,
   * since every time > 1 this is called, it's due to the
   * user canceling and choosing to retake the still.
   * @param  {String} toConfirm Data URI of the image to confirm
   */
  _displayConfirmLayer: function (toConfirm) {
    this.confirmLayer || (this.confirmLayer = this._initConfirmLayer());

    this.confirmLayer.once('canceled', bind(this, this._onCancelImageCapture));
    this.confirmLayer.confirmImage(toConfirm).show();
  },

  /**
   * Called when the user confirms the cropped image.
   */
  _onCroppedImageCapture: function () {
    // **cropped Event**: sends the dataURI `src` for the cropped image
    this.emit('cropped', this.cropper.get());

    this.cropper.destroy();
    this.cropper = null;

    this.confirmLayer.destroy();
    this.confirmLayer = null;
  },

  /**
   * Called when the user cancels the webcam still and
   * chooses to retake another.
   */
  _onCancelImageCapture: function () {
    this.confirmLayer.hide();
  },

  /**
   * Called when the webcam still is confirmed.
   * Initiates the crop sequence.
   */
  _onConfirmImageCapture: function () {
    this.sensorium.stop();

    // The image still needs a tick to "load" (although it's already loaded...)
    setTimeout(bind(this, function () {
      this.cropper = new Cropper(
        this.confirmLayer.getImage(),
        defaultOptions(Iconic.defaultCropOptions, this.options));
    }));

    this.confirmLayer.once('confirmed', bind(this, this._onCroppedImageCapture));
    this.confirmLayer.confirmElement();
  },

  /**
   * Initializes Sensorium.
   * @param  {String|Object} container Container selector or HTMLElement
   * @param  {Object} options   Options
   * @return {Object}           Sensorium instance
   */
  _initSensorium: function (container, options) {
    var sensorium = new Sensorium(container, options);
    sensorium.on('capture', bind(this, this._displayConfirmLayer));
    this._eventPassThrough(sensorium, ['getUserMedia:error', 'getUserMedia:success', 'stop']);

    return sensorium;
  },

  /**
   * Initializes Confirm Layer.
   * @return {Object} ConfirmLayer instance
   */
  _initConfirmLayer: function () {
    var confirmLayer = new ConfirmLayer(document.querySelector('.sensorium'), this.sensorium.options);
    // Unlike the `cancelled` event, this should only ever be called and subscribed to once
    confirmLayer.once('confirmed', bind(this, this._onConfirmImageCapture));

    return confirmLayer;
  },

  /**
   * Subscribes to the given events and in order to pass
   * them thru.
   * @param  {Object} obj    Sensorium|Cropper
   * @param  {Array} events Names of events
   */
  _eventPassThrough: function (obj, events) {
    for (var i = 0, len = events.length, name; i < len; i++) {
      name = events[i];
      obj.on(name, bind(this, this._emit(name)));
    }
  },

  /**
   * Creates a subscriber for Cropper / Sensorium events:
   * emits the given event name.
   * @param  {String} name Event name
   * @return {Function}      Subscriber
   */
  _emit: function (name) {
    return function () {
      this.emit.apply(this, [name].concat(Array.prototype.slice.call(arguments)));
    };
  }
};

/**
 * ## Iconic.defaultCropOptions
 * Default options passed down to `Cropper`, if not
 * overridden.
 * @type {Object}
 */
Iconic.defaultCropOptions = {
  ratio:          'square',
  minWidth:       200,
  minHeight:      200,
  defaultWidth:   200,
  defaultHeight:  200
};

/**
 * ## Iconic.Labels
 * Allow label customizing.
 * @type {Object}
 */
Iconic.Labels = ConfirmLayer.Labels;

// TK
// Styling jumpiness when handing image off between sensorium and cropper.

});
require.register("iconic/lib/ConfirmLayer.js", function(exports, require, module){
"use strict";

var bind = require('bind'),
    emitter = require('emitter');

module.exports = ConfirmLayer;

// Regex for template matching "{varName}"
var SUB = /\{\s*([^|}]+?)\s*(?:\|([^}]*))?\s*\}/g;

/**
 * Super minimal template builder.
 * @param  {String} str Template with variables
 *                      surrounded by "{}"
 * @param  {Object} obj Hash of replacement variables
 *                      whose keys match the "{}" surrounded
 *                      variables
 * @return {String}     Rendered view
 */
function template (str, obj) {
  return str.replace(SUB, function (match, key) {
    return (key in obj) ? obj[key] : match;
  });
}

/**
 * # ConfirmLayer
 * @param {Object} reference Reference node to insert the layer in front of
 * @param {Object} options        Options (width, height)
 */
function ConfirmLayer (reference, options) {
  emitter(this);

  this.container = document.createElement('div');
  this.container.className = 'iconic-confirm';
  this.container.style.display = 'none';
  this.container.style.width = options.width;
  this.container.style.height = options.height;
  this.container.addEventListener('click', bind(this, this._clickHandler));

  reference.parentNode.insertBefore(this.container, reference);
}

ConfirmLayer.prototype = {
  getImage: function () {
    return this.container.querySelector('img');
  },

  /**
   * Builds the confirm layer for the given image src.
   * @param  {String} src Image src
   * @return {Object}     this
   * @chainable
   */
  confirmImage: function (src) {
      this.container.style.position = 'absolute';
      this.container.style.zIndex = 100;
      this.container.innerHTML = this._buildConfirmImageUI(src);

      return this;
  },

  /**
   * Assumes that the confirm layer was already built.
   * Modifies the prompt area.
   * @return {Object}    this
   * @chainable
   */
  confirmElement: function (el) {
    this.container.style.position = 'static';
    this.container.querySelector('.iconic-prompt').innerHTML = this._buildConfirmElementUI();

    return this;
  },

  /**
   * @chainable
   */
  show: function () {
    this.container.style.display = 'block';

    return this;
  },

  /**
   * @chainable
   */
  hide: function () {
    this.container.style.display = 'none';

    return this;
  },

  /**
   * Removes itself from the DOM.
   * @chainable
   */
  destroy: function () {
    this.container.parentNode.removeChild(this.container);
    this.container = null;

    return this;
  },

  /**
   * Basically a delegate click subscriber.
   * Handles clicks to the confirm and cancel
   * buttons.
   * @param  {Object} e ClickEvent
   */
  _clickHandler: function (e) {
    if (e.target.tagName !== 'BUTTON') return;

    var className = e.target.className;

    if (className.indexOf('iconic-ok') > -1) {
      // **confirmed event**
      this.emit('confirmed');
    }
    else if (className.indexOf('iconic-cancel') > -1) {
      // **canceled event**
      this.emit('canceled');
    }
  },

  /**
   * Builds the confirm DOM structure for
   * the webcam still confirm.
   * @param  {String} src Image source
   * @return {String}     Rendered view
   */
  _buildConfirmImageUI: function (src) {
    var views = ConfirmLayer.UI,
        labels = ConfirmLayer.Labels;

    return template(views.prompt, {
      img:      template(views.img, { src: src, alt: labels.captureAlt }),
      message:  labels.captureMessage,
      controls: template(views.confirm, { text: labels.captureConfirm }) + template(views.cancel, { text: labels.captureCancel })
    });
  },

  /**
   * Builds the prompt confirm area for
   * the crop confirm.
   * @return {String}    Rendered view
   */
  _buildConfirmElementUI: function () {
    return template(ConfirmLayer.UI.confirm, { text: ConfirmLayer.Labels.cropConfirm });
  }
};

/**
 * ## ConfirmLayer.Labels
 * @type {Object}
 */
ConfirmLayer.Labels = {
  captureMessage: 'Good?',
  captureConfirm: 'Yes',
  captureCancel:  'No, Retake',
  captureAlt:     'Captured image',
  cropConfirm:    'Save'
};

/**
 * ## ConfirmLayer.UI
 * @type {Object}
 */
ConfirmLayer.UI = {
  img:    '<img src="{src}" alt="{alt}">',
  prompt: '<div class="iconic-confirm-content">{img}<div class="iconic-prompt"><div class="iconic-message">{message}</div>{controls}</div></div>',
  cancel: '<button class="iconic-cancel" type="button">{text}</button>',
  confirm: '<button class="iconic-ok" type="button">{text}</button>'
};

});
require.alias("component-emitter/index.js", "iconic/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-bind/index.js", "iconic/deps/bind/index.js");

require.alias("brettbukowski-sensorium/index.js", "iconic/deps/sensorium/index.js");
require.alias("brettbukowski-sensorium/lib/Sensorium.js", "iconic/deps/sensorium/lib/Sensorium.js");
require.alias("brettbukowski-sensorium/lib/Video.js", "iconic/deps/sensorium/lib/Video.js");
require.alias("brettbukowski-sensorium/lib/VideoControls.js", "iconic/deps/sensorium/lib/VideoControls.js");
require.alias("component-emitter/index.js", "brettbukowski-sensorium/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-bind/index.js", "brettbukowski-sensorium/deps/bind/index.js");

require.alias("brettbukowski-cropper/index.js", "iconic/deps/cropper/index.js");
require.alias("brettbukowski-cropper/lib/Cropper.js", "iconic/deps/cropper/lib/Cropper.js");
require.alias("brettbukowski-cropper/lib/CropPane.js", "iconic/deps/cropper/lib/CropPane.js");
require.alias("brettbukowski-cropper/lib/Position.js", "iconic/deps/cropper/lib/Position.js");
require.alias("brettbukowski-cropper/lib/Resizer.js", "iconic/deps/cropper/lib/Resizer.js");
require.alias("brettbukowski-cropper/lib/DOMTools.js", "iconic/deps/cropper/lib/DOMTools.js");
require.alias("brettbukowski-cropper/lib/ImageCanvas.js", "iconic/deps/cropper/lib/ImageCanvas.js");
require.alias("brettbukowski-cropper/lib/Draggable.js", "iconic/deps/cropper/lib/Draggable.js");
require.alias("component-emitter/index.js", "brettbukowski-cropper/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-bind/index.js", "brettbukowski-cropper/deps/bind/index.js");

