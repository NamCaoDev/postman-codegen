"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeStringify = exports.cleanUrl = exports.convertToKebabCase = void 0;
exports.isValidJSON = isValidJSON;
exports.transformFormDataToPayloadObject = transformFormDataToPayloadObject;
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
