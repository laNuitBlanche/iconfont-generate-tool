const path = require('path');
const IconFontGenerator = require('../dist/index');

new IconFontGenerator({
  svgPath: path.join(__dirname, './svgs/*.svg'),
  outputDir: path.join(__dirname, './'),
  fontName: 'demo-icon',
  cssPrefix: 'test'
}).generate();