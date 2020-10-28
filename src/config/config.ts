import os from 'os';

export default {
  // Type: Number Default value: fontHeight - descent
  // The font ascent. Use this options only if you know what you're doing. A suitable value for this is computed for you.
  ascent: undefined,
  // Type: Boolean Default value: false
  // Calculate the bounds of a glyph and center it horizontally.
  centerHorizontally: true,
  // Type: Number Default value: 0
  // The font descent. It is usefull to fix the font baseline yourself.
  // Warning: The descent is a positive value!
  descent: 0,
  // Type: Boolean Default value: false
  // Creates a monospace font of the width of the largest input icon.
  fixedWidth: false,
  // The font id you want.
  // Type: String Default value: the options.fontName value
  fontId: null,
  // The font family name you want.
  // Type: String Default value: 'iconfont'
  fontName: 'iconfont',
  // Type: String Default value: ''
  // The font style you want.
  fontStyle: '',
  // Type: String Default value: ''
  // The font weight you want.
  fontWeight: '',
  formats: ['svg', 'ttf', 'eot', 'woff2', 'woff'],
  formatsOptions: {
    ttf: {
      copyright: null,
      ts: null,
      version: null
    }
  },
  glyphTransformFn: null,
  maxConcurrency: os.cpus().length,
  // Type: String Default value: undefined
  // The font metadata. You can set any character data in but it is the be suited place for a copyright mention.
  metadata: null,
  // Type: (file: string, cb: (err: any, metadata: {file: string, name: string, unicode: string[], renamed: boolean}) => void
  // Default value: require('svgicons2svgfont/src/metadata')(options)
  // A function which determines the metadata for an icon. It takes a parameter file with an icon svg and should return icon metadata (asynchronously) via the callback function. You can use this function to provide custom logic for svg to codepoint mapping.
  // metadata.path     The path to the icon file. (The original file param is the file was not moved.)
  // metadata.name     The name of the icon
  // metadata.unicode  The unicode codepoints corresponding to this glyph. Each should be a 1-codepoint string.
  // metadata.renamed  Wether the original file was moved (e.g. to prefix it with its unicode codepoint)
  metadataProvider: null,
  // Type: Number Default value: MAX(icons.height) The outputted font height (defaults to the height of the highest input icon).
  fontHeight: 1000, // 这个与normalize配合解决精确度问题
  // Type: Boolean Default value: false
  // Normalize icons by scaling them to the height of the highest icon.
  normalize: true,
  prependUnicode: false,
  // Type: Number Default value: 10e12 Setup SVG path rounding.
  round: 10e12,
  startUnicode: 0xEA01,
  template: 'css',
  verbose: false
}