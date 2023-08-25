/**
 * helpers.ts - helpers for reblessed
 * https://github.com/kenan238/reblessed
 *
 * Based on original work by Christopher Jeffrey: https://github.com/chjj/blessed
 * Copyright (c) 2013-2023, Christopher Jeffrey and contributors (MIT License).
 */

import * as fs from "fs";
import unicode from "./unicode";
import Element from "./widgets/element";
import Screen from "./widgets/screen";

namespace reblessedHelpers {
  // Merge the properties of two objects.
  export function merge(
    a: Record<string, unknown>,
    b: Record<string, unknown>
  ): Record<string, unknown> {
    return { ...a, ...b };
  }

  // Sort an array of objects by their `name` property in alphabetical order.
  export function asort<T extends { name: string }>(obj: T[]): T[] {
    return obj.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      if (aName[0] === "." && bName[0] === ".") {
        return aName[1] > bName[1] ? 1 : aName[1] < bName[1] ? -1 : 0;
      }

      return aName[0] > bName[0] ? 1 : aName[0] < bName[0] ? -1 : 0;
    });
  }

  // Sort an array of objects by their `index` property in descending order.
  export function hsort<T extends { index: number }>(obj: T[]): T[] {
    return obj.sort((a, b) => b.index - a.index);
  }

  // Recursively find a file named `target` starting from `start` directory.
  export function findFile(start: string, target: string): string | null {
    function read(dir: string): string | null {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const pathPrefix = dir === "/" ? "" : dir;
        const path = `${pathPrefix}/${file}`;

        if (file === target) {
          return path;
        }

        try {
          const stat = fs.lstatSync(path);

          if (stat.isDirectory() && !stat.isSymbolicLink()) {
            const out = read(path);

            if (out) {
              return out;
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }

      return null;
    }

    return read(start);
  }

  // Escape text for tag-enabled elements.
  export function escape(text: string): string {
    return text.replace(/[{}]/g, (ch) => (ch === "{" ? "{open}" : "{close}"));
  }

  // Parse tags in text using the `_parseTags` method of an element.
  export function parseTags(text: string, screen?: any): string {
    return Element._parseTags.call(
      { parseTags: true, screen: screen || Screen.global },
      text
    );
  }

  // Generate tag strings based on the given style and text.
  export function generateTags(style: Record<string, string>, text?: string) {
    let open = "";
    let close = "";

    for (const key of Object.keys(style || {})) {
      const value = style[key];

      if (typeof value === "string") {
        const formattedVal = value
          .replace(/^light(?!-)/, "light-")
          .replace(/^bright(?!-)/, "bright-");

        open = `{${formattedVal}-${key}}${open}`;
        close += `{/${formattedVal}-${key}}`;
      } else {
        if (value === true) {
          open = `{${key}}${open}`;
          close += `{/${key}}`;
        }
      }
    }

    if (text != null) {
      return open + text + close;
    }

    return {
      open,
      close,
    };
  }

  // Convert style attributes to binary format.
  export function attrToBinary(
    style: Record<string, number>,
    element?: typeof Element // FIXME: is this right? passed arg should be `this`
  ): number {
    return Element.sattr.call(element || {}, style);
  }

  // Strip tags from text.
  export function stripTags(text: string): string {
    if (text === "") {
      return "";
    }

    return text
      .replace(/{(\/?)([\w\-,;!#]*)}/g, "")
      .replace(/\x1b\[[\d;]*m/g, "");
  }

  // Clean tags from text.
  export function cleanTags(text: string): string {
    return stripTags(text).trim();
  }

  // Drop Unicode characters from text.
  export function dropUnicode(text: string): string {
    if (text === "") {
      return "";
    }

    return text
      .replace(unicode.chars.all, "??")
      .replace(unicode.chars.combining, "")
      .replace(unicode.chars.surrogate, "?");
  }
}

export default reblessedHelpers;
