/**
 * events.ts - event emitter for reblessed
 * https://github.com/kenan238/reblessed
 *
 * Based on original work by Christopher Jeffrey: https://github.com/chjj/blessed
 * Copyright (c) 2013-2023, Christopher Jeffrey and contributors (MIT License).
 */

import { EventEmitter } from "events";

export default class CustomEventEmitter extends EventEmitter {
  parent: CustomEventEmitter | null = null;
  private _events: Record<
    string,
    ((...args: unknown[]) => boolean)[] | ((...args: unknown[]) => boolean)
  > = {};

  constructor() {
    super();
  }

  addListener(type: string, listener: (...args: unknown[]) => void) {
    super.addListener(type, listener);
    this._emit("newListener", [type, listener]);
    return this;
  }

  on(type: string, listener: (...args: unknown[]) => void) {
    this.addListener(type, listener);
    return this;
  }

  removeListener(type: string, listener: (...args: unknown[]) => void) {
    super.removeListener(type, listener);
    this._emit("removeListener", [type, listener]);
    return this;
  }

  off(type: string, listener: (...args: unknown[]) => void) {
    this.removeListener(type, listener);
  }

  removeAllListeners(type?: string) {
    if (type != null) {
      super.removeAllListeners(type);
    } else {
      this._events = {};
    }

    return this;
  }

  once(type: string, listener: (...args: unknown[]) => void) {
    const on = (...args: unknown[]) => {
      this.removeListener(type, on);
      listener.apply(this, args);
    };
    on.listener = listener;
    this.on(type, on);

    return this;
  }

  listeners(type: string): ((...args: unknown[]) => void)[] {
    const handler = this._events[type];
    return typeof handler === "function" ? [handler] : handler || [];
  }

  emit(type: string, ...args: unknown[]): boolean {
    let el: CustomEventEmitter | null = this;
    const params = [type, ...args];

    this._emit("event", params);

    if (type === "screen") {
      return this._emit(type, args);
    }

    if (super.emit(type, ...args) === false) {
      return false;
    }

    type = `element ${type}`;
    args.unshift(this);

    do {
      if (!el?._events[type]) {
        continue;
      }

      if (el._emit(type, args) === false) {
        return false;
      }
    } while ((el = el?.parent) != null);

    return true;
  }

  private _emit(type: string, args: unknown[]): boolean {
    const handler = this._events[type];
    let ret = true;

    if (handler == null) {
      if (type === "error") {
        throw args[0];
      }

      return false;
    }

    if (typeof handler === "function") {
      return handler.apply(this, args);
    }

    for (const listener of handler) {
      if (listener.apply(this, args) === false) {
        ret = false;
      }
    }

    return ret;
  }
}
