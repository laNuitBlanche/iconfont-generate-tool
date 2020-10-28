import fs from 'fs';
import path from 'path';
import globby from 'globby';
import SVGIcons2SVGFontStream from 'svgicons2svgfont';
import getMetadataService from 'svgicons2svgfont/src/metadata';
import svg2ttf from 'svg2ttf';
import ttf2eot from 'ttf2eot';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2-no-gyp';
import nunjucks from 'nunjucks';
import { Readable } from 'stream';

import md5 from './utils/md5';
import AsyncThrottle from './utils/async-throttle';
import defaultConfig from './config/config';
import { writeFileAsync } from './utils/write-file';

interface IconFontGeneratorConfig {
  svgEntryPath: string;
  outputPath?: {
    css?: string;
    html?: string;
    js?: string;
    font?: string;
  };
  fontName?: string;
  cssPrefix?: string;
  jsPrefix?: string;
}

interface Result extends CSSHTMLConfig {
  sign: string;
  data: GlyphData[];
  config: GlobalConfigs;
}

interface CSSHTMLConfig {
  css?: string;
  html?: string;
  js?: string;
}
interface NjkConfig {
  htmlCssFile?: string;
  sign?: string;
  cssFontPath?: string;
}

interface FontsObject {
  eot?: Buffer;
  svg?: string;
  ttf?: Buffer;
  woff?: Buffer;
  woff2?: Buffer;
}

// 具体配置项参见https://github.com/fontello/svg2ttf
interface SVG2TTFFormatOptions {
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

type FontType = 'svg' | 'ttf' | 'eot' | 'woff2' | 'woff';

interface Metadata {
  name: string;
  path: string;
  unicode: string[];
  renamed: boolean;
}

interface IconFontGeneratorOptions {
  ascent?: number;
  centerHorizontally: boolean;
  descent: number;
  fixedWidth: boolean;
  fontId?: string;
  fontName?: string;
  fontStyle?: string;
  fontWeight?: string;
  formats: string[];
  formatsOptions: {
    ttf: SVG2TTFFormatOptions;
  };
  metadata?: Metadata;
  fontHeight: number;
  normalize: boolean;
  round: number;
  template: string;
  verbose: boolean;
  maxConcurrency: number;
  prependUnicode: boolean;
  startUnicode: number;
  metadataProvider?: Function;
  glyphTransformFn?: Function;
}

type GlobalConfigs = IconFontGeneratorConfig & IconFontGeneratorOptions;

interface GlyphData {
  content: string;
  filePath: string;
  metadata?: Metadata;
}



export default class IconFontGenerator {
  private config: IconFontGeneratorConfig;
  constructor(config: IconFontGeneratorConfig) {
    this.config = config;
  }
  async generate() {
    try {
      const svgFiles = await this.formatFilePath();
      const config = Object.assign({}, defaultConfig, this.config);
      const data = await this.getGlyphDatas(svgFiles, config);
      const resConfig = Object.assign({}, defaultConfig, this.config, { cssPrefix: this.config.cssPrefix || this.config.fontName });

      const svg = await this.svgIcon2svgFont(data, resConfig);
      const sign = md5(svg).slice(0, 8);
      const result: Result = {
        sign,
        data,
        config
      };
      const fonts = this.svgFont2otherFont(svg, config);
      Object.assign(result, fonts);
      const cssHtml = this.generateCssAndHTML(sign, data, config);
      Object.assign(result, cssHtml);
      await this.writeFiles(result);
      console.log(`${result.data.length} svg icons has been generated`)
    } catch (error) {
      console.log(error);
    }

  }

  formatFilePath() {
    const { svgEntryPath } = this.config;
    const svgFilesArr = [].concat(svgEntryPath);
    if (svgFilesArr.join('|').indexOf('*') !== -1) {
      return globby(svgFilesArr).then(this.filterSvgFiles);
    }
    return Promise.resolve(this.filterSvgFiles(svgFilesArr));
  }

  filterSvgFiles(files: string[]) {
    const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');
    if (!svgFiles.length) {
      throw new Error(`Can't found svg file with the config:${this.config.svgEntryPath}`);
    }
    return svgFiles
  }

  async createReadStream(filePath: string): Promise<GlyphData> {
    return new Promise((resolve, reject) => {
      let content = '';
      fs.createReadStream(filePath)
        .on('data', data => {
          content += data.toString();
        })
        .on('end', () => {
          if (content.length === 0) {
            return reject(new Error(`The empty file:${filePath},please check`));
          }
          resolve({
            content,
            filePath
          })
        })
        .on('error', error => reject(error))
    })
  }

