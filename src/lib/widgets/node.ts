/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

var EventEmitter = require('../events').EventEmitter;

/**
 * Node
 */

interface NodeOptions {
  screen?: Screen;
  parent?: Node;
  children?: Node[];
}

function Node(options: NodeOptions): any {
  var self = this;
  var Screen = require('./screen');

  if (!(this instanceof Node)) {
    // @ts-ignore
    return new Node(options);
  }

  EventEmitter.call(this);

  options = options || {};
  this.options = options;

  this.screen = this.screen || options.screen;

  if (!this.screen) {
    if (this.type === 'screen') {
      this.screen = this;
    } else if (Screen.total === 1) {
      this.screen = Screen.global;
    } else if (options.parent) {
      this.screen = options.parent;
      while (this.screen && this.screen.type !== 'screen') {
        this.screen = this.screen.parent;
      }
    } else if (Screen.total) {
      // This _should_ work in most cases as long as the element is appended
      // synchronously after the screen's creation. Throw error if not.
      this.screen = Screen.instances[Screen.instances.length - 1];
      process.nextTick(function() {
        if (!self.parent) {
          throw new Error('Element (' + self.type + ')'
            + ' was not appended synchronously after the'
            + ' screen\'s creation. Please set a `parent`'
            + ' or `screen` option in the element\'s constructor'
            + ' if you are going to use multiple screens and'
            + ' append the element later.');
        }
      });
    } else {
      throw new Error('No active screen.');
    }
  }

  this.parent = options.parent || null;
  this.children = [];
  this.$ = this._ = this.data = {};
  // @ts-ignore
  this.uid = Node.uid++;
  this.index = this.index != null ? this.index : -1;

  if (this.type !== 'screen') {
    this.detached = true;
  }

  if (this.parent) {
    this.parent.append(this);
  }

  (options.children || []).forEach(this.append.bind(this));
}

// @ts-ignore
Node.uid = 0;

// @ts-ignore
Node.prototype.__proto__ = EventEmitter.prototype;

// @ts-ignore
Node.prototype.type = 'node';

// @ts-ignore - Get ready to see typescript not understand prototypes
Node.prototype.insert = function(element: Element, i: number) {
  var self = this;

  // @ts-ignore
  if (element.screen && element.screen !== this.screen) {
    throw new Error('Cannot switch a node\'s screen.');
  }

  // @ts-ignore
  element.detach();
  // @ts-ignore
  element.parent = this;
  // @ts-ignore
  element.screen = this.screen;

  if (i === 0) {
    this.children.unshift(element);
  } else if (i === this.children.length) {
    this.children.push(element);
  } else {
    this.children.splice(i, 0, element);
  }

  // @ts-ignore
  element.emit('reparent', this);
  this.emit('adopt', element);

  (function emit(el) {
    // @ts-ignore
    var n = el.detached !== self.detached;
    // @ts-ignore
    el.detached = self.detached;
    // @ts-ignore
    if (n) el.emit('attach');
    // @ts-ignore
    el.children.forEach(emit);
  })(element);

  if (!this.screen.focused) {
    this.screen.focused = element;
  }
};

// @ts-ignore
Node.prototype.prepend = function(element) {
  this.insert(element, 0);
};

// @ts-ignore
Node.prototype.append = function(element) {
  this.insert(element, this.children.length);
};

// @ts-ignore
Node.prototype.insertBefore = function(element, other) {
  var i = this.children.indexOf(other);
  if (~i) this.insert(element, i);
};

// @ts-ignore
Node.prototype.insertAfter = function(element, other) {
  var i = this.children.indexOf(other);
  if (~i) this.insert(element, i + 1);
};

// @ts-ignore
Node.prototype.remove = function(element) {
  if (element.parent !== this) return;

  var i = this.children.indexOf(element);
  if (!~i) return;

  element.clearPos();

  element.parent = null;

  this.children.splice(i, 1);

  i = this.screen.clickable.indexOf(element);
  if (~i) this.screen.clickable.splice(i, 1);
  i = this.screen.keyable.indexOf(element);
  if (~i) this.screen.keyable.splice(i, 1);

  element.emit('reparent', null);
  this.emit('remove', element);

  (function emit(el) {
    var n = el.detached !== true;
    el.detached = true;
    if (n) el.emit('detach');
    el.children.forEach(emit);
  })(element);

  if (this.screen.focused === element) {
    this.screen.rewindFocus();
  }
};

// @ts-ignore
Node.prototype.detach = function() {
  if (this.parent) this.parent.remove(this);
};

// @ts-ignore
Node.prototype.free = function() {
  return;
};

// @ts-ignore
Node.prototype.destroy = function() {
  this.detach();
  this.forDescendants(function(el) {
    el.free();
    el.destroyed = true;
    el.emit('destroy');
  }, this);
};

// @ts-ignore
Node.prototype.forDescendants = function(iter, s) {
  if (s) iter(this);
  this.children.forEach(function emit(el) {
    iter(el);
    el.children.forEach(emit);
  });
};

// @ts-ignore
Node.prototype.forAncestors = function(iter, s) {
  var el = this;
  if (s) iter(this);
  while (el = el.parent) {
    iter(el);
  }
};

// @ts-ignore
Node.prototype.collectDescendants = function(s) {
  var out: Element[] = [];
  // @ts-ignore 
  this.forDescendants(function(el) {
    out.push(el);
  }, s);
  return out;
};

// @ts-ignore
Node.prototype.collectAncestors = function(s) {
  var out: Element[] = [];
  this.forAncestors(function(el) {
    out.push(el);
  }, s);
  return out;
};

// @ts-ignore
Node.prototype.emitDescendants = function() {
  // @ts-ignore
  var args = Array.prototype.slice(arguments)
    , iter;

  if (typeof args[args.length - 1] === 'function') {
    iter = args.pop();
  }

  return this.forDescendants(function(el) {
    if (iter) iter(el);
    el.emit.apply(el, args);
  }, true);
};

// @ts-ignore
Node.prototype.emitAncestors = function() {
  // @ts-ignore
  var args = Array.prototype.slice(arguments)
    , iter;

  if (typeof args[args.length - 1] === 'function') {
    iter = args.pop();
  }

  return this.forAncestors(function(el) {
    if (iter) iter(el);
    el.emit.apply(el, args);
  }, true);
};

// @ts-ignore
Node.prototype.hasDescendant = function(target: Element) {
  return (function find(el) {
    for (var i = 0; i < el.children.length; i++) {
      if (el.children[i] === target) {
        return true;
      }
      if (find(el.children[i]) === true) {
        return true;
      }
    }
    return false;
  })(this);
};

// @ts-ignore
Node.prototype.hasAncestor = function(target: string) {
  var el = this;
  while (el = el.parent) {
    if (el === target) return true;
  }
  return false;
};

// @ts-ignore
Node.prototype.get = function(name: string, value: any) {
  if (this.data.hasOwnProperty(name)) {
    return this.data[name];
  }
  return value;
};
// @ts-ignore
Node.prototype.set = function(name: string, value: any) {
  return this.data[name] = value;
};

/**
 * Expose
 */

module.exports = Node;
