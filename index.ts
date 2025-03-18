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
import { z } from "zod";

const configPath = path.resolve(process.cwd(), "codegen.config.js");

if (!fs.existsSync(configPath)) {
  console.error("❌ Missing codegen.config.js file. Please create one.");
  process.exit(1);
}

let codegenConfig: Record<string, any>;

if (fs.existsSync(configPath)) {
  if (configPath.endsWith(".js")) {
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

export const CodegenConfigSchema = z.object({
  postmanJsonPath: z.string().min(1, "postmanJsonPath is required"), // Postman Json Path
  generateOutputPath: z.string().min(1, "generateOutputPath is required"), // Generated Folder path
  hbsTemplateQueryPath: z.string().min(1, "hbsTemplateQueryPath is required"), // Template hbs for query
  hbsTemplateQueryWithParamsPath: z
    .string()
    .min(1, "hbsTemplateQueryWithParamsPath is required"), // Template hbs for query with search params
  hbsTemplateMutationPath: z
    .string()
    .min(1, "hbsTemplateMutationPath is required"), // Template hbs for mutation
  propertyApiGetList: z.string().min(1, "propertyApiGetList is required"), // With api get list fields includes list data
  enableZodGeneration: z.boolean().optional(), // enabled zod
  generateFileNames: z
    .object({
      requestType: z.string().optional(),
      queryType: z.string().optional(),
      responseType: z.string().optional(),
      queryOptions: z.string().optional(),
      mutationOptions: z.string().optional(),
    })
    .optional(), // Generate file names you want (Optional)
});

export type CodegenConfig = z.infer<typeof CodegenConfigSchema>;

try {
  // Validate config
  const validatedConfig = CodegenConfigSchema.parse(codegenConfig);
  console.log("✅ Codegen Config Loaded:", validatedConfig);
} catch (err) {
  console.error("❌ Config error:", err.errors);
  process.exit(1); // Exit process
}

// Config ARGS
const enum CONFIG_ARGS_NAME {
  PLOP_ACTION = "generate-queries",
  GENERATE_ZOD_SCHEMA = "generate-zod-schema",
}

interface PostmanFormData {
  key: string;
  type: string;
  value: string;
}

interface APIData {
  method: string;
  formdata: PostmanFormData[] | null;
  rawBodyRequest: unknown | null;
  queryParams: PostmanFormData[] | null;
  response: unknown | null;
  url: string;
}

export interface PlopActionDataParams {
  name: string;
  queryParamsType?: string;
  responseType: string;
  apiPath: string;
  infiniteQueryName?: string;
  hasItems?: boolean;
  method?: string;
  isGenerateZod?: boolean;
}

// Base config Nodejs
const BUFFER_ENDCODING: BufferEncoding = "utf-8";

// Common Path Generate Config
const POSTMAN_JSON_PATH = codegenConfig.postmanJsonPath;
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

// Plop Generate Config
const PLOP_TEMPLATE_QUERY_PATH = codegenConfig.hbsTemplateQueryPath;
const PLOP_TEMPLATE_QUERY_WITH_PARAMS_PATH =
  codegenConfig.hbsTemplateQueryWithParamsPath;
const PLOP_TEMPLATE_MUTATION_PATH = codegenConfig.hbsTemplateMutationPath;
const PLOP_ACTION_GENERATE_NAME = CONFIG_ARGS_NAME.PLOP_ACTION;
const PLOP_DESCRIPTION_GENERATE =
  "Generate TanStack QueryOptions, MutationOptions, and QueryParams";
const PROPERTY_API_GET_LIST = codegenConfig.propertyApiGetList;

// Generate zod schema config
const LIMIT_PROCESS_GEN_ZOD_FILE = 5;

// Check Config options
const IS_MATCH_PLOP_ACTION_ARG = process.argv.includes(
  `${CONFIG_ARGS_NAME.PLOP_ACTION}`
);
const IS_GENERATE_ZOD_FILE = codegenConfig.enableZodGeneration ?? false;

function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}

const convertToKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
};

