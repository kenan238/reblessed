/**
 * colors.ts - color-related functions for blessed.
 * https://github.com/kenan238/reblessed
 *
 * Based on original work by Christopher Jeffrey: https://github.com/chjj/blessed
 * Copyright (c) 2013-2023, Christopher Jeffrey and contributors (MIT License).
 */

const _cache: Record<string, number> = {};
const _blendCache: Record<string, number> = {};

namespace reblessedColors {
  // XTerm Colors
  // These were actually tough to track down. The xterm source only uses color
  // keywords. The X11 source needed to be examined to find the actual values.
  // They then had to be mapped to rgb values and then converted to hex values.
  export const xterm = [
    "#000000", // black
    "#cd0000", // red3
    "#00cd00", // green3
    "#cdcd00", // yellow3
    "#0000ee", // blue2
    "#cd00cd", // magenta3
    "#00cdcd", // cyan3
    "#e5e5e5", // gray90
    "#7f7f7f", // gray50
    "#ff0000", // red
    "#00ff00", // green
    "#ffff00", // yellow
    "#5c5cff", // rgb:5c/5c/ff
    "#ff00ff", // magenta
    "#00ffff", // cyan
    "#ffffff", // white
  ];

  export const colorNames: { [key: string]: number } = {
    default: -1,
    normal: -1,
    bg: -1,
    fg: -1,
    // normal
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    magenta: 5,
    cyan: 6,
    white: 7,
    // light
    lightblack: 8,
    lightred: 9,
    lightgreen: 10,
    lightyellow: 11,
    lightblue: 12,
    lightmagenta: 13,
    lightcyan: 14,
    lightwhite: 15,
    // bright
    brightblack: 8,
    brightred: 9,
    brightgreen: 10,
    brightyellow: 11,
    brightblue: 12,
    brightmagenta: 13,
    brightcyan: 14,
    brightwhite: 15,
    // alternate spellings
    grey: 8,
    gray: 8,
    lightgrey: 7,
    lightgray: 7,
    brightgrey: 7,
    brightgray: 7,
  };

  export let ccolors: Record<string, ([number, number] | number)[]> = {
    blue: [
      4,
      12,
      [17, 21],
      [24, 27],
      [31, 33],
      [38, 39],
      45,
      [54, 57],
      [60, 63],
      [67, 69],
      [74, 75],
      81,
      [91, 93],
      [97, 99],
      [103, 105],
      [110, 111],
      117,
      [128, 129],
      [134, 135],
      [140, 141],
      [146, 147],
      153,
      165,
      171,
      177,
      183,
      189,
    ],

    green: [
      2,
      10,
      22,
      [28, 29],
      [34, 36],
      [40, 43],
      [46, 50],
      [64, 65],
      [70, 72],
      [76, 79],
      [82, 86],
      [106, 108],
      [112, 115],
      [118, 122],
      [148, 151],
      [154, 158],
      [190, 194],
    ],

    cyan: [
      6, 14, 23, 30, 37, 44, 51, 66, 73, 80, 87, 109, 116, 123, 152, 159, 195,
    ],

    red: [
      1,
      9,
      52,
      [88, 89],
      [94, 95],
      [124, 126],
      [130, 132],
      [136, 138],
      [160, 163],
      [166, 169],
      [172, 175],
      [178, 181],
      [196, 200],
      [202, 206],
      [208, 212],
      [214, 218],
      [220, 224],
    ],

    magenta: [
      5, 13, 53, 90, 96, 127, 133, 139, 164, 170, 176, 182, 201, 207, 213, 219,
      225,
    ],

    yellow: [3, 11, 58, [100, 101], [142, 144], [184, 187], [226, 230]],

    black: [0, 8, 16, 59, 102, [232, 243]],

    white: [7, 15, 145, 188, 231, [244, 255]],
  };

  let colors: string[] = [];
  let vcolors: [number, number, number][] = [];
  const ncolors: (string | undefined)[] = [];

