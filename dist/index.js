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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const quicktype_core_1 = require("quicktype-core");
const fast_glob_1 = __importDefault(require("fast-glob"));
const p_limit_1 = __importDefault(require("p-limit"));
const child_process_1 = require("child_process");
const lodash_1 = __importDefault(require("lodash"));
const schema_1 = require("./helpers/schema");
const helpers_1 = require("./helpers");
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
    const validatedConfig = schema_1.CodegenConfigSchema.parse(codegenConfig);
    console.log("✅ Codegen Config Loaded:", validatedConfig);
}
catch (err) {
    console.error("❌ Config error:", err.errors);
    process.exit(1); // Exit process
}
// Base config Nodejs
const BUFFER_ENDCODING = "utf-8";
// Common Path Generate Config
const POSTMAN_JSON_PATH = codegenConfig.postmanJsonPath;
const GENERATE_PATH = codegenConfig.generateOutputPath;
// Files Name Generate config
const REQUEST_TYPE_FILE_NAME = (_b = (_a = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _a === void 0 ? void 0 : _a.requestType) !== null && _b !== void 0 ? _b : "apiRequests.ts";
const QUERY_TYPE_FILE_NAME = (_d = (_c = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _c === void 0 ? void 0 : _c.queryType) !== null && _d !== void 0 ? _d : "apiQueries.ts";
const RESPONSE_TYPE_FILE_NAME = (_f = (_e = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _e === void 0 ? void 0 : _e.responseType) !== null && _f !== void 0 ? _f : "apiResponses.ts";
const QUERY_GENERATE_FILE_NAME = (_h = (_g = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _g === void 0 ? void 0 : _g.queryOptions) !== null && _h !== void 0 ? _h : "query.ts";
const MUTATION_GENERATE_FILE_NAME = (_k = (_j = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.generateFileNames) === null || _j === void 0 ? void 0 : _j.mutationOptions) !== null && _k !== void 0 ? _k : "mutation.ts";
// Types Configs
const TYPE_CONFIGS = codegenConfig === null || codegenConfig === void 0 ? void 0 : codegenConfig.typeConfigs;
// Plop Generate Config
const PLOP_TEMPLATE_QUERY_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates/query.hbs");
const PLOP_TEMPLATE_QUERY_WITH_PARAMS_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates/queryWithParams.hbs");
const PLOP_TEMPLATE_MUTATION_PATH = path_1.default.join(LIBRARY_ROOT, "/plop-templates/mutation.hbs");
const PLOP_ACTION_GENERATE_NAME = "generate-queries" /* CONFIG_ARGS_NAME.PLOP_ACTION */;
const PLOP_DESCRIPTION_GENERATE = "Generate TanStack QueryOptions, MutationOptions, and QueryParams";
const PROPERTY_API_GET_LIST = codegenConfig.propertyApiGetList;
const FETCHER_LINK = codegenConfig.fetcher;
// Generate zod schema config
const LIMIT_PROCESS_GEN_ZOD_FILE = 5;
// Check Config options
const IS_MATCH_PLOP_ACTION_ARG = process.argv.includes(`${"generate-queries" /* CONFIG_ARGS_NAME.PLOP_ACTION */}`);
const IS_GENERATE_ZOD_FILE = (_l = codegenConfig.enableZodGeneration) !== null && _l !== void 0 ? _l : false;
const generateTypeScriptType = (jsonData, typeName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if (!jsonData || Object.keys(jsonData).length === 0) {
        //   throw new Error(`❌ JSON empty or not format: ${typeName}`, jsonData);
        // }
        const jsonInput = (0, quicktype_core_1.jsonInputForTargetLanguage)("typescript");
        const safeJsonString = (0, helpers_1.safeStringify)(jsonData);
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
        postmanDataObj[postmanDataObj["name"].replace(/[\s-]/g, "")] = Object.assign({}, postmanDataObj);
        return Object.assign({}, Object.entries(postmanDataObj).reduce((acc, [key, value]) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            if (value.request) {
                acc[key] = {
                    method: value.request.method,
                    formdata: !lodash_1.default.isEmpty((_a = value.request.body) === null || _a === void 0 ? void 0 : _a.formdata)
                        ? (_b = value.request.body) === null || _b === void 0 ? void 0 : _b.formdata
                        : (_f = (_e = (_d = (_c = value.response) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.originalRequest) === null || _e === void 0 ? void 0 : _e.body) === null || _f === void 0 ? void 0 : _f.formdata,
                    rawBodyRequest: (0, helpers_1.isValidJSON)((_g = value.request.body) === null || _g === void 0 ? void 0 : _g.raw)
                        ? (_h = value.request.body) === null || _h === void 0 ? void 0 : _h.raw
                        : (0, helpers_1.isValidJSON)((_m = (_l = (_k = (_j = value.response) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.originalRequest) === null || _l === void 0 ? void 0 : _l.body) === null || _m === void 0 ? void 0 : _m.raw)
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
const getPlopActions = (apiEndpoints, outputDir) => __awaiter(void 0, void 0, void 0, function* () {
    const actions = [];
    for (const [entity, apiData] of Object.entries(apiEndpoints)) {
        const folderPath = path_1.default.join(outputDir, (0, helpers_1.convertToKebabCase)(entity));
        let apiDataHasItems = false;
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        if (!lodash_1.default.isEmpty(apiData.formdata)) {
            const requestTypeContent = yield generateTypeScriptType((0, helpers_1.transformFormDataToPayloadObject)(apiData.formdata), `${entity}Request`);
            fs_1.default.writeFileSync(path_1.default.join(folderPath, REQUEST_TYPE_FILE_NAME), requestTypeContent, BUFFER_ENDCODING);
        }
        if (lodash_1.default.isEmpty(apiData.formdata) && !lodash_1.default.isEmpty(apiData.rawBodyRequest)) {
            const requestTypeContent = yield generateTypeScriptType(JSON.parse(apiData.rawBodyRequest), `${entity}Request`);
            fs_1.default.writeFileSync(path_1.default.join(folderPath, REQUEST_TYPE_FILE_NAME), requestTypeContent, BUFFER_ENDCODING);
        }
        if (apiData.queryParams) {
            const queryParamsTypeContent = yield generateTypeScriptType((0, helpers_1.transformFormDataToPayloadObject)(apiData.queryParams), `${entity}QueryParams`);
            fs_1.default.writeFileSync(path_1.default.join(folderPath, QUERY_TYPE_FILE_NAME), queryParamsTypeContent, BUFFER_ENDCODING);
        }
        if (!lodash_1.default.isEmpty(apiData.response)) {
            const responseTypeContent = yield generateTypeScriptType(JSON.parse(apiData.response), `${entity}Response`);
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
                        name: entity,
                        method: apiData.method,
                        queryParamsType: `${entity}QueryParams`.replace(/[-/:]/g, ""),
                        responseType: !lodash_1.default.isEmpty(apiData.response)
                            ? `${entity}Response`.replace(/[-/:]/g, "")
                            : null,
                        apiPath: (0, helpers_1.cleanUrl)(apiData.url),
                        infiniteQueryName: `${entity}Infinite`,
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
                        name: entity,
                        method: apiData.method,
                        responseType: !lodash_1.default.isEmpty(apiData.response)
                            ? `${entity}Response`.replace(/[-/:]/g, "")
                            : null,
                        apiPath: (0, helpers_1.cleanUrl)(apiData.url),
                        infiniteQueryName: `${entity}Infinite`,
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
                    name: entity,
                    requestType: lodash_1.default.isEmpty(apiData.rawBodyRequest) && lodash_1.default.isEmpty(apiData.formdata)
                        ? null
                        : `${entity}Request`.replace(/[-/:]/g, ""),
                    responseType: !lodash_1.default.isEmpty(apiData.response)
                        ? `${entity}Response`.replace(/[-/:]/g, "")
                        : null,
                    apiPath: (0, helpers_1.cleanUrl)(apiData.url),
                    method: apiData.method,
                    isGenerateZod: IS_GENERATE_ZOD_FILE,
                    fetcher: FETCHER_LINK,
                },
            });
        }
    }
    return actions;
});
const limitProcess = (0, p_limit_1.default)(LIMIT_PROCESS_GEN_ZOD_FILE); // Limit process
const runTsToZod = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = files.map((file) => limitProcess(() => {
        return new Promise((resolve, reject) => {
            const outputFile = file.replace(".ts", ".zod.ts");
            (0, child_process_1.exec)(`npx ts-to-zod ${file} ${outputFile}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error converting ${file}:\n${stderr}`);
                    reject(error);
                }
                else {
                    console.log(`✅ Converted ${file} to ${outputFile}`);
                    resolve(stdout);
                }
            });
        });
    }));
    yield Promise.allSettled(tasks); // Run all task with limit
});
const processGenerateFileZodSchema = () => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield (0, fast_glob_1.default)([
        `${GENERATE_PATH}/**/${REQUEST_TYPE_FILE_NAME}`,
        `${GENERATE_PATH}/**/${QUERY_TYPE_FILE_NAME}`,
        `${GENERATE_PATH}/**/${RESPONSE_TYPE_FILE_NAME}`,
    ]);
    if (files.length === 0) {
        console.log("⚠️ File do not exact");
        return;
    }
    try {
        console.log("Start generate all zod schema files!");
        yield runTsToZod(files);
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
        const postmanJsonFile = path_1.default.join(process.cwd(), POSTMAN_JSON_PATH);
        const outputDir = path_1.default.join(process.cwd(), GENERATE_PATH);
        const postmanData = JSON.parse(fs_1.default.readFileSync(postmanJsonFile, BUFFER_ENDCODING));
        const apiEndpoints = handleApiEndpoints(postmanData);
        const actions = yield getPlopActions(apiEndpoints, outputDir);
        if (IS_GENERATE_ZOD_FILE) {
            processGenerateFileZodSchema();
        }
        plop.setHelper("zodPascalCase", (text) => {
            return text
                .replace(/[-/:]/g, "")
                .replace(/^([A-Z])/, (match) => match.toLowerCase());
        });
        plop.setHelper("and", function (a, b) {
            return !!(a && b);
        });
        plop.setActionType("cleanGenerated", () => __awaiter(this, void 0, void 0, function* () {
            yield (0, helpers_1.cleanGeneratedFolder)(GENERATE_PATH);
            return "🧹 Cleaned generated folder.";
        }));
        plop.setGenerator(PLOP_ACTION_GENERATE_NAME, {
            description: PLOP_DESCRIPTION_GENERATE,
            prompts: [],
            actions: actions,
        });
    });
}