function transformFormDataToPayloadObject(arr: PostmanFormData[]) {
  return arr.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
}

const cleanUrl = (url) => {
  return url?.replace(/\{\{base_url\}\}/, "").split("?")[0];
};

const safeStringify = (json) => {
  return JSON.stringify(
    json,
    (_, value) =>
      typeof value === "undefined"
        ? null
        : typeof value === "bigint"
        ? value.toString()
        : value,
    2
  );
};

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
    });

    return lines.join("\n");
  } catch (err) {
    console.error("❌ Error in generateTypeScriptType:", err);
    console.error("❌ Stack Trace:", err.stack);
  }
};

const reduceDataFromPostmanData = (postmanDataObj) => {
  if (_.isObject(postmanDataObj)) {
    postmanDataObj[postmanDataObj["name"].replace(/[\s-]/g, "")] = {
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
    const folderPath = path.join(outputDir, convertToKebabCase(entity));
    let apiDataHasItems = false;

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    if (!_.isEmpty(apiData.formdata)) {
      const requestTypeContent = await generateTypeScriptType(
        transformFormDataToPayloadObject(apiData.formdata as PostmanFormData[]),
        `${entity}Request`
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
        `${entity}Request`
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
        `${entity}QueryParams`
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
        `${entity}Response`
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

    if (apiData.method === "GET") {
      if (apiData.queryParams) {
        actions.push({
          type: "add",
          path: `${folderPath}/${QUERY_GENERATE_FILE_NAME}`,
          templateFile: PLOP_TEMPLATE_QUERY_WITH_PARAMS_PATH,
          force: true,
          data: {
            name: entity,
            queryParamsType: `${entity}QueryParams`.replace(/[-/:]/g, ""),
            responseType: !_.isEmpty(apiData.response)
              ? `${entity}Response`.replace(/[-/:]/g, "")
              : null,
            apiPath: cleanUrl(apiData.url),
            infiniteQueryName: `${entity}Infinite`,
            hasItems: apiDataHasItems,
            isGenerateZod: IS_GENERATE_ZOD_FILE,
          } as PlopActionDataParams,
        });
      } else {
        actions.push({
          type: "add",
          path: `${folderPath}/${QUERY_GENERATE_FILE_NAME}`,
          templateFile: PLOP_TEMPLATE_QUERY_PATH,
          force: true,
          data: {
            name: entity,
            responseType: !_.isEmpty(apiData.response)
              ? `${entity}Response`.replace(/[-/:]/g, "")
              : null,
            apiPath: cleanUrl(apiData.url),
            infiniteQueryName: `${entity}Infinite`,
            hasItems: apiDataHasItems,
            isGenerateZod: IS_GENERATE_ZOD_FILE,
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
          name: entity,
          requestType:
            _.isEmpty(apiData.rawBodyRequest) && _.isEmpty(apiData.formdata)
              ? null
              : `${entity}Request`.replace(/[-/:]/g, ""),
          responseType: !_.isEmpty(apiData.response)
            ? `${entity}Response`.replace(/[-/:]/g, "")
            : null,
          apiPath: cleanUrl(apiData.url),
          method: apiData.method,
          isGenerateZod: IS_GENERATE_ZOD_FILE,
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
  const postmanJsonFile = path.join(process.cwd(), POSTMAN_JSON_PATH);
  const outputDir = path.join(process.cwd(), GENERATE_PATH);

  const postmanData = JSON.parse(
    fs.readFileSync(postmanJsonFile, BUFFER_ENDCODING)
  );

  const apiEndpoints = handleApiEndpoints(postmanData);

  const actions = await getPlopActions(apiEndpoints, outputDir);

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

  plop.setGenerator(PLOP_ACTION_GENERATE_NAME, {
    description: PLOP_DESCRIPTION_GENERATE,
    prompts: [],
    actions: actions,
  });
}
