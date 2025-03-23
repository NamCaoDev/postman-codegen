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
exports.fetchPostmanApiDocument = void 0;
const constants_1 = require("./constants");
const fetchPostmanApiDocument = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { collectionId, collectionAccessKey } = params;
        const res = yield fetch(`${constants_1.BASE_POSTMAN_DOCUMENT_API_URL}/${collectionId}?access_key=${collectionAccessKey}`);
        const jsonData = yield res.json();
        return jsonData;
    }
    catch (err) {
        console.error(`❌ Error when fetch postman document ${err.message}`);
    }
});
exports.fetchPostmanApiDocument = fetchPostmanApiDocument;
