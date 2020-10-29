# iconfont-generate-tool

A tool to generate Font Icon according to SVG file

English | [简体中文](README.zh-CN.md)

## Quick Start

### Install

```bash
npm install iconfont-generate-tool
```

### Demo

1、generate a node js file`demo.js`

```javaScript
const path = require('path');
const IconFontGenerator = require('iconfont-generate-tool');

new IconFontGenerator({
  svgPath: path.join(__dirname, './svgs/*.svg'),
  outputDir: path.join(__dirname, './'),
  fontName: 'demo-icon',
  cssPrefix: 'test'
}).generate();
```

2、start

```bash
node demo.js
```

## Configuration

### `svgPath`(required)

Type:`String`
svg icons file path. exp:`path.join(__dirname, './svgs/*.svg')`

### `outputDir`(required)

Type:`String`
File output path.

### `cssOutput`

Type:`String`
CSS file output path.

### `htmlOutput`

Type:`String`
Html file output path.

### `jsOutput`

Type:`String`
JavaScript file output path.

### `fontOutput`

Type:`String`
Font file output path.

### `fontName`

Type:`String`
The font family name.

### `cssPrefix`

Type:`String`
CSS className prefix.

### `jsPrefix`

Type:`String`
JavaScript file content prefix.

### `svg2ttfFormatOptions`

Please refer to[svg2ttf](https://github.com/fontello/svg2ttf)
