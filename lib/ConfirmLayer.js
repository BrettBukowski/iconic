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
