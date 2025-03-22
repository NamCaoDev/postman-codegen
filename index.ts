import fs from "fs";
import path from "path";
import { PlopTypes } from "@turbo/gen";
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from "quicktype-core";
import fg from "fast-glob";
import pLimit from "p-limit";
import { exec } from "child_process";
import _ from "lodash";
import { CodegenConfigSchema, CodegenConfig, GenerateModeEnum } from "./helpers/schema";
import {
  CONFIG_ARGS_NAME,
  PostmanFormData,
  APIData,
  PlopActionDataParams,
} from "./helpers/types";
import { fetchPostmanApiDocument } from './helpers/network';
import {
  isValidJSON,
  convertToKebabCase,
  transformFormDataToPayloadObject,
  cleanUrl,
  safeStringify,
  cleanGeneratedFolder,
  cleanSpecialCharacter,
} from "./helpers";

export type {
  CONFIG_ARGS_NAME,
  PostmanFormData,
  APIData,
  PlopActionDataParams,
  CodegenConfig,
  GenerateModeEnum
};

const LIBRARY_ROOT = path.resolve(__dirname);

const configPath = path.resolve(process.cwd(), "codegen.config.cjs");

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
const GENERATE_MODE = codegenConfig.generateMode;

// Common Path Generate Config
const POSTMAN_JSON_PATH = codegenConfig?.postmanJsonPath;
const POSTMAN_FETCH_CONFIGS = {
    collectionId: codegenConfig?.postmanFetchConfigs?.collectionId,
    collectionAccessKey: codegenConfig?.postmanFetchConfigs?.collectionAccessKey
}

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
// Types Configs
const TYPE_CONFIGS = codegenConfig?.typeConfigs;

// Plop Generate Config
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
const PLOP_ACTION_GENERATE_NAME = CONFIG_ARGS_NAME.PLOP_ACTION;
const PLOP_DESCRIPTION_GENERATE =
  "Generate TanStack QueryOptions, MutationOptions, and QueryParams";
const PROPERTY_API_GET_LIST = codegenConfig.propertyApiGetList;
const FETCHER_LINK = codegenConfig.fetcher;

// Generate zod schema config
const LIMIT_PROCESS_GEN_ZOD_FILE = 5;

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
    // if (!jsonData || Object.keys(jsonData).length === 0) {
    //   throw new Error(`❌ JSON empty or not format: ${typeName}`, jsonData);
    // }
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

const getPlopActions = async (apiEndpoints, outputDir) => {
  const actions: PlopTypes.ActionType[] = [];
  for (const [entity, apiData] of Object.entries(
    apiEndpoints as Record<string, APIData>
  )) {
    const entityTextValid = cleanSpecialCharacter(entity, { transformSpace: true, pascalCase: true });
    const folderPath = path.join(outputDir, convertToKebabCase(entityTextValid));
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
        requestTypeContent as string,
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
        requestTypeContent as string,
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
        queryParamsTypeContent as string,
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
        responseTypeContent as string,
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

const limitProcess = pLimit(LIMIT_PROCESS_GEN_ZOD_FILE); // Limit process

const runTsToZod = async (files: string[]) => {
  const tasks = files.map((file) =>
    limitProcess(() => {
      return new Promise((resolve, reject) => {
        const outputFile = file.replace(".ts", ".zod.ts");

        exec(`npx ts-to-zod ${file} ${outputFile}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Error converting ${file}:\n${stderr}`);
            reject(error);
          } else {
            console.log(`✅ Converted ${file} to ${outputFile}`);
            resolve(stdout);
          }
        });
      });
    })
  );

  await Promise.allSettled(tasks); // Run all task with limit
};

const processGenerateFileZodSchema = async () => {
  const files = await fg([
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
  const postmanJsonFile = GENERATE_MODE === GenerateModeEnum.JsonFile ? path.join(process.cwd(), POSTMAN_JSON_PATH) : null;
  const outputDir = path.join(process.cwd(), GENERATE_PATH);
  
  let postmanData;

  if(GENERATE_MODE === GenerateModeEnum.Fetch) {
    const postmanDataInfo = await fetchPostmanApiDocument({collectionId: POSTMAN_FETCH_CONFIGS.collectionId, collectionAccessKey: POSTMAN_FETCH_CONFIGS.collectionAccessKey});
    postmanData = postmanDataInfo?.collection;
  } else {
    postmanData = JSON.parse(
      fs.readFileSync(postmanJsonFile, BUFFER_ENDCODING)
    );
  }

  if(!postmanData) {
    console.error(
      `❌ Postman Data wrong, Please try again!`
    );
    return;
  }

  const apiEndpoints = handleApiEndpoints(postmanData);

  await cleanGeneratedFolder(GENERATE_PATH);

  const actions = await getPlopActions(apiEndpoints, outputDir);

  if (IS_GENERATE_ZOD_FILE) {
    processGenerateFileZodSchema();
  }

  plop.setHelper("zodPascalCase", (text) => {
    return cleanSpecialCharacter(text)
      .replace(/^([A-Z])/, (match) => match.toLowerCase());
  });

  plop.setHelper("and", function (a, b) {
    return !!(a && b);
  });

  plop.setGenerator(PLOP_ACTION_GENERATE_NAME, {
    description: PLOP_DESCRIPTION_GENERATE,
    prompts: [],
    actions: actions,
  });
}
