# iconfont-generate-tool

基于SVG文件的字体图标生成工具

简体中文 | [English](README.md)

## 快速上手

### 安装

```bash
npm install iconfont-generate-tool
```

### 示例

1、创建一个js文件`demo.js`

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

2、启动

```bash
node demo.js
```

## 配置项

### `svgPath`(必填)

类型:`String`
svg文件路径. exp:`path.join(__dirname, './svgs/*.svg')`

### `outputDir`(必填)

类型:`String`
文件输出路径.

### `cssOutput`

类型:`String`
CSS文件输出路径.

### `htmlOutput`

类型:`String`
Html文件输出路径.

### `jsOutput`

类型:`String`
JavaScript文件输出路径.

### `fontOutput`

类型:`String`
字体文件输出路径.

### `fontName`

类型:`String`
字体名称.

### `cssPrefix`

类型:`String`
CSS className 前缀.

### `jsPrefix`

类型:`String`
JavaScript文件内容前缀.

### `svg2ttfFormatOptions`

具体配置项参见[svg2ttf](https://github.com/fontello/svg2ttf)