  export function match({
    red,
    green,
    blue,
  }:
    | {
        red: number;
        green: number;
        blue: number;
      }
    | {
        red: string;
        green?: number;
        blue?: number;
      }
    | {
        red: [number, number, number];
        green?: number;
        blue?: number;
      }): number {
    let red1 = red;
    let green1 = green;
    let blue1 = blue;

    if (typeof red1 === "string") {
      let hex: string | [number, number, number] = red1;

      if (hex[0] !== "#") {
        return -1;
      }

      hex = hexToRGB(hex);
      red1 = hex[0];
      green1 = hex[1];
      blue1 = hex[2];
    } else if (Array.isArray(red1)) {
      blue1 = red1[2];
      green1 = red1[1];
      red1 = red1[0];
    }

    const hash = (red1 << 16) | (green1! << 8) | blue1!;

    if (_cache[hash] != null) {
      return _cache[hash];
    }

    let ldiff = Infinity;
    let li = -1;
    let c;
    let red2;
    let green2;
    let blue2;
    let diff;

    for (let i = 0; i < vcolors.length; i++) {
      c = vcolors[i];
      red2 = c[0];
      green2 = c[1];
      blue2 = c[2];

      diff = colorDistance(red1, green1!, blue1!, red2, green2, blue2);

      if (diff === 0) {
        li = i;
        break;
      }

      if (diff < ldiff) {
        ldiff = diff;
        li = i;
      }
    }

    return (_cache[hash] = li);
  }

  export function RGBToHex(r: number | number[], g: number, b: number): string {
    b = Array.isArray(r) ? r[2] : b;
    g = Array.isArray(r) ? r[1] : g;
    r = Array.isArray(r) ? r[0] : r;

    function hex(colorValue: number) {
      let stringifiedValue = colorValue.toString(16);

      if (stringifiedValue.length < 2) {
        stringifiedValue = "0" + stringifiedValue;
      }

      return stringifiedValue;
    }

    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }

