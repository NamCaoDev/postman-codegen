import fs from "fs";
import path from "path";
import { PlopTypes } from "@turbo/gen";
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from "quicktype-core";
import fg from "fast-glob";
import _ from "lodash";
import { fetchPostmanApiDocument } from "./utils/network";
import {
  isValidJSON,
  convertToKebabCase,
  transformFormDataToPayloadObject,
  cleanUrl,
  safeStringify,
  cleanGeneratedFolder,
  cleanSpecialCharacter,
  CONFIG_ARGS_NAME,
  PlopActionDataParams,
  PostmanFormData,
  APIData,
  CodegenConfigSchema,
  CodegenConfig,
  GenerateModeEnum,
  GenerateTypeEnum,
  runTsToZod,
  replaceTypeDuplicateString,
  fixDuplicateInterfacesBetweenStrings,
  IGNORE_CHECK_STRING,
} from "./utils";

export type {
  CONFIG_ARGS_NAME,
  PostmanFormData,
  APIData,
  PlopActionDataParams,
  CodegenConfig,
  GenerateModeEnum,
  GenerateTypeEnum,
};

const LIBRARY_ROOT = path.resolve(__dirname);

const configPath = path.resolve(process.cwd(), "codegen.config.cjs");

console.log('Test owner...');

if (!fs.existsSync(configPath)) {
  console.error("❌ Missing codegen.config.js file. Please create one.");
  process.exit(1);
}

let codegenConfig: Record<string, any>;

if (fs.existsSync(configPath)) {
  if (configPath.endsWith(".cjs")) {
    codegenConfig = require(configPath);
  } else if (configPath.endsWith(".json")) {
    codegenConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } else {
    console.error("❌ Unsupported config format. Use .js or .json.");
    process.exit(1);
  }
} else {
  console.error("❌ Missing codegen.config file.");
  process.exit(1);
}

if (!codegenConfig) {
  throw new Error("❌ codegenConfig is undefined. Check config loading logic.");
}

try {
  // Validate config
  const validatedConfig = CodegenConfigSchema.parse(codegenConfig);
  console.log("✅ Codegen Config Loaded:", validatedConfig);
} catch (err) {
  console.error("❌ Config error:", err.errors);
  process.exit(1); // Exit process
}

// Base config Nodejs
const BUFFER_ENDCODING: BufferEncoding = "utf-8";

// Generate Mode
const GENERATE_TYPE = codegenConfig.generateType ?? GenerateTypeEnum.Seperate;
const GENERATE_MODE = codegenConfig.generateMode;

// Common Path Generate Config
const POSTMAN_JSON_PATH = codegenConfig?.postmanJsonPath;
const POSTMAN_FETCH_CONFIGS = {
  collectionId: codegenConfig?.postmanFetchConfigs?.collectionId,
  collectionAccessKey: codegenConfig?.postmanFetchConfigs?.collectionAccessKey,
};

const GENERATE_PATH = codegenConfig.generateOutputPath;
// Files Name Generate config
const REQUEST_TYPE_FILE_NAME =
  codegenConfig?.generateFileNames?.requestType ?? "apiRequests.ts";
const QUERY_TYPE_FILE_NAME =
  codegenConfig?.generateFileNames?.queryType ?? "apiQueries.ts";
const RESPONSE_TYPE_FILE_NAME =
  codegenConfig?.generateFileNames?.responseType ?? "apiResponses.ts";
const QUERY_GENERATE_FILE_NAME =
  codegenConfig?.generateFileNames?.queryOptions ?? "query.ts";
const MUTATION_GENERATE_FILE_NAME =
  codegenConfig?.generateFileNames?.mutationOptions ?? "mutation.ts";
const COMBINE_TYPE_FILE_NAME = "types.gen.ts";
const COMBINE_QUERY_FILE_NAME = "tanstack-query.gen.ts";
// Types Configs
const TYPE_CONFIGS = codegenConfig?.typeConfigs;

// Plop Generate Config
const PLOP_TEMPLATE_FOLDER_PATH = path.join(LIBRARY_ROOT, "/plop-templates");

