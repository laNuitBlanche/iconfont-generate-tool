"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var globby_1 = __importDefault(require("globby"));
var nunjucks_1 = __importDefault(require("nunjucks"));
var svg2ttf_1 = __importDefault(require("svg2ttf"));
var ttf2eot_1 = __importDefault(require("ttf2eot"));
var ttf2woff_1 = __importDefault(require("ttf2woff"));
var ttf2woff2_no_gyp_1 = __importDefault(require("ttf2woff2-no-gyp"));
var svgicons2svgfont_1 = __importDefault(require("svgicons2svgfont"));
var metadata_1 = __importDefault(require("svgicons2svgfont/src/metadata"));
var stream_1 = require("stream");
var md5_1 = __importDefault(require("./utils/md5"));
var throttle_sync_1 = __importDefault(require("./utils/throttle-sync"));
var write_file_1 = require("./utils/write-file");
var MAX_CONCURRENCY = os_1.default.cpus().length;
var PREPEND_UNICODE = false;
var START_UNICODE = 0xEA01;
var defaultConfig = {
    centerHorizontally: true,
    formats: ['svg', 'ttf', 'eot', 'woff2', 'woff'],
    fontHeight: 1000,
    normalize: true
};
var IconFontGenerator = /** @class */ (function () {
    function IconFontGenerator(config) {
        var requiredParams = ['svgPath', 'outputDir'];
        requiredParams.map(function (param) {
            if (!config[param]) {
                throw new Error("\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570\uFF1A" + param);
            }
        });
        this.config = config;
        this.config.cssPrefix = config.cssPrefix || config.fontName || 'icon';
    }
    IconFontGenerator.prototype.generate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var svgFiles, config, svgMetadataFiles, svg, sign, result, fonts, setupFiles, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.filterSVGFiles()];
                    case 1:
                        svgFiles = _a.sent();
                        config = Object.assign({}, defaultConfig, this.config);
                        return [4 /*yield*/, this.addFileMetadata(svgFiles)];
                    case 2:
                        svgMetadataFiles = _a.sent();
                        return [4 /*yield*/, this.svgIcon2svgFont(svgMetadataFiles, config)];
                    case 3:
                        svg = _a.sent();
                        sign = md5_1.default(svg).slice(0, 8);
                        result = {
                            sign: sign,
                            svgMetadataFiles: svgMetadataFiles,
                            config: config
                        };
                        fonts = this.svgFont2otherFont(svg, config);
                        Object.assign(result, fonts);
                        setupFiles = this.generateCssAndHTML(sign, svgMetadataFiles, config);
                        Object.assign(result, setupFiles);
                        return [4 /*yield*/, this.writeFiles(result)];
                    case 4:
                        _a.sent();
                        console.log(result.svgMetadataFiles.length + " svg icons has been generated");
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @description 根据路径筛选出所有需要转为字体图标的svg文件列表
     * @returns { Promise<string[]> } - svgFiles
     */
    IconFontGenerator.prototype.filterSVGFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var svgPath, svgFilesList, svgFiles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        svgPath = this.config.svgPath;
                        svgFilesList = [].concat(svgPath);
                        if (!(svgFilesList.join('|').indexOf('*') !== -1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, globby_1.default(svgFilesList)];
                    case 1:
                        svgFilesList = _a.sent();
                        _a.label = 2;
                    case 2:
                        svgFiles = svgFilesList.filter(function (file) { return path_1.default.extname(file).toLowerCase() === '.svg'; });
                        if (!svgFiles.length) {
                            throw new Error("Can't found svg file with the config:" + this.config.svgPath);
                        }
                        return [2 /*return*/, svgFiles];
                }
            });
        });
    };
    /**
     * @description 创建可读流
     * @returns { Promise<SVGFile[]> }
     */
    IconFontGenerator.prototype.createReadStreamSync = function (filePath) {
        return new Promise(function (resolve, reject) {
            var content = '';
            var stream = fs_1.default.createReadStream(filePath);
            stream.on('data', function (data) {
                content += data.toString();
            });
            stream.on('end', function () {
                if (content.length === 0) {
                    return reject(new Error("The empty file:" + filePath + ",please check"));
                }
                resolve({
                    content: content,
                    filePath: filePath
                });
            });
            stream.on('error', function (error) { return reject(error); });
        });
    };
    /**
     *
     * @param files -文件列表
     * @description 添加文件metadata信息
     * @returns { Promise<SVGMetadataFile[]>}
     */
    IconFontGenerator.prototype.addFileMetadata = function (files) {
        var _this = this;
        var throttleSync = new throttle_sync_1.default(MAX_CONCURRENCY);
        var sortedFiles = files.sort(function (a, b) { return a > b ? 1 : -1; });
        var filesWithMetadata = sortedFiles.map(function (filePath, index) {
            return throttleSync.run(function () { return __awaiter(_this, void 0, void 0, function () {
                var svgFiles;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.createReadStreamSync(filePath)];
                        case 1:
                            svgFiles = _a.sent();
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var metadataProvider = metadata_1.default({
                                        prependUnicode: PREPEND_UNICODE,
                                        startUnicode: START_UNICODE + index
                                    });
                                    metadataProvider(svgFiles.filePath, function (err, metadata) {
                                        if (err) {
                                            return reject(err);
                                        }
                                        return resolve(__assign({ metadata: metadata }, svgFiles));
                                    });
                                })];
                    }
                });
            }); });
        });
        return Promise.all(filesWithMetadata);
    };
    IconFontGenerator.prototype.svgIcon2svgFont = function (data, config) {
        var svg = '';
        return new Promise(function (resolve, reject) {
            var fontStream = new svgicons2svgfont_1.default({
                centerHorizontally: config.centerHorizontally,
                fontHeight: config.fontHeight,
                fontName: config.fontName,
                fontWeight: config.fontWeight,
                normalize: config.normalize
            });
            fontStream.on('data', function (data) {
                svg += data;
            });
            fontStream.on('finish', function () {
                resolve(svg);
            });
            fontStream.on('error', function (err) {
                reject(err);
            });
            data.forEach(function (item) {
                var stream = new stream_1.Readable();
                stream.push(item.content);
                stream.push(null);
                // @ts-ignore
                stream.metadata = item.metadata;
                fontStream.write(stream);
            });
            fontStream.end();
        });
    };
    IconFontGenerator.prototype.svgFont2otherFont = function (svg, config) {
        var fonts = {};
        var ttf = Buffer.from(svg2ttf_1.default(svg.toString(), config.svg2ttfFormatOptions || {}).buffer);
        if (config.formats.includes('eot')) {
            fonts.eot = Buffer.from(ttf2eot_1.default(ttf).buffer);
        }
        if (config.formats.includes('svg')) {
            fonts.svg = svg;
        }
        if (config.formats.includes('ttf')) {
            fonts.ttf = ttf;
        }
        if (config.formats.includes('woff')) {
            fonts.woff = Buffer.from(ttf2woff_1.default(ttf, { metadata: config.metadata }).buffer);
        }
        if (config.formats.includes('woff2')) {
            fonts.woff2 = ttf2woff2_no_gyp_1.default(ttf);
        }
        return fonts;
    };
    IconFontGenerator.prototype.generateCssAndHTML = function (sign, data, config) {
        var outputPath = config.outputDir;
        config.cssOutput = config.cssOutput || path_1.default.join(outputPath, './style/iconfont.css');
        config.htmlOutput = config.htmlOutput || path_1.default.join(outputPath, './iconfont-demo.html');
        config.jsOutput = config.jsOutput || path_1.default.join(outputPath, './js/icons.js');
        config.fontOutput = config.fontOutput || path_1.default.join(outputPath, './fonts/');
        Object.assign(config, {
            sign: sign,
            htmlCssLink: path_1.default.relative(path_1.default.dirname(config.htmlOutput), config.cssOutput),
            cssFontLink: path_1.default.relative(path_1.default.dirname(config.cssOutput), config.fontOutput) + '/'
        });
        var njkConfig = Object.assign({
            data: data.map(function (item) { return item.metadata; })
        }, JSON.parse(JSON.stringify(config)));
        nunjucks_1.default.configure(path_1.default.resolve(__dirname, 'template/'), {
            noCache: true
        });
        var jsFileContent = (config.jsPrefix ? config.jsPrefix + "\n" : '') + 'export default ' + JSON.stringify(data.map(function (item) {
            return {
                name: item.metadata.name,
                unicode: item.metadata.unicode[0].charCodeAt(0).toString(16),
                svg: item.content
            };
        }), null, 4) + '\n';
        var setupFiles = {
            css: nunjucks_1.default.render("css.njk", njkConfig),
            html: nunjucks_1.default.render('html.njk', njkConfig),
            js: jsFileContent
        };
        return setupFiles;
    };
    IconFontGenerator.prototype.writeFiles = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var config, setupFiles;
            return __generator(this, function (_a) {
                config = result.config;
                setupFiles = {};
                config.formats.map(function (format) {
                    var data = result[format];
                    if (data) {
                        var destFileName = path_1.default.resolve(config.fontOutput, config.fontName + "." + format);
                        setupFiles[destFileName] = data;
                    }
                });
                setupFiles[config.cssOutput] = result.css;
                if (config.htmlOutput) {
                    setupFiles[config.htmlOutput] = result.html;
                }
                if (config.jsOutput) {
                    setupFiles[config.jsOutput] = result.js;
                }
                return [2 /*return*/, Promise.all(Object.keys(setupFiles).map(function (type) { return write_file_1.writeFileAsync(type, setupFiles[type]); }))];
            });
        });
    };
    return IconFontGenerator;
}());
module.exports = IconFontGenerator;
