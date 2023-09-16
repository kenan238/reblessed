/**
 * streambox.js - stream box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/kenan238/reblessed
 */

/**
 * Modules
 */

var Node = require('./node');
var Element = require('./element');
var program = require('../program');

/**
 * Stream Box
 */

function StreamBox(options) {
  if (!(this instanceof Node)) {
    return new StreamBox(options);
  }
  options = options || {};
  options.shrink = true;
  Element.call(this, options);

  this.stream = options.stream;

  var self = this;

  this.stream._read = function() {
    self.setContent(self.stream.read().toString());
  }
}

StreamBox.prototype.__proto__ = Element.prototype;

StreamBox.prototype.type = 'streambox';

/**
 * Expose
 */

module.exports = StreamBox;