const PLOP_TEMPLATE_QUERY_PATH = path.join(
  LIBRARY_ROOT,
  "/plop-templates/query.hbs"
);
const PLOP_TEMPLATE_QUERY_WITH_PARAMS_PATH = path.join(
  LIBRARY_ROOT,
  "/plop-templates/queryWithParams.hbs"
);
const PLOP_TEMPLATE_MUTATION_PATH = path.join(
  LIBRARY_ROOT,
  "/plop-templates/mutation.hbs"
);

const PLOP_TEMPLATE_COMBINE_QUERY_PATH = path.join(
  LIBRARY_ROOT,
  "/plop-templates/combineQuery.hbs"
);
const PLOP_ACTION_GENERATE_NAME = CONFIG_ARGS_NAME.PLOP_ACTION;
const PLOP_DESCRIPTION_GENERATE =
  "Generate TanStack QueryOptions, MutationOptions, and QueryParams";
const PROPERTY_API_GET_LIST = codegenConfig.propertyApiGetList;
const FETCHER_LINK = codegenConfig.fetcher;

// Check Config options
const IS_MATCH_PLOP_ACTION_ARG = process.argv.includes(
  `${CONFIG_ARGS_NAME.PLOP_ACTION}`
);
const IS_GENERATE_ZOD_FILE = codegenConfig.enableZodGeneration ?? false;

