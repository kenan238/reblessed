# reblessed

#### If you'd like to request a feature, make a new issue

Because the original [blessed repo](https://github.com/chjj/blessed) is kinda dead, (last commit in **2016**) i decided to revive it.

![reblessed-npm](https://img.shields.io/static/v1?label=npm&message=reblessed%20on%20npm&color=orange&link=https://www.npmjs.com/package/reblessed)
![reblessed-stars](https://img.shields.io/github/stars/kenan238/reblessed)
![reblessed-forks](https://img.shields.io/github/forks/kenan238/reblessed)
![reblessed-stars](https://img.shields.io/github/license/kenan238/reblessed)
![reblessed-issues](https://img.shields.io/github/issues/kenan238/reblessed)

A curses-like library with a high level terminal interface API for node.js.

![reblessed](https://raw.githubusercontent.com/chjj/reblessed/master/img/v0.1.0-3.gif)

The library's official author "chjj" forgot about blessed the original
library, the library has been dead for several years (from 2016!) and
all forks also died, so I took matters on my own hands and forked the project.

reblessed is a cool project and so I revived this masterpiece from the dead
under the name "Re-Blessed", because I could find no other `TUI` library that
had exactly what a `TUI` application needed!

## Install

### Latest release

``` bash
npm install reblessed
```

### Latest source code

``` bash
git clone git@github.com:kenan238/reblessed.git
```

## Example

This will render a box with line borders containing the text `'Hello world!'`,
perfectly centered horizontally and vertically.

**NOTE**: It is recommend you use either `smartCSR` or `fastCSR` as a
`reblessed.screen` option. This will enable CSR when scrolling text in elements
or when manipulating lines.

``` js
var reblessed = require('reblessed');

// Create a screen object.
var screen = reblessed.screen({
  smartCSR: true
});

screen.title = 'my window title';

// Create a box perfectly centered horizontally and vertically.
var box = reblessed.box({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Hello {bold}world{/bold}!',
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'magenta',
        border: {
        fg: '#f0f0f0'
        },
        hover: {
        bg: 'green'
        }
    }
});

// Append our box to the screen.
screen.append(box);

// Add a png icon to the box
var icon = reblessed.image({
    parent: box,
    top: 0,
    left: 0,
    type: 'overlay',
    width: 'shrink',
    height: 'shrink',
    file: __dirname + '/my-program-icon.png',
    search: false
});

// If our box is clicked, change the content.
box.on('click', function(data) {
    box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
    screen.render();
});

// If box is focused, handle `enter`/`return` and give us some more content.
box.key('enter', function(ch, key) {
    box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
    box.setLine(1, 'bar');
    box.insertLine(1, 'foo');
    screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();
```

## Documentation

Go to the WIKI tab

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`

## New license

See `LICENSE.md`

## Original License

Copyright (c) 2013-2015, Christopher Jeffrey. (MIT License)

See LICENSE for more info.
