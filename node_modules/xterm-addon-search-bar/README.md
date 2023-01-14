## xterm-addon-search-bar

[![Build Status](https://github.com/yinshuxun/xterm-addon-search-bar/workflows/ci/badge.svg?branch=master&event=push)](https://github.com/yinshuxun/xterm-addon-search-bar/actions)
[![Build Status](https://github.com/yinshuxun/xterm-addon-search-bar/workflows/publish/badge.svg?branch=master&event=push)](https://github.com/yinshuxun/xterm-addon-search-bar/actions)
[![NPM](https://img.shields.io/npm/v/xterm-addon-search-bar.svg)](https://www.npmjs.com/package/xterm-addon-search-bar)
![License](https://img.shields.io/npm/l/xterm-addon-search-bar.svg)

An addon for [xterm.js](https://github.com/xtermjs/xterm.js) that enables show search bar in terminal. This addon requires xterm.js & xterm-addon-search v4+.

### Install

```bash
npm install --save xterm-addon-search-bar
```

### Usage

```ts
import { Terminal } from 'xterm';
import { SearchAddon } from 'xterm-addon-search';
import { SearchAddonBar } from 'xterm-addon-search-bar';

const terminal = new Terminal();
const searchAddon = new SearchAddon();
const searchAddonBar = new SearchAddonBar({searchAddon});
terminal.loadAddon(searchAddon);
terminal.loadAddon(searchAddonBar);
// Can be uesd in a action as click
searchAddonBar.show();
```

See the full [API](https://github.com/yinshuxun/xterm-addon-search-bar/typings/index.d.ts) for more advanced usage