const generateTypeScriptType = async (
  jsonData,
  typeName: string
): Promise<string | undefined> => {
  try {
    const jsonInput = jsonInputForTargetLanguage("typescript");

    const safeJsonString = safeStringify(jsonData);

    await jsonInput.addSource({
      name: typeName,
      samples: [safeJsonString],
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const { lines } = await quicktype({
      inputData,
      lang: "typescript",
      rendererOptions: {
        "just-types": "true",
      },
      ...TYPE_CONFIGS,
    });

    if (TYPE_CONFIGS?.allPropertiesOptional) {
      return lines
        .join("\n")
        .replace(/:(\s+)null;/gm, ":$1unknown;")
        .replace(/:((?!.*(null|unknown).*).*);/gm, ":$1 | null;");
    }

    return lines.join("\n");
  } catch (err) {
    console.error("❌ Error in generateTypeScriptType:", err);
    console.error("❌ Stack Trace:", err.stack);
  }
};

const reduceDataFromPostmanData = (postmanDataObj) => {
  if (_.isObject(postmanDataObj)) {
    postmanDataObj[postmanDataObj["name"]] = {
      ...postmanDataObj,
    };
    return {
      ...Object.entries(postmanDataObj).reduce((acc, [key, value]) => {
        if (value.request) {
          acc[key] = {
            method: value.request.method,
            formdata: !_.isEmpty(value.request.body?.formdata)
              ? value.request.body?.formdata
              : value.response?.[0]?.originalRequest?.body?.formdata,
            rawBodyRequest: isValidJSON(value.request.body?.raw)
              ? value.request.body?.raw
              : isValidJSON(value.response?.[0]?.originalRequest?.body?.raw)
              ? value.response?.[0]?.originalRequest?.body?.raw
              : null,
            queryParams: value.request.url.query || null,
            response: value.response?.[0]?.body || null,
            url: value.request.url.raw,
          };
        }
        return acc;
      }, {}),
    };
  }
};

const handleApiEndpoints = (postmanData) => {
  let endpoints = {};

  if (postmanData.item) {
    postmanData.item.forEach((childItem) => {
      endpoints = { ...endpoints, ...handleApiEndpoints(childItem) };
    });
  } else {
    endpoints = {
      ...endpoints,
      ..._.cloneDeep(reduceDataFromPostmanData(postmanData)),
    };
  }

  return endpoints;
};

const getPlopSeperateActions = async (apiEndpoints, outputDir) => {
  const actions: PlopTypes.ActionType[] = [];
  for (const [entity, apiData] of Object.entries(
    apiEndpoints as Record<string, APIData>
  )) {
    const entityTextValid = cleanSpecialCharacter(entity, {
      transformSpace: true,
      pascalCase: true,
    });
    const folderPath = path.join(
      outputDir,
      convertToKebabCase(entityTextValid)
    );
    let apiDataHasItems = false;

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    if (!_.isEmpty(apiData.formdata)) {
      const requestTypeContent = await generateTypeScriptType(
        transformFormDataToPayloadObject(apiData.formdata as PostmanFormData[]),
        `${entityTextValid}Request`
      );
      fs.writeFileSync(
        path.join(folderPath, REQUEST_TYPE_FILE_NAME),
        (IGNORE_CHECK_STRING + requestTypeContent) as string,
        BUFFER_ENDCODING
      );
    }

    if (_.isEmpty(apiData.formdata) && !_.isEmpty(apiData.rawBodyRequest)) {
      const requestTypeContent = await generateTypeScriptType(
        JSON.parse(apiData.rawBodyRequest as string),
        `${entityTextValid}Request`
      );
      fs.writeFileSync(
        path.join(folderPath, REQUEST_TYPE_FILE_NAME),
        (IGNORE_CHECK_STRING + requestTypeContent) as string,
        BUFFER_ENDCODING
      );
    }

    if (apiData.queryParams) {
      const queryParamsTypeContent = await generateTypeScriptType(
        transformFormDataToPayloadObject(
          apiData.queryParams as PostmanFormData[]
        ),
        `${entityTextValid}QueryParams`
      );
      fs.writeFileSync(
        path.join(folderPath, QUERY_TYPE_FILE_NAME),
        (IGNORE_CHECK_STRING + queryParamsTypeContent) as string,
        BUFFER_ENDCODING
      );
    }

    if (!_.isEmpty(apiData.response)) {
      const responseTypeContent = await generateTypeScriptType(
        JSON.parse(apiData.response as string),
        `${entityTextValid}Response`
      );
      if (
        typeof responseTypeContent === "string" &&
        responseTypeContent.includes(`${PROPERTY_API_GET_LIST}:`)
      ) {
        apiDataHasItems = true;
      }
      fs.writeFileSync(
        path.join(folderPath, RESPONSE_TYPE_FILE_NAME),
        (IGNORE_CHECK_STRING + responseTypeContent) as string,
        BUFFER_ENDCODING
      );
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
            responseType: !_.isEmpty(apiData.response)
              ? `${entityTextValid}Response`
              : null,
            apiPath: cleanUrl(apiData.url),
            infiniteQueryName: `${entityTextValid}Infinite`,
            hasItems: apiDataHasItems,
            isGenerateZod: IS_GENERATE_ZOD_FILE,
            fetcher: FETCHER_LINK,
          } as PlopActionDataParams,
        });
      } else {
        actions.push({
          type: "add",
          path: `${folderPath}/${QUERY_GENERATE_FILE_NAME}`,
          templateFile: PLOP_TEMPLATE_QUERY_PATH,
          force: true,
          data: {
            generateType: GENERATE_TYPE,
            name: entityTextValid,
            method: apiData.method,
            responseType: !_.isEmpty(apiData.response)
              ? `${entityTextValid}Response`
              : null,
            apiPath: cleanUrl(apiData.url),
            infiniteQueryName: `${entityTextValid}Infinite`,
            hasItems: apiDataHasItems,
            isGenerateZod: IS_GENERATE_ZOD_FILE,
            fetcher: FETCHER_LINK,
          } as PlopActionDataParams,
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
          requestType:
            _.isEmpty(apiData.rawBodyRequest) && _.isEmpty(apiData.formdata)
              ? null
              : `${entityTextValid}Request`,
          responseType: !_.isEmpty(apiData.response)
            ? `${entityTextValid}Response`
            : null,
          apiPath: cleanUrl(apiData.url),
          method: apiData.method,
          isGenerateZod: IS_GENERATE_ZOD_FILE,
          fetcher: FETCHER_LINK,
        } as PlopActionDataParams,
      });
    }
  }

  return actions;
};

