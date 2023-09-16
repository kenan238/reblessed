/**
 * radioset.js - radio set element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

var Node = require('./node');
var Box = require('./box');

/**
 * RadioSet
 */

function RadioSet(options) {
  if (!(this instanceof Node)) {
    return new RadioSet(options);
  }
  options = options || {};
  // Possibly inherit parent's style.
  // options.style = this.parent.style;
  Box.call(this, options);
}

Object.defineProperty(RadioSet.prototype, "value", {
  get: function value() {
    for (child of this.children) {
      if (child.type === 'radio-button') {
        if (child.checked)
          return child.value;
      }
    }
  },
});

RadioSet.prototype.__proto__ = Box.prototype;

RadioSet.prototype.type = 'radio-set';

/**
 * Expose
 */

module.exports = RadioSet;
