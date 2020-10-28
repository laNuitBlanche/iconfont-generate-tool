export interface IconFontGeneratorConfig {
  svgPath: string;
  outputDir: string;
  cssOutput?: string;
  htmlOutput?: string;
  jsOutput?: string;
  fontOutput?: string;
  fontName?: string;
  cssPrefix?: string;
  jsPrefix?: string;
  svg2ttfFormatOptions?: SVG2TTFFormatOptions;
}

export interface Result extends SetupFiles {
  sign: string;
  svgMetadataFiles: SVGMetadataFile[];
  config: GlobalConfigs;
}

export interface SetupFiles {
  css?: string;
  html?: string;
  js?: string;
}
export interface TplConfig {
  htmlCssLink?: string;
  sign?: string;
  cssFontLink?: string;
}

export interface FontsObject {
  eot?: Buffer;
  svg?: string;
  ttf?: Buffer;
  woff?: Buffer;
  woff2?: Buffer;
}

// 具体配置项参见https://github.com/fontello/svg2ttf
export interface SVG2TTFFormatOptions {
  //  copyright string (optional)
  copyright?: string;
  // description string (optional)
  description?: string;
  // Unix timestamp (in seconds) to override creation time (optional)
  ts?: number;
  // manufacturer url (optional)
  url?: string;
  // font version string, can be Version x.y or x.y.
  version?: string;
}

export type FontType = 'svg' | 'ttf' | 'eot' | 'woff2' | 'woff';

export interface Metadata {
  name: string;
  path: string;
  unicode: string[];
  renamed: boolean;
}

// 具体配置项参见https://github.com/nfroidure/svgicons2svgfont
export interface SVGIcons2SVGFontStreamConfig {
  // Type: Number Default value: fontHeight - descent
  // The font ascent. Use this options only if you know what you're doing. A suitable value for this is computed for you.
  ascent?: number;
  // Type: Boolean Default value: false
  // Calculate the bounds of a glyph and center it horizontally.
  centerHorizontally?: boolean;
  // Type: Number Default value: 0
  // The font descent. It is usefull to fix the font baseline yourself.
  // Warning: The descent is a positive value!
  descent?: number;
  // Type: Boolean Default value: false
  // Creates a monospace font of the width of the largest input icon.
  fixedWidth?: boolean;
  // The font id you want.
  // Type: String Default value: the options.fontName value
  fontId?: string;
  // The font family name you want.
  // Type: String Default value: 'iconfont'
  fontName?: string;
  // Type: String Default value: ''
  // The font style you want.
  fontStyle?: string;
  // Type: String Default value: ''
  // The font weight you want.
  fontWeight?: string;
  formats: FontType[];
  // Type: String Default value: undefined
  // The font metadata. You can set any character data in but it is the be suited place for a copyright mention.
  metadata?: Metadata;
  // Type: Number Default value: MAX(icons.height) The outputted font height (defaults to the height of the highest input icon).
  fontHeight?: number;
  // Type: Boolean Default value: false
  // Normalize icons by scaling them to the height of the highest icon.
  normalize?: boolean;
  // Type: Number Default value: 10e12 Setup SVG path rounding.
  round?: number;
  // Type: (file: string, cb: (err: any, metadata: {file: string, name: string, unicode: string[], renamed: boolean}) => void
  // Default value: require('svgicons2svgfont/src/metadata')(options)
  // A function which determines the metadata for an icon. It takes a parameter file with an icon svg and should return icon metadata (asynchronously) via the callback function. You can use this function to provide custom logic for svg to codepoint mapping.
  // metadata.path     The path to the icon file. (The original file param is the file was not moved.)
  // metadata.name     The name of the icon
  // metadata.unicode  The unicode codepoints corresponding to this glyph. Each should be a 1-codepoint string.
  // metadata.renamed  Wether the original file was moved (e.g. to prefix it with its unicode codepoint)
  metadataProvider?: Function;
  glyphTransformFn?: Function;
}

export type GlobalConfigs = IconFontGeneratorConfig & SVGIcons2SVGFontStreamConfig;

export interface SVGFile {
  content: string;
  filePath: string;
}

export interface SVGMetadataFile extends SVGFile {
  metadata: Metadata;
}