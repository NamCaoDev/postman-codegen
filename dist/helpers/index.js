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
exports.safeStringify = exports.cleanUrl = exports.convertToKebabCase = void 0;
exports.isValidJSON = isValidJSON;
exports.transformFormDataToPayloadObject = transformFormDataToPayloadObject;
exports.cleanGeneratedFolder = cleanGeneratedFolder;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
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
        .toLowerCase();
};
exports.convertToKebabCase = convertToKebabCase;
function transformFormDataToPayloadObject(arr) {
    return arr.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {});
}
const cleanUrl = (url) => {
    return url === null || url === void 0 ? void 0 : url.replace(/^[^\/]+\/+/, "/").split("?")[0];
};
exports.cleanUrl = cleanUrl;
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
        }
        catch (error) {
            console.error("❌ Error cleaning generated folder:", error);
        }
    });
}
