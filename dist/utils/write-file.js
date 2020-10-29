"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
function writeFileAsync(filename, data) {
    return new Promise(function (resolve, reject) {
        var dir = path_1.default.dirname(filename);
        mkdirs(dir);
        fs_1.default.writeFile(filename, data, function (err) {
            !err ? resolve() : reject(err);
        });
    });
}
exports.writeFileAsync = writeFileAsync;
function mkdirs(dirpath) {
    if (!fs_1.default.existsSync(path_1.default.dirname(dirpath))) {
        mkdirs(path_1.default.dirname(dirpath));
    }
    if (!fs_1.default.existsSync(dirpath)) {
        fs_1.default.mkdirSync(dirpath);
    }
}