const getPlopCombineActions = async (apiEndpoints, outputDir) => {
  const actions: PlopTypes.ActionType[] = [];
  const actionsData: PlopActionDataParams[] = [];
  const folderPath = path.join(outputDir);
  let allTypeContent = IGNORE_CHECK_STRING;
  for (const [entity, apiData] of Object.entries(
    apiEndpoints as Record<string, APIData>
  )) {
    const entityTextValid = cleanSpecialCharacter(entity, {
      transformSpace: true,
      pascalCase: true,
    });
    let apiDataHasItems = false;

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    if (!_.isEmpty(apiData.formdata)) {
      const requestTypeContent = await generateTypeScriptType(
        transformFormDataToPayloadObject(apiData.formdata as PostmanFormData[]),
        `${entityTextValid}Request`
      );
      const requestTypeContentValid = fixDuplicateInterfacesBetweenStrings(
        allTypeContent,
        requestTypeContent,
        entityTextValid
      );
      allTypeContent = allTypeContent.concat("\n", requestTypeContentValid);
    }

    if (_.isEmpty(apiData.formdata) && !_.isEmpty(apiData.rawBodyRequest)) {
      const requestTypeContent = await generateTypeScriptType(
        JSON.parse(apiData.rawBodyRequest as string),
        `${entityTextValid}Request`
      );
      const requestTypeContentValid = fixDuplicateInterfacesBetweenStrings(
        allTypeContent,
        requestTypeContent,
        entityTextValid
      );
      allTypeContent = allTypeContent.concat("\n", requestTypeContentValid);
    }

    if (apiData.queryParams) {
      const queryParamsTypeContent = await generateTypeScriptType(
        transformFormDataToPayloadObject(
          apiData.queryParams as PostmanFormData[]
        ),
        `${entityTextValid}QueryParams`
      );
      const queryParamsTypeContentValid = fixDuplicateInterfacesBetweenStrings(
        allTypeContent,
        queryParamsTypeContent,
        entityTextValid
      );
      allTypeContent = allTypeContent.concat("\n", queryParamsTypeContentValid);
    }

    if (!_.isEmpty(apiData.response)) {
      const responseTypeContent = await generateTypeScriptType(
        JSON.parse(apiData.response as string),
        `${entityTextValid}Response`
      );
      if (
        typeof responseTypeContent === "string" &&
        responseTypeContent.includes(`${PROPERTY_API_GET_LIST}:`)
      ) {
        apiDataHasItems = true;
      }
      const responseTypeContentValid = fixDuplicateInterfacesBetweenStrings(
        allTypeContent,
        responseTypeContent,
        entityTextValid
      );
      allTypeContent = allTypeContent.concat("\n", responseTypeContentValid);
    }

    if (apiData.method === "GET" || apiData.method === "DELETE") {
      if (apiData.queryParams) {
        actionsData.push({
          generateType: GENERATE_TYPE,
          name: entityTextValid,
          method: apiData.method,
          queryParamsType: `${entityTextValid}QueryParams`,
          responseType: !_.isEmpty(apiData.response)
            ? `${entityTextValid}Response`
            : null,
          apiPath: cleanUrl(apiData.url),
          infiniteQueryName: `${entityTextValid}Infinite`,
          hasItems: apiDataHasItems,
          isGenerateZod: IS_GENERATE_ZOD_FILE,
          fetcher: FETCHER_LINK,
          template: "queryWithParams",
        } as PlopActionDataParams);
      } else {
        actionsData.push({
          generateType: GENERATE_TYPE,
          name: entityTextValid,
          method: apiData.method,
          responseType: !_.isEmpty(apiData.response)
            ? `${entityTextValid}Response`
            : null,
          apiPath: cleanUrl(apiData.url),
          infiniteQueryName: `${entityTextValid}Infinite`,
          hasItems: apiDataHasItems,
          isGenerateZod: IS_GENERATE_ZOD_FILE,
          fetcher: FETCHER_LINK,
          template: "query",
        } as PlopActionDataParams);
      }
    }

    if (apiData.method === "POST" || apiData.method === "PATCH") {
      actionsData.push({
        generateType: GENERATE_TYPE,
        name: entityTextValid,
        requestType:
          _.isEmpty(apiData.rawBodyRequest) && _.isEmpty(apiData.formdata)
            ? null
            : `${entityTextValid}Request`,
        responseType: !_.isEmpty(apiData.response)
          ? `${entityTextValid}Response`
          : null,
        apiPath: cleanUrl(apiData.url),
        method: apiData.method,
        isGenerateZod: IS_GENERATE_ZOD_FILE,
        fetcher: FETCHER_LINK,
        template: "mutation",
      } as PlopActionDataParams);
    }
  }

  // write all typescipt in a file
  fs.writeFileSync(
    path.join(folderPath, COMBINE_TYPE_FILE_NAME),
    replaceTypeDuplicateString(allTypeContent),
    BUFFER_ENDCODING
  );

  // combine tanstack query a action
  actions.push({
    type: "add",
    path: `${folderPath}/${COMBINE_QUERY_FILE_NAME}`,
    templateFile: PLOP_TEMPLATE_COMBINE_QUERY_PATH,
    force: true,
    data: {
      genList: actionsData,
      fetcher: FETCHER_LINK,
    },
  });

  return actions;
};

