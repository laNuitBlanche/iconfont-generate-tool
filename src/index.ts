import fs from 'fs';
import os from 'os';
import path from 'path';
import globby from 'globby';
import nunjucks from 'nunjucks';
import svg2ttf from 'svg2ttf';
import ttf2eot from 'ttf2eot';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2-no-gyp';
import SVGIcons2SVGFontStream from 'svgicons2svgfont';
import getMetadataService from 'svgicons2svgfont/src/metadata';
import { Readable } from 'stream';

import md5 from './utils/md5';
import ThrottleSync from './utils/throttle-sync';
import {
  Result,
  SVGFile,
  SVGMetadataFile,
  TplConfig,
  FontsObject,
  GlobalConfigs,
  IconFontGeneratorConfig,
  SVGIcons2SVGFontStreamConfig
} from './type';
import { writeFileAsync } from './utils/write-file';

const MAX_CONCURRENCY = os.cpus().length;
const PREPEND_UNICODE = false;
const START_UNICODE = 0xEA01;

const defaultConfig: SVGIcons2SVGFontStreamConfig = {
  centerHorizontally: true,
  formats: ['svg', 'ttf', 'eot', 'woff2', 'woff'],
  fontHeight: 1000,
  normalize: true
}

class IconFontGenerator {
  private config: IconFontGeneratorConfig;
  constructor(config: IconFontGeneratorConfig) {
    const requiredParams = ['svgPath', 'outputDir'];
    requiredParams.map(param => {
      if (!config[param]) {
        throw new Error(`缺少必要参数：${param}`);
      }
    });
    this.config = config;
    this.config.cssPrefix = config.cssPrefix || config.fontName || 'icon';
  }
  async generate() {
    try {
      const svgFiles = await this.filterSVGFiles();
      const config = Object.assign({}, defaultConfig, this.config);
      const svgMetadataFiles = await this.addFileMetadata(svgFiles);
      const svg = await this.svgIcon2svgFont(svgMetadataFiles, config);
      const sign = md5(svg).slice(0, 8);
      const result: Result = {
        sign,
        svgMetadataFiles,
        config
      };
      const fonts = this.svgFont2otherFont(svg, config);
      Object.assign(result, fonts);
      const setupFiles = this.generateCssAndHTML(sign, svgMetadataFiles, config);
      Object.assign(result, setupFiles);
      await this.writeFiles(result);
      console.log(`${result.svgMetadataFiles.length} svg icons has been generated`)
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @description 根据路径筛选出所有需要转为字体图标的svg文件列表
   * @returns { Promise<string[]> } - svgFiles
   */
  async filterSVGFiles(): Promise<string[]> {
    const { svgPath } = this.config;
    let svgFilesList = [].concat(svgPath);
    if (svgFilesList.join('|').indexOf('*') !== -1) {
      svgFilesList = await globby(svgFilesList);
    }
    const svgFiles = svgFilesList.filter(file => path.extname(file).toLowerCase() === '.svg');
    if (!svgFiles.length) {
      throw new Error(`Can't found svg file with the config:${this.config.svgPath}`);
    }
    return svgFiles
  }

  /**
   * @description 创建可读流
   * @returns { Promise<SVGFile[]> }
   */
  createReadStreamSync(filePath: string): Promise<SVGFile> {
    return new Promise((resolve, reject) => {
      let content = '';
      const stream = fs.createReadStream(filePath);
      stream.on('data', data => {
        content += data.toString();
      });
      stream.on('end', () => {
        if (content.length === 0) {
          return reject(new Error(`The empty file:${filePath},please check`));
        }
        resolve({
          content,
          filePath
        })
      });
      stream.on('error', error => reject(error));
    })
  }

  /**
   * 
   * @param files -文件列表
   * @description 添加文件metadata信息
   * @returns { Promise<SVGMetadataFile[]>}
   */
  addFileMetadata(files: string[]): Promise<SVGMetadataFile[]> {
    const throttleSync = new ThrottleSync(MAX_CONCURRENCY);
    const sortedFiles = files.sort((a, b) => a > b ? 1 : -1);
    const filesWithMetadata = sortedFiles.map((filePath, index) => {
      return throttleSync.run<SVGMetadataFile>(async () => {
        const svgFiles = await this.createReadStreamSync(filePath);
        return new Promise((resolve, reject) => {
          const metadataProvider = getMetadataService({
            prependUnicode: PREPEND_UNICODE,
            startUnicode: START_UNICODE + index
          });
          metadataProvider(svgFiles.filePath, (err: Error, metadata: string) => {
            if (err) {
              return reject(err);
            }
            return resolve({
              metadata,
              ...svgFiles
            })
          });
        })
      })
    })
    return Promise.all(filesWithMetadata)
  }

  svgIcon2svgFont(data: SVGMetadataFile[], config: GlobalConfigs): Promise<string> {
    let svg = '';
    return new Promise((resolve, reject) => {
      const fontStream = new SVGIcons2SVGFontStream({
        centerHorizontally: config.centerHorizontally,
        fontHeight: config.fontHeight,
        fontName: config.fontName,
        fontWeight: config.fontWeight,
        normalize: config.normalize
      });
      fontStream.on('data', data => {
        svg += data;
      });
      fontStream.on('finish', () => {
        resolve(svg);
      });
      fontStream.on('error', err => {
        reject(err);
      });
      data.forEach(item => {
        const stream = new Readable();
        stream.push(item.content);
        stream.push(null);
        // @ts-ignore
        stream.metadata = item.metadata;
        fontStream.write(stream)
      });
      fontStream.end();
    })
  }

  svgFont2otherFont(svg: string, config: GlobalConfigs): FontsObject {
    const fonts: FontsObject = {};
    const ttf = Buffer.from(svg2ttf(svg.toString(), config.svg2ttfFormatOptions || {}).buffer);
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

  generateCssAndHTML(sign: string, data: SVGMetadataFile[], config: GlobalConfigs & TplConfig) {
    const outputPath = config.outputDir;
    config.cssOutput = config.cssOutput || path.join(outputPath, './style/iconfont.css');
    config.htmlOutput = config.htmlOutput || path.join(outputPath, './iconfont-demo.html');
    config.jsOutput = config.jsOutput || path.join(outputPath, './js/icons.js');
    config.fontOutput = config.fontOutput || path.join(outputPath, './fonts/');

    Object.assign(config,{
      sign: sign,
      htmlCssLink: path.relative(path.dirname(config.htmlOutput), config.cssOutput),
      cssFontLink: path.relative(path.dirname(config.cssOutput), config.fontOutput) + '/'
    })

    const njkConfig = Object.assign({
      data: data.map(item => item.metadata)
    }, JSON.parse(JSON.stringify(config)));

    nunjucks.configure(path.resolve(__dirname, 'template/'), {
      noCache: true
    });

    const jsFileContent = (config.jsPrefix ? `${config.jsPrefix}\n` : '') +'export default '+ JSON.stringify(data.map(item => {
      return {
        name: item.metadata.name,
        unicode: item.metadata.unicode[0].charCodeAt(0).toString(16),
        svg: item.content
      }
    }), null, 4) +'\n';


    const setupFiles = {
      css: nunjucks.render(`css.njk`, njkConfig),
      html: nunjucks.render('html.njk', njkConfig),
      js: jsFileContent
    }
    
    return setupFiles;
  }

  async writeFiles(result: Result) {
    const { config } = result;
    const setupFiles = {};
    config.formats.map(format => {
      const data = result[format];
      if (data) {
        const destFileName = path.resolve(config.fontOutput, `${config.fontName}.${format}`);
        setupFiles[destFileName] = data;
      }
    })

    setupFiles[config.cssOutput] = result.css;

    if (config.htmlOutput) {
      setupFiles[config.htmlOutput] = result.html;
    }
    if (config.jsOutput) {
      setupFiles[config.jsOutput] = result.js;
    }

    return Promise.all(
      Object.keys(setupFiles).map(type => writeFileAsync(type, setupFiles[type]))
    )
  }

}

module.exports = IconFontGenerator;

