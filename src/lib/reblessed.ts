/**
 * reblessed - a high-level terminal interface library for node.js
 * https://github.com/kenan238/reblessed
 *
 * Based on original work by Christopher Jeffrey: https://github.com/chjj/blessed
 * Copyright (c) 2013-2023, Christopher Jeffrey and contributors (MIT License).
 */

// TODO: update progressively as the various NS are done

import reblessedColors from "./colors";
import reblessedHelpers from "./helpers";
import * as programModule from "./program";
import * as tputModule from "./tput";
import * as unicodeModule from "./unicode";
import * as widgetModule from "./widget";

namespace reblessed {
  export const tput: tputModule.RebeblessedTput = tputModule.tput;
  export const unicode: unicodeModule.ReblessedUnicode = unicodeModule.unicode;

  export const helpers = {
    sprintf: tput.sprintf,
    tryRead: tput.tryRead,
    ...reblessedHelpers,
  };

  export const widget: ReblessedWidget = widgetModule;

  export function program(...args: any[]): programModule.ReblessedProgram {
    return programModule.apply(null, args);
  }

  export const Program: typeof programModule.ReblessedProgram = programModule;

  export const colors = reblessedColors;
}

export default reblessed;
