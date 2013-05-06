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
