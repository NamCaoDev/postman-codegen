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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const quicktype_core_1 = require("quicktype-core");
const fast_glob_1 = __importDefault(require("fast-glob"));
const lodash_1 = __importDefault(require("lodash"));
const network_1 = require("./utils/network");
const utils_1 = require("./utils");
const LIBRARY_ROOT = path_1.default.resolve(__dirname);
const configPath = path_1.default.resolve(process.cwd(), "codegen.config.cjs");
if (!fs_1.default.existsSync(configPath)) {
    console.error("❌ Missing codegen.config.js file. Please create one.");
    process.exit(1);
}
let codegenConfig;
if (fs_1.default.existsSync(configPath)) {
    if (configPath.endsWith(".cjs")) {
        codegenConfig = require(configPath);
    }
    else if (configPath.endsWith(".json")) {
        codegenConfig = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
    }
    else {
        console.error("❌ Unsupported config format. Use .js or .json.");
        process.exit(1);
    }
}
else {
    console.error("❌ Missing codegen.config file.");
    process.exit(1);
}
if (!codegenConfig) {
    throw new Error("❌ codegenConfig is undefined. Check config loading logic.");
}
try {
    // Validate config
    const validatedConfig = utils_1.CodegenConfigSchema.parse(codegenConfig);
    console.log("✅ Codegen Config Loaded:", validatedConfig);
}
catch (err) {
    console.error("❌ Config error:", err.errors);
    process.exit(1); // Exit process
}
// Base config Nodejs
const BUFFER_ENDCODING = "utf-8";
// Generate Mode
const GENERATE_TYPE = (_a = codegenConfig.generateType) !== null && _a !== void 0 ? _a : utils_1.GenerateTypeEnum.Seperate;
const GENERATE_MODE = codegenConfig.generateMode;
// Common Path Generate Config
const POSTMAN_JSON_PATH = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.postmanJsonPath;
const POSTMAN_FETCH_CONFIGS = {
    collectionId: (_b = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.postmanFetchConfigs) === null || _b === void 0 ? void 0 : _b.collectionId,
    collectionAccessKey: (_c = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.postmanFetchConfigs) === null || _c === void 0 ? void 0 : _c.collectionAccessKey
};
const GENERATE_PATH = codegenConfig.generateOutputPath;
// Files Name Generate config
const REQUEST_TYPE_FILE_NAME = (_e = (_d = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _d === void 0 ? void 0 : _d.requestType) !== null && _e !== void 0 ? _e : "apiRequests.ts";
const QUERY_TYPE_FILE_NAME = (_g = (_f = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _f === void 0 ? void 0 : _f.queryType) !== null && _g !== void 0 ? _g : "apiQueries.ts";
const RESPONSE_TYPE_FILE_NAME = (_j = (_h = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _h === void 0 ? void 0 : _h.responseType) !== null && _j !== void 0 ? _j : "apiResponses.ts";
const QUERY_GENERATE_FILE_NAME = (_l = (_k = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _k === void 0 ? void 0 : _k.queryOptions) !== null && _l !== void 0 ? _l : "query.ts";
const MUTATION_GENERATE_FILE_NAME = (_o = (_m = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _m === void 0 ? void 0 : _m.mutationOptions) !== null && _o !== void 0 ? _o : "mutation.ts";
const COMBINE_TYPE_FILE_NAME = "types.gen.ts";
const COMBINE_QUERY_FILE_NAME = "tanstack-query.gen.ts";
// Types Configs
const TYPE_CONFIGS = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.typeConfigs;
// Plop Generate Config
const PLOP_TEMPLATE_FOLDER_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates");
const PLOP_TEMPLATE_QUERY_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates/query.hbs");
const PLOP_TEMPLATE_QUERY_WITH_PARAMS_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates/queryWithParams.hbs");
const PLOP_TEMPLATE_MUTATION_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates/mutation.hbs");
const PLOP_TEMPLATE_COMBINE_QUERY_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates/combineQuery.hbs");
const PLOP_ACTION_GENERATE_NAME = "generate-queries" /* CONFIG_ARGS_NAME.PLOP_ACTION */;
const PLOP_DESCRIPTION_GENERATE = "Generate TanStack QueryOptions, MutationOptions, and QueryParams";
const PROPERTY_API_GET_LIST = codegenConfig.propertyApiGetList;
const FETCHER_LINK = codegenConfig.fetcher;
// Check Config options
const IS_MATCH_PLOP_ACTION_ARG = process.argv.includes(`${"generate-queries" /* CONFIG_ARGS_NAME.PLOP_ACTION */}`);
const IS_GENERATE_ZOD_FILE = (_p = codegenConfig.enableZodGeneration) !== null && _p !== void 0 ? _p : false;
const generateTypeScriptType = (jsonData, typeName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonInput = (0, quicktype_core_1.jsonInputForTargetLanguage)("typescript");
        const safeJsonString = (0, utils_1.safeStringify)(jsonData);
        yield jsonInput.addSource({
            name: typeName,
            samples: [safeJsonString],
        });
        const inputData = new quicktype_core_1.InputData();
        inputData.addInput(jsonInput);
        const { lines } = yield (0, quicktype_core_1.quicktype)(Object.assign({ inputData, lang: "typescript", rendererOptions: {
                "just-types": "true",
            } }, TYPE_CONFIGS));
        if (TYPE_CONFIGS === null || TYPE_CONFIGS === void 0 ? void 0 : TYPE_CONFIGS.allPropertiesOptional) {
            return lines
                .join("\n")
                .replace(/:(\s+)null;/gm, ":$1unknown;")
                .replace(/:((?!.*(null|unknown).*).*);/gm, ":$1 | null;");
        }
        return lines.join("\n");
    }
    catch (err) {
        console.error("❌ Error in generateTypeScriptType:", err);
        console.error("❌ Stack Trace:", err.stack);
    }
});
const reduceDataFromPostmanData = (postmanDataObj) => {
    if (lodash_1.default.isObject(postmanDataObj)) {
        postmanDataObj[postmanDataObj["name"]] = Object.assign({}, postmanDataObj);
        return Object.assign({}, Object.entries(postmanDataObj).reduce((acc, [key, value]) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            if (value.request) {
                acc[key] = {
                    method: value.request.method,
                    formdata: !lodash_1.default.isEmpty((_a = value.request.body) === null || _a === void 0 ? void 0 : _a.formdata)
                        ? (_b = value.request.body) === null || _b === void 0 ? void 0 : _b.formdata
                        : (_f = (_e = (_d = (_c = value.response) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.originalRequest) === null || _e === void 0 ? void 0 : _e.body) === null || _f === void 0 ? void 0 : _f.formdata,
                    rawBodyRequest: (0, utils_1.isValidJSON)((_g = value.request.body) === null || _g === void 0 ? void 0 : _g.raw)
                        ? (_h = value.request.body) === null || _h === void 0 ? void 0 : _h.raw
                        : (0, utils_1.isValidJSON)((_m = (_l = (_k = (_j = value.response) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.originalRequest) === null || _l === void 0 ? void 0 : _l.body) === null || _m === void 0 ? void 0 : _m.raw)
                            ? (_r = (_q = (_p = (_o = value.response) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.originalRequest) === null || _q === void 0 ? void 0 : _q.body) === null || _r === void 0 ? void 0 : _r.raw
                            : null,
                    queryParams: value.request.url.query || null,
                    response: ((_t = (_s = value.response) === null || _s === void 0 ? void 0 : _s[0]) === null || _t === void 0 ? void 0 : _t.body) || null,
                    url: value.request.url.raw,
                };
            }
            return acc;
        }, {}));
    }
};
const handleApiEndpoints = (postmanData) => {
    let endpoints = {};
    if (postmanData.item) {
        postmanData.item.forEach((childItem) => {
            endpoints = Object.assign(Object.assign({}, endpoints), handleApiEndpoints(childItem));
        });
    }
    else {
        endpoints = Object.assign(Object.assign({}, endpoints), lodash_1.default.cloneDeep(reduceDataFromPostmanData(postmanData)));
    }
    return endpoints;
};
const getPlopSeperateActions = (apiEndpoints, outputDir) => __awaiter(void 0, void 0, void 0, function* () {
    const actions = [];
    for (const [entity, apiData] of Object.entries(apiEndpoints)) {
        const entityTextValid = (0, utils_1.cleanSpecialCharacter)(entity, { transformSpace: true, pascalCase: true });
        const folderPath = path_1.default.join(outputDir, (0, utils_1.convertToKebabCase)(entityTextValid));
        let apiDataHasItems = false;
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        if (!lodash_1.default.isEmpty(apiData.formdata)) {
            const requestTypeContent = yield generateTypeScriptType((0, utils_1.transformFormDataToPayloadObject)(apiData.formdata), `${entityTextValid}Request`);
            fs_1.default.writeFileSync(path_1.default.join(folderPath, REQUEST_TYPE_FILE_NAME), requestTypeContent, BUFFER_ENDCODING);
        }
        if (lodash_1.default.isEmpty(apiData.formdata) && !lodash_1.default.isEmpty(apiData.rawBodyRequest)) {
            const requestTypeContent = yield generateTypeScriptType(JSON.parse(apiData.rawBodyRequest), `${entityTextValid}Request`);
            fs_1.default.writeFileSync(path_1.default.join(folderPath, REQUEST_TYPE_FILE_NAME), requestTypeContent, BUFFER_ENDCODING);
        }
        if (apiData.queryParams) {
            const queryParamsTypeContent = yield generateTypeScriptType((0, utils_1.transformFormDataToPayloadObject)(apiData.queryParams), `${entityTextValid}QueryParams`);
            fs_1.default.writeFileSync(path_1.default.join(folderPath, QUERY_TYPE_FILE_NAME), queryParamsTypeContent, BUFFER_ENDCODING);
        }
        if (!lodash_1.default.isEmpty(apiData.response)) {
            const responseTypeContent = yield generateTypeScriptType(JSON.parse(apiData.response), `${entityTextValid}Response`);
            if (typeof responseTypeContent === "string" &&
                responseTypeContent.includes(`${PROPERTY_API_GET_LIST}:`)) {
                apiDataHasItems = true;
            }
            fs_1.default.writeFileSync(path_1.default.join(folderPath, RESPONSE_TYPE_FILE_NAME), responseTypeContent, BUFFER_ENDCODING);
        }
        if (apiData.method === "GET" || apiData.method === "DELETE") {
            if (apiData.queryParams) {
                actions.push({
                    type: "add",
                    path: `${folderPath}/${QUERY_GENERATE_FILE_NAME}`,
                    templateFile: PLOP_TEMPLATE_QUERY_WITH_PARAMS_PATH,
                    force: true,
                    data: {
                        generateType: GENERATE_TYPE,
                        name: entityTextValid,
                        method: apiData.method,
                        queryParamsType: `${entityTextValid}QueryParams`,
                        responseType: !lodash_1.default.isEmpty(apiData.response)
                            ? `${entityTextValid}Response`
                            : null,
                        apiPath: (0, utils_1.cleanUrl)(apiData.url),
                        infiniteQueryName: `${entityTextValid}Infinite`,
                        hasItems: apiDataHasItems,
                        isGenerateZod: IS_GENERATE_ZOD_FILE,
                        fetcher: FETCHER_LINK,
                    },
                });
            }
            else {
                actions.push({
                    type: "add",
                    path: `${folderPath}/${QUERY_GENERATE_FILE_NAME}`,
                    templateFile: PLOP_TEMPLATE_QUERY_PATH,
                    force: true,
                    data: {
                        generateType: GENERATE_TYPE,
                        name: entityTextValid,
                        method: apiData.method,
                        responseType: !lodash_1.default.isEmpty(apiData.response)
                            ? `${entityTextValid}Response`
                            : null,
                        apiPath: (0, utils_1.cleanUrl)(apiData.url),
                        infiniteQueryName: `${entityTextValid}Infinite`,
                        hasItems: apiDataHasItems,
                        isGenerateZod: IS_GENERATE_ZOD_FILE,
                        fetcher: FETCHER_LINK,
                    },
                });
            }
        }
        if (apiData.method === "POST" || apiData.method === "PATCH") {
            actions.push({
                type: "add",
                path: `${folderPath}/${MUTATION_GENERATE_FILE_NAME}`,
                templateFile: PLOP_TEMPLATE_MUTATION_PATH,
                force: true,
                data: {
                    generateType: GENERATE_TYPE,
                    name: entityTextValid,
                    requestType: lodash_1.default.isEmpty(apiData.rawBodyRequest) && lodash_1.default.isEmpty(apiData.formdata)
                        ? null
                        : `${entityTextValid}Request`,
                    responseType: !lodash_1.default.isEmpty(apiData.response)
                        ? `${entityTextValid}Response`
                        : null,
                    apiPath: (0, utils_1.cleanUrl)(apiData.url),
                    method: apiData.method,
                    isGenerateZod: IS_GENERATE_ZOD_FILE,
                    fetcher: FETCHER_LINK,
                },
            });
        }
    }
    return actions;
});
const getPlopCombineActions = (apiEndpoints, outputDir) => __awaiter(void 0, void 0, void 0, function* () {
    const actions = [];
    const actionsData = [];
    const folderPath = path_1.default.join(outputDir);
    let allTypeContent = '';
    for (const [entity, apiData] of Object.entries(apiEndpoints)) {
        const entityTextValid = (0, utils_1.cleanSpecialCharacter)(entity, { transformSpace: true, pascalCase: true });
        let apiDataHasItems = false;
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        if (!lodash_1.default.isEmpty(apiData.formdata)) {
            const requestTypeContent = yield generateTypeScriptType((0, utils_1.transformFormDataToPayloadObject)(apiData.formdata), `${entityTextValid}Request`);
            const requestTypeContentValid = (0, utils_1.fixDuplicateInterfacesBetweenStrings)(allTypeContent, requestTypeContent, entityTextValid);
            allTypeContent = allTypeContent.concat('\n', requestTypeContentValid);
        }
        if (lodash_1.default.isEmpty(apiData.formdata) && !lodash_1.default.isEmpty(apiData.rawBodyRequest)) {
            const requestTypeContent = yield generateTypeScriptType(JSON.parse(apiData.rawBodyRequest), `${entityTextValid}Request`);
            const requestTypeContentValid = (0, utils_1.fixDuplicateInterfacesBetweenStrings)(allTypeContent, requestTypeContent, entityTextValid);
            allTypeContent = allTypeContent.concat('\n', requestTypeContentValid);
        }
        if (apiData.queryParams) {
            const queryParamsTypeContent = yield generateTypeScriptType((0, utils_1.transformFormDataToPayloadObject)(apiData.queryParams), `${entityTextValid}QueryParams`);
            const queryParamsTypeContentValid = (0, utils_1.fixDuplicateInterfacesBetweenStrings)(allTypeContent, queryParamsTypeContent, entityTextValid);
            allTypeContent = allTypeContent.concat('\n', queryParamsTypeContentValid);
        }
        if (!lodash_1.default.isEmpty(apiData.response)) {
            const responseTypeContent = yield generateTypeScriptType(JSON.parse(apiData.response), `${entityTextValid}Response`);
            if (typeof responseTypeContent === "string" &&
                responseTypeContent.includes(`${PROPERTY_API_GET_LIST}:`)) {
                apiDataHasItems = true;
            }
            const responseTypeContentValid = (0, utils_1.fixDuplicateInterfacesBetweenStrings)(allTypeContent, responseTypeContent, entityTextValid);
            allTypeContent = allTypeContent.concat('\n', responseTypeContentValid);
        }
        if (apiData.method === "GET" || apiData.method === "DELETE") {
            if (apiData.queryParams) {
                actionsData.push({
                    generateType: GENERATE_TYPE,
                    name: entityTextValid,
                    method: apiData.method,
                    queryParamsType: `${entityTextValid}QueryParams`,
                    responseType: !lodash_1.default.isEmpty(apiData.response)
                        ? `${entityTextValid}Response`
                        : null,
                    apiPath: (0, utils_1.cleanUrl)(apiData.url),
                    infiniteQueryName: `${entityTextValid}Infinite`,
                    hasItems: apiDataHasItems,
                    isGenerateZod: IS_GENERATE_ZOD_FILE,
                    fetcher: FETCHER_LINK,
                    template: 'queryWithParams'
                });
            }
            else {
                actionsData.push({
                    generateType: GENERATE_TYPE,
                    name: entityTextValid,
                    method: apiData.method,
                    responseType: !lodash_1.default.isEmpty(apiData.response)
                        ? `${entityTextValid}Response`
                        : null,
                    apiPath: (0, utils_1.cleanUrl)(apiData.url),
                    infiniteQueryName: `${entityTextValid}Infinite`,
                    hasItems: apiDataHasItems,
                    isGenerateZod: IS_GENERATE_ZOD_FILE,
                    fetcher: FETCHER_LINK,
                    template: 'query'
                });
            }
        }
        if (apiData.method === "POST" || apiData.method === "PATCH") {
            actionsData.push({
                generateType: GENERATE_TYPE,
                name: entityTextValid,
                requestType: lodash_1.default.isEmpty(apiData.rawBodyRequest) && lodash_1.default.isEmpty(apiData.formdata)
                    ? null
                    : `${entityTextValid}Request`,
                responseType: !lodash_1.default.isEmpty(apiData.response)
                    ? `${entityTextValid}Response`
                    : null,
                apiPath: (0, utils_1.cleanUrl)(apiData.url),
                method: apiData.method,
                isGenerateZod: IS_GENERATE_ZOD_FILE,
                fetcher: FETCHER_LINK,
                template: 'mutation'
            });
        }
    }
    // write all typescipt in a file
    fs_1.default.writeFileSync(path_1.default.join(folderPath, COMBINE_TYPE_FILE_NAME), (0, utils_1.replaceTypeDuplicateString)(allTypeContent), BUFFER_ENDCODING);
    // combine tanstack query a action
    actions.push({
        type: "add",
        path: `${folderPath}/${COMBINE_QUERY_FILE_NAME}`,
        templateFile: PLOP_TEMPLATE_COMBINE_QUERY_PATH,
        force: true,
        data: {
            genList: actionsData,
            fetcher: FETCHER_LINK,
        }
    });
    return actions;
});
const processGenerateFileZodSchema = (generateType) => __awaiter(void 0, void 0, void 0, function* () {
    const arrFiles = generateType === utils_1.GenerateTypeEnum.Combine ?
        [`${GENERATE_PATH}/${COMBINE_TYPE_FILE_NAME}`]
        :
            [
                `${GENERATE_PATH}/**/${REQUEST_TYPE_FILE_NAME}`,
                `${GENERATE_PATH}/**/${QUERY_TYPE_FILE_NAME}`,
                `${GENERATE_PATH}/**/${RESPONSE_TYPE_FILE_NAME}`,
            ];
    const files = yield (0, fast_glob_1.default)(arrFiles);
    if (files.length === 0) {
        console.log("⚠️ File do not exact");
        return;
    }
    try {
        console.log("Start generate all zod schema files!");
        yield (0, utils_1.runTsToZod)(files);
        console.log("🎉 Finish generate all files!");
    }
    catch (_a) {
        console.error("❌ Error when run process ts-to-zod");
    }
});
function default_1(plop) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!IS_MATCH_PLOP_ACTION_ARG) {
            console.error(`❌ Plop action not correct! Let's try --${"generate-queries" /* CONFIG_ARGS_NAME.PLOP_ACTION */}`);
            return;
        }
        const postmanJsonFile = GENERATE_MODE === utils_1.GenerateModeEnum.JsonFile ? path_1.default.join(process.cwd(), POSTMAN_JSON_PATH) : null;
        const outputDir = path_1.default.join(process.cwd(), GENERATE_PATH);
        let postmanData;
        if (GENERATE_MODE === utils_1.GenerateModeEnum.Fetch) {
            const postmanDataInfo = yield (0, network_1.fetchPostmanApiDocument)({ collectionId: POSTMAN_FETCH_CONFIGS.collectionId, collectionAccessKey: POSTMAN_FETCH_CONFIGS.collectionAccessKey });
            postmanData = postmanDataInfo === null || postmanDataInfo === void 0 ? void 0 : postmanDataInfo.collection;
        }
        else {
            postmanData = JSON.parse(fs_1.default.readFileSync(postmanJsonFile, BUFFER_ENDCODING));
        }
        if (!postmanData) {
            console.error(`❌ Postman Data wrong, Please try again!`);
            return;
        }
        const apiEndpoints = handleApiEndpoints(postmanData);
        yield (0, utils_1.cleanGeneratedFolder)(GENERATE_PATH);
        const actions = GENERATE_TYPE === utils_1.GenerateTypeEnum.Combine ? yield getPlopCombineActions(apiEndpoints, outputDir) : yield getPlopSeperateActions(apiEndpoints, outputDir);
        if (IS_GENERATE_ZOD_FILE) {
            processGenerateFileZodSchema(GENERATE_TYPE);
        }
        plop.setHelper("zodPascalCase", (text) => {
            return (0, utils_1.cleanSpecialCharacter)(text)
                .replace(/^([A-Z])/, (match) => match.toLowerCase());
        });
        plop.setHelper("eq", (a, b) => a === b);
        plop.setHelper("and", function (a, b) {
            return !!(a && b);
        });
        plop.setHelper("or", (a, b) => a || b);
        plop.setHelper("isEqualOrMoreThanOne", (list, options) => {
            return list.length >= 1 ? options.fn(this) : options.inverse(this);
        });
        plop.setHelper("filter", (list, key) => {
            if (!Array.isArray(list))
                return [];
            return list.filter((item) => item[key]);
        });
        plop.setHelper("join", (list, separator, key) => {
            if (!Array.isArray(list))
                return "";
            const filtered = list.map((item) => item[key]).filter(Boolean);
            return filtered.length > 0 ? filtered.join(separator) : "";
        });
        plop.setHelper("with", (value, options) => {
            if (Array.isArray(value) && value.length > 0) {
                return options.fn(value);
            }
            return "";
        });
        plop.setHelper("joinZod", (list, separator, key, conditionKey, conditionValue, transformSuffix) => {
            return list
                .filter((item) => item[conditionKey] === conditionValue && item[key])
                .map((item) => plop.getHelper("zodPascalCase")(item[key]) + transformSuffix)
                .join(separator);
        });
        const partialsDir = PLOP_TEMPLATE_FOLDER_PATH;
        fs_1.default.readdirSync(partialsDir).forEach((file) => {
            const partialName = path_1.default.basename(file, ".hbs");
            const partialContent = fs_1.default.readFileSync(path_1.default.join(partialsDir, file), "utf8");
            plop.setPartial(partialName, partialContent);
        });
        plop.setGenerator(PLOP_ACTION_GENERATE_NAME, {
            description: PLOP_DESCRIPTION_GENERATE,
            prompts: [],
            actions: actions,
        });
    });
}
