"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
function md5(str) {
    var md5 = crypto_1.default.createHash('md5');
    md5.update(str);
    return md5.digest('hex');
}
exports.default = md5;