const processGenerateFileZodSchema = async (generateType: GenerateTypeEnum) => {
  const arrFiles =
    generateType === GenerateTypeEnum.Combine
      ? [`${GENERATE_PATH}/${COMBINE_TYPE_FILE_NAME}`]
      : [
          `${GENERATE_PATH}/**/${REQUEST_TYPE_FILE_NAME}`,
          `${GENERATE_PATH}/**/${QUERY_TYPE_FILE_NAME}`,
          `${GENERATE_PATH}/**/${RESPONSE_TYPE_FILE_NAME}`,
        ];
  const files = await fg(arrFiles);

  if (files.length === 0) {
    console.log("⚠️ File do not exact");
    return;
  }

  try {
    console.log("Start generate all zod schema files!");
    await runTsToZod(files);
    console.log("🎉 Finish generate all files!");
  } catch {
    console.error("❌ Error when run process ts-to-zod");
  }
};

export default async function (plop: PlopTypes.NodePlopAPI) {
  if (!IS_MATCH_PLOP_ACTION_ARG) {
    console.error(
      `❌ Plop action not correct! Let's try --${CONFIG_ARGS_NAME.PLOP_ACTION}`
    );
    return;
  }
  const postmanJsonFile =
    GENERATE_MODE === GenerateModeEnum.JsonFile
      ? path.join(process.cwd(), POSTMAN_JSON_PATH)
      : null;
  const outputDir = path.join(process.cwd(), GENERATE_PATH);

  let postmanData;

  if (GENERATE_MODE === GenerateModeEnum.Fetch) {
    const postmanDataInfo = await fetchPostmanApiDocument({
      collectionId: POSTMAN_FETCH_CONFIGS.collectionId,
      collectionAccessKey: POSTMAN_FETCH_CONFIGS.collectionAccessKey,
    });
    postmanData = postmanDataInfo?.collection;
  } else {
    postmanData = JSON.parse(
      fs.readFileSync(postmanJsonFile, BUFFER_ENDCODING)
    );
  }

  if (!postmanData) {
    console.error(`❌ Postman Data wrong, Please try again!`);
    return;
  }

  const apiEndpoints = handleApiEndpoints(postmanData);

  await cleanGeneratedFolder(GENERATE_PATH);

  const actions =
    GENERATE_TYPE === GenerateTypeEnum.Combine
      ? await getPlopCombineActions(apiEndpoints, outputDir)
      : await getPlopSeperateActions(apiEndpoints, outputDir);

  if (IS_GENERATE_ZOD_FILE) {
    processGenerateFileZodSchema(GENERATE_TYPE);
  }

  plop.setHelper("zodPascalCase", (text) => {
    return cleanSpecialCharacter(text).replace(/^([A-Z])/, (match) =>
      match.toLowerCase()
    );
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
    if (!Array.isArray(list)) return [];
    return list.filter((item) => item[key]);
  });

  plop.setHelper("join", (list, separator, key) => {
    if (!Array.isArray(list)) return "";
    const filtered = list.map((item) => item[key]).filter(Boolean);
    return filtered.length > 0 ? filtered.join(separator) : "";
  });

  plop.setHelper("with", (value, options) => {
    if (Array.isArray(value) && value.length > 0) {
      return options.fn(value);
    }
    return "";
  });

  plop.setHelper(
    "joinZod",
    (list, separator, key, conditionKey, conditionValue, transformSuffix) => {
      return list
        .filter((item) => item[conditionKey] === conditionValue && item[key])
        .map(
          (item) => plop.getHelper("zodPascalCase")(item[key]) + transformSuffix
        )
        .join(separator);
    }
  );

  const partialsDir = PLOP_TEMPLATE_FOLDER_PATH;
  fs.readdirSync(partialsDir).forEach((file) => {
    const partialName = path.basename(file, ".hbs");
    const partialContent = fs.readFileSync(
      path.join(partialsDir, file),
      "utf8"
    );
    plop.setPartial(partialName, partialContent);
  });

  plop.setGenerator(PLOP_ACTION_GENERATE_NAME, {
    description: PLOP_DESCRIPTION_GENERATE,
    prompts: [],
    actions: actions,
  });
}