  async getGlyphDatas(files: string[], config: GlobalConfigs): Promise<GlyphData[]> {
    const asyncThrottle = new AsyncThrottle(config.maxConcurrency);
    const sortedFiles = files.sort((a, b) => a > b ? 1 : -1);
    return Promise.all(
      sortedFiles.map((filePath, index) => {
        return asyncThrottle.run<GlyphData>(async () => {
          const data = await this.createReadStream(filePath);
          return new Promise((resolve, reject) => {
            const metadataProvider = config.metadataProvider || getMetadataService({
              prependUnicode: config.prependUnicode,
              startUnicode: config.startUnicode + index
            });
            metadataProvider(data.filePath, (err: Error, metadata: string) => {
              if (err) {
                return reject(err);
              }
              return resolve({
                metadata,
                ...data
              })
            });
          })
        })
      })
    )
  }

  async svgIcon2svgFont(data: GlyphData[], config: GlobalConfigs): Promise<string> {
    let svg = '';
    return new Promise((resolve, reject) => {
      const fontStream = new SVGIcons2SVGFontStream({
        ascent: config.ascent,
        centerHorizontally: config.centerHorizontally,
        descent: config.descent,
        fixedWidth: config.fixedWidth,
        fontHeight: config.fontHeight,
        fontId: config.fontId,
        fontName: config.fontName,
        fontStyle: config.fontStyle,
        fontWeight: config.fontWeight,
        log: config.verbose ? console.log.bind(console) : () => { },
        metadata: config.metadata,
        normalize: config.normalize,
        round: config.round
      })
        .on('data', data => {
          svg += data;
        })
        .on('finish', () => {
          resolve(svg);
        })
        .on('error', err => {
          reject(err);
        });
      data.forEach(item => {
        const stream = new Readable();
        stream.push(item.content);
        stream.push(null);
        fontStream.write(stream)
      })
      fontStream.end();

    })
  }

  svgFont2otherFont(svg: string, config: GlobalConfigs): FontsObject {
    const fonts: FontsObject = {};
    const ttf = Buffer.from(svg2ttf(svg.toString(), (config.formatsOptions && config.formatsOptions.ttf) || {}).buffer);
    if (config.formats.includes('eot')) {
      fonts.eot = Buffer.from(ttf2eot(ttf).buffer)
    }
    if (config.formats.includes('svg')) {
      fonts.svg = svg;
    }
    if (config.formats.includes('ttf')) {
      fonts.ttf = ttf;
    }
    if (config.formats.includes('woff')) {
      fonts.woff = Buffer.from(ttf2woff(ttf, { metadata: config.metadata }).buffer);
    }
    if (config.formats.includes('woff2')) {
      fonts.woff2 = ttf2woff2(ttf);
    }
    return fonts;
  }

  generateCssAndHTML(sign: string, data: GlyphData[], config: GlobalConfigs & NjkConfig) {
    const cssTplFile = !fs.existsSync(config.template)
      ? path.resolve(__dirname, `template/${config.template}.njk`)
      : config.template;
    const htmlTplFile = path.resolve(__dirname, 'template/html.njk');
    if (config.outputPath) {
      if (!config.outputPath.html) {
        config.outputPath.html = path.join(path.dirname(config.outputPath.css), '_font-preview.html');
      }
      config.htmlCssFile = path.relative(path.dirname(config.outputPath.html), config.outputPath.css);
      config.cssFontPath = config.cssFontPath || path.relative(path.dirname(config.outputPath.css), config.outputPath.font);
      config.cssFontPath += '/';
    }
    config.sign = sign;

    const njkConfig = Object.assign({
      data: data.map(item => {
        if (typeof config.glyphTransformFn === 'function') {
          config.glyphTransformFn(item.metadata);
        }
        return item.metadata;
      })
    }, JSON.parse(JSON.stringify(config)))
    const cssHtml: CSSHTMLConfig = {
      css: nunjucks.render(cssTplFile, njkConfig)
    }
    if (config.outputPath.html) {
      cssHtml.html = nunjucks.render(htmlTplFile, njkConfig)
    }
    if (config.outputPath.js) {
      const json = JSON.stringify(data.map(item => {
        return {
          name: item.metadata.name,
          unicode: item.metadata.unicode[0].charCodeAt(0).toString(16),
          svg: item.content
        }
      }), null, 4);
      const prefix = config.jsPrefix || '/* eslint-disable */\n';
      cssHtml.js = prefix + 'export default ' + json + '\n';
    }
    return cssHtml;
  }

  async writeFiles(result: Result) {
    const { config } = result;
    const fnDatas = {};
    config.formats.map(format => {
      const data = result[format];
      if (data) {
        const destFileName = path.resolve(config.outputPath.font, `${config.fontName}.${format}`);
        fnDatas[destFileName] = data;
      }
    })

    fnDatas[config.outputPath.css] = result.css;

    if (config.outputPath.html) {
      fnDatas[config.outputPath.html] = result.html;
    }
    if (config.outputPath.js) {
      fnDatas[config.outputPath.js] = result.js;
    }

    return Promise.all(
      Object.keys(fnDatas).map(fn => writeFileAsync(fn, fnDatas[fn]))
    )
  }

}

