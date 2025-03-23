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
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFetch = exports.RefreshTokenError = exports.UnauthenticatedError = void 0;
const access_token_1 = require("./access-token");
class UnauthenticatedError extends Error {
    constructor() {
        super(...arguments);
        this.name = "UnauthenticatedError";
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
class RefreshTokenError extends Error {
    constructor() {
        super(...arguments);
        this.name = "RefreshTokenError";
    }
}
exports.RefreshTokenError = RefreshTokenError;
const API_URL = "https://example.com";
const REFRESH_TOKEN_URL = "https://example.com/api/v2/refresh_token";
const BASE_HEADERS = {
    headers: {
        "Content-Type": "application/json",
    },
};
const serializeBody = (body) => JSON.stringify(body);
const getUrl = (url) => {
    if (url.startsWith("/")) {
        return API_URL + url;
    }
    return API_URL + "/" + url;
};
const getOptions = (options, accessToken) => {
    if (!options) {
        return {
            headers: Object.assign(Object.assign({}, BASE_HEADERS.headers), { Authorization: accessToken ? "Bearer " + accessToken : "" }),
        };
    }
    return Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign(Object.assign({}, BASE_HEADERS.headers), options.headers), { Authorization: accessToken ? "Bearer " + accessToken : "" }) });
};
const getOptionsByMethod = (params) => {
    const { method } = params;
    const accessToken = (0, access_token_1.getAccessToken)();
    switch (method) {
        case "GET" /* RequestMethod.GET */:
            return getOptions(params === null || params === void 0 ? void 0 : params.options, accessToken);
        case "POST" /* RequestMethod.POST */:
            return getOptions(Object.assign(Object.assign({}, params === null || params === void 0 ? void 0 : params.options), { method: method, body: (params === null || params === void 0 ? void 0 : params.body) ? serializeBody(params === null || params === void 0 ? void 0 : params.body) : "" }), accessToken);
        case "PATCH" /* RequestMethod.PATCH */:
            return getOptions(Object.assign(Object.assign({}, params === null || params === void 0 ? void 0 : params.options), { method: method, body: (params === null || params === void 0 ? void 0 : params.body) ? serializeBody(params === null || params === void 0 ? void 0 : params.body) : "" }), accessToken);
        case "PUT" /* RequestMethod.PUT */:
            return getOptions(Object.assign(Object.assign({}, params === null || params === void 0 ? void 0 : params.options), { method: method, body: (params === null || params === void 0 ? void 0 : params.body) ? serializeBody(params === null || params === void 0 ? void 0 : params.body) : "" }), accessToken);
        case "DELETE" /* RequestMethod.DELETE */:
            return getOptions(Object.assign(Object.assign({}, params === null || params === void 0 ? void 0 : params.options), { method: "DELETE" }), accessToken);
    }
};
const refreshToken = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield fetch(REFRESH_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
});
let refreshPromise = null;
function retryFetching(_a) {
    return __awaiter(this, arguments, void 0, function* ({ fetcher, }) {
        if (!refreshPromise) {
            refreshPromise = refreshToken();
        }
        const refreshRes = yield (refreshPromise === null || refreshPromise === void 0 ? void 0 : refreshPromise.finally(() => {
            refreshPromise = null;
        }));
        if (!refreshRes.ok) {
            throw new RefreshTokenError("Refresh token failed in failed");
        }
        try {
            return yield fetcher();
        }
        catch (error) {
            throw error;
        }
    });
}
const fetchingWithJson = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch(getUrl(params.url), getOptionsByMethod(params));
    return yield res.json();
});
const customFetch = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield fetchingWithJson(params);
    }
    catch (error) {
        const parsedError = error;
        if (parsedError instanceof UnauthenticatedError) {
            return yield retryFetching({
                fetcher: () => fetchingWithJson(params),
            });
        }
        throw parsedError;
    }
});
exports.customFetch = customFetch;
exports.default = exports.customFetch;
