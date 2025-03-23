"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRefreshToken = exports.setRefreshToken = exports.getRefreshToken = exports.deleteAccessToken = exports.setAccessToken = exports.getAccessToken = exports.REFRESH_TOKEN_KEY = exports.ACCESS_TOKEN_KEY = void 0;
exports.ACCESS_TOKEN_KEY = "access_token";
exports.REFRESH_TOKEN_KEY = "refresh_token";
const getAccessToken = () => {
    var _a;
    return (_a = localStorage.getItem(exports.ACCESS_TOKEN_KEY)) !== null && _a !== void 0 ? _a : undefined;
};
exports.getAccessToken = getAccessToken;
const setAccessToken = (access_token) => {
    localStorage.setItem(exports.ACCESS_TOKEN_KEY, access_token);
};
exports.setAccessToken = setAccessToken;
const deleteAccessToken = () => {
    localStorage.removeItem(exports.ACCESS_TOKEN_KEY);
};
exports.deleteAccessToken = deleteAccessToken;
const getRefreshToken = () => {
    return localStorage.getItem(exports.REFRESH_TOKEN_KEY);
};
exports.getRefreshToken = getRefreshToken;
const setRefreshToken = (refresh_token) => {
    localStorage.setItem(exports.REFRESH_TOKEN_KEY, refresh_token);
};
exports.setRefreshToken = setRefreshToken;
const deleteRefreshToken = () => {
    localStorage.removeItem(exports.REFRESH_TOKEN_KEY);
};
exports.deleteRefreshToken = deleteRefreshToken;
