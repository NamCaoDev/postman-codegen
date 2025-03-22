"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeStringify = exports.cleanSpecialCharacter = exports.cleanUrl = exports.convertToKebabCase = void 0;
exports.isValidJSON = isValidJSON;
exports.transformFormDataToPayloadObject = transformFormDataToPayloadObject;
exports.replaceQuicktypeSpecialWords = replaceQuicktypeSpecialWords;
exports.cleanGeneratedFolder = cleanGeneratedFolder;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
function isValidJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    }
    catch (e) {
        return false;
    }
}
const convertToKebabCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/\s+/g, "-")
        .toLowerCase();
};
exports.convertToKebabCase = convertToKebabCase;
function transformFormDataToPayloadObject(arr) {
    return arr.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {});
}
function toPascalCase(str) {
    var _a, _b, _c;
    const specialWords = new Set(constants_1.QUICK_TYPE_SPECIAL_CHARACTERS);
    return (_c = (_b = (_a = str === null || str === void 0 ? void 0 : str.split(/\s+/)) === null || _a === void 0 ? void 0 : _a.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())) === null || _b === void 0 ? void 0 : _b.map(word => {
        let lower = word.toLowerCase();
        return specialWords.has(lower) ? lower.toUpperCase() : word;
    })) === null || _c === void 0 ? void 0 : _c.join('');
}
const cleanUrl = (url) => {
    return url === null || url === void 0 ? void 0 : url.replace(/^[^\/]+\/+/, "/").split("?")[0];
};
exports.cleanUrl = cleanUrl;
function replaceQuicktypeSpecialWords(str) {
    return str.replace(/\b(api|id|http|url|json|xml|html|sql)\b/gi, (match) => match.toUpperCase());
}
const cleanSpecialCharacter = (text, options) => {
    const cleanText = text === null || text === void 0 ? void 0 : text.replace(/[^a-zA-Z0-9\s]/g, (options === null || options === void 0 ? void 0 : options.transformSpace) ? ' ' : '');
    return (options === null || options === void 0 ? void 0 : options.pascalCase) ? toPascalCase(cleanText) : cleanText;
};
exports.cleanSpecialCharacter = cleanSpecialCharacter;
const safeStringify = (json) => {
    return JSON.stringify(json, (_, value) => typeof value === "undefined"
        ? null
        : typeof value === "bigint"
            ? value.toString()
            : value, 2);
};
exports.safeStringify = safeStringify;
function cleanGeneratedFolder(generatedFolderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const GENERATED_FOLDER = path_1.default.join(process.cwd(), generatedFolderPath);
        try {
            if (yield fs_extra_1.default.pathExists(GENERATED_FOLDER)) {
                console.log("🧹 Cleaning up generated folder...");
                yield fs_extra_1.default.remove(GENERATED_FOLDER);
                console.log("✅ Cleaned generated folder.");
            }
            yield fs_extra_1.default.mkdirp(GENERATED_FOLDER);
            console.log('📂 Created fresh generated folder');
        }
        catch (error) {
            console.error("❌ Error cleaning generated folder:", error);
        }
    });
}