  export function hexToRGB(hex: string): [number, number, number] {
    if (hex.length === 4) {
      hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    const col = parseInt(hex.substring(1), 16),
      r = (col >> 16) & 0xff,
      g = (col >> 8) & 0xff,
      b = col & 0xff;

    return [r, g, b];
  }

  // As it happens, comparing how similar two colors are is really hard. Here is
  // one of the simplest solutions, which doesn't require conversion to another
  // color space, posted on stackoverflow[1]. Maybe someone better at math can
  // propose a superior solution.
  // @see [1] http://stackoverflow.com/questions/1633828
  function colorDistance(
    red1: number,
    green1: number,
    blue1: number,
    red2: number,
    green2: number,
    blue2: number
  ): number {
    return (
      Math.pow(30 * (red1 - red2), 2) +
      Math.pow(59 * (green1 - green2), 2) +
      Math.pow(11 * (blue1 - blue2), 2)
    );
  }

  // This might work well enough for a terminal's colors: treat RGB as XYZ in a
  // 3-dimensional space and go midway between the two points.
  export function mixColors(
    color1: number,
    color2: number,
    alpha: number
  ): number {
    color1 = color1 === 0x1ff ? 0 : color1;
    color2 = color2 === 0x1ff ? 0 : color2;

    if (alpha) {
      alpha = 0.5;
    }

    const color1Values = vcolors[color1];
    let red1 = color1Values[0];
    let green1 = color1Values[1];
    let blue1 = color1Values[2];

    const color2Values = vcolors[color2];
    const red2 = color2Values[0];
    const green2 = color2Values[1];
    const blue2 = color2Values[2];

    red1 += ((red2 - red1) * alpha) | 0;
    green1 += ((green2 - green1) * alpha) | 0;
    blue1 += ((blue2 - blue1) * alpha) | 0;

    return match({ red: red1, green: green1, blue: blue1 });
  }

  export function blend(
    attr: number,
    attr2: number | null,
    alpha: number
  ): number {
    let bg = attr & 0x1ff;
    let name: string | undefined;
    let i: number;
    let color;
    let newColor;

    if (attr2 != null) {
      let bg2 = attr2 & 0x1ff;

      if (bg === 0x1ff) {
        bg = 0;
      }

      if (bg2 === 0x1ff) {
        bg2 = 0;
      }

      bg = mixColors(bg, bg2, alpha);
    } else {
      if (_blendCache[bg] != null) {
        bg = _blendCache[bg];
      } else if (bg >= 8 && bg <= 15) {
        bg -= 8;
      } else {
        name = ncolors[bg];

        if (name != null) {
          for (i = 0; i < ncolors.length; i++) {
            if (name === ncolors[i] && i !== bg) {
              color = vcolors[bg];
              newColor = vcolors[i];

              if (
                newColor[0] + newColor[1] + newColor[2] <
                color[0] + color[1] + color[2]
              ) {
                _blendCache[bg] = i;
                bg = i;
                break;
              }
            }
          }
        }
      }
    }

    attr &= ~0x1ff;
    attr |= bg;

    let fg = (attr >> 9) & 0x1ff;

    if (attr2 != null) {
      let fg2 = (attr2 >> 9) & 0x1ff;

      if (fg === 0x1ff) {
        fg = 248; // XXX workaround
      } else {
        if (fg === 0x1ff) {
          fg = 7;
        }

        if (fg2 === 0x1ff) {
          fg2 = 7;
        }

        fg = mixColors(fg, fg2, alpha);
      }
    } else {
      if (_blendCache[fg] != null) {
        fg = _blendCache[fg];
      } else if (fg >= 8 && fg <= 15) {
        fg -= 8;
      } else {
        name = ncolors[fg];

        if (name != null) {
          for (i = 0; i < ncolors.length; i++) {
            if (name === ncolors[i] && i !== fg) {
              color = vcolors[fg];
              newColor = vcolors[i];

              if (
                newColor[0] + newColor[1] + newColor[2] <
                color[0] + color[1] + color[2]
              ) {
                _blendCache[fg] = i;
                fg = i;
                break;
              }
            }
          }
        }
      }
    }

    attr &= ~(0x1ff << 9);
    attr |= fg << 9;

    return attr;
  }

  export function reduce(color: number, total: number): number {
    let reducedColor = color;

    if (color >= 16 && total <= 16) {
      // FIXME: this is not the original implementation, need to investigate
      reducedColor = ccolors[color][0] as number;
    } else if (color >= 8 && total <= 8) {
      reducedColor -= 8;
    } else if (color >= 2 && total <= 2) {
      reducedColor %= 2;
    }

    return reducedColor;
  }

  export function convert(color: number | string | number[]): number {
    if (typeof color === "number") {
      return color;
    }

    let convertedColor: number | null;

    if (typeof color === "string") {
      const formattedColor = color.replace(/[\- ]/g, "");

      if (colorNames[formattedColor] != null) {
        convertedColor = colorNames[formattedColor];
      } else {
        convertedColor = match({ red: formattedColor });
      }
    } else if (Array.isArray(color)) {
      convertedColor = match({
        red: color[0],
        green: color[1],
        blue: color[2],
      });
    } else {
      convertedColor = null;
    }

    return convertedColor ?? 0x1ff;
  }

  // Populating

  // Map higher colors to the first 8 colors.
  // This allows translation of high colors to low colors on 8-color terminals.
  for (const color in ccolors) {
    if (ccolors.hasOwnProperty(color)) {
      const offsets = ccolors[color];

      if (Array.isArray(offsets)) {
        // FIXME: this is not the original implementation, need to investigate
        for (let i = offsets[0] as number; i <= (offsets[1] as number); i++) {
          ncolors[i] = color;

          // FIXME: this is not the original implementation, need to investigate
          ccolors[i] = [colorNames[color]];
        }
      } else if (typeof offsets === "number") {
        ncolors[offsets] = color;

        // FIXME: this is not the original implementation, need to investigate
        ccolors[offsets] = [colorNames[color]];
      }
    }
  }

  const _cols: [number, number, number][] = [];
  const cols: string[] = [];
  let red: number, green: number, blue: number, i: number, l: number;

  function hex(colorValue: number): string {
    let hexString = colorValue.toString(16);

    if (hexString.length < 2) {
      hexString = "0" + hexString;
    }

    return hexString;
  }

  function push(i: number, red: number, green: number, blue: number): void {
    cols[i] = `#${hex(red)}${hex(green)}${hex(blue)}`;
    _cols[i] = [red, green, blue];
  }

  // Seed all 256 colors. Assume xterm defaults.
  // Ported from the xterm color generation script.
  (function seedColors(): void {
    // 0 - 15
    reblessedColors.xterm.forEach((color, i) => {
      const parsedColor = parseInt(color.substring(1), 16);
      push(
        i,
        (parsedColor >> 16) & 0xff,
        (parsedColor >> 8) & 0xff,
        parsedColor & 0xff
      );
    });

    // 16 - 231
    for (red = 0; red < 6; red++) {
      for (green = 0; green < 6; green++) {
        for (blue = 0; blue < 6; blue++) {
          i = 16 + red * 36 + green * 6 + blue;
          push(
            i,
            red ? red * 40 + 55 : 0,
            green ? green * 40 + 55 : 0,
            blue ? blue * 40 + 55 : 0
          );
        }
      }
    }

    // 232 - 255 are grey.
    for (green = 0; green < 24; green++) {
      l = green * 10 + 8;
      i = 232 + green;

      push(i, l, l, l);
    }
  })();

  (function generateCColors(): void {
    const _colsCopy = [..._cols];
    const colsCopy = [...cols];
    let out: number[];

    vcolors = vcolors.slice(0, 8);
    colors = colors.slice(0, 8);

    out = colsCopy.map((value) => match({ red: value }));

    colors = colsCopy;
    vcolors = _colsCopy;

    // FIXME: this is not the original implementation, need to investigate
    ccolors = { out };
  })();
}

export default reblessedColors;
