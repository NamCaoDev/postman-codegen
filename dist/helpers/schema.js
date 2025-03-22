"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodegenConfigSchema = exports.GenerateModeEnum = void 0;
const zod_1 = require("zod");
var GenerateModeEnum;
(function (GenerateModeEnum) {
    GenerateModeEnum["Fetch"] = "fetch";
    GenerateModeEnum["JsonFile"] = "json_file";
})(GenerateModeEnum || (exports.GenerateModeEnum = GenerateModeEnum = {}));
exports.CodegenConfigSchema = zod_1.z.object({
    generateMode: zod_1.z.nativeEnum(GenerateModeEnum), // Fetch | JsonFile
    postmanFetchConfigs: zod_1.z.object({
        collectionId: zod_1.z.string(),
        collectionAccessKey: zod_1.z.string(),
    }).optional(),
    postmanJsonPath: zod_1.z.string().optional(), // Postman Json Path
    generateOutputPath: zod_1.z.string().min(1, "generateOutputPath is required"), // Generated Folder path
    propertyApiGetList: zod_1.z.string().min(1, "propertyApiGetList is required"), // With api get list fields includes list data
    enableZodGeneration: zod_1.z.boolean().optional(), // enabled zod,
    fetcher: zod_1.z.string().min(1, "fetcher is required"), // Link fetcher
    typeConfigs: zod_1.z
        .object({
        allPropertiesOptional: zod_1.z.boolean().optional(), // mark all properties will optional,
        inferEnums: zod_1.z.boolean().optional(),
        inferDateTimes: zod_1.z.boolean().optional(),
    })
        .optional(), // Generate file names you want (Optional),
    generateFileNames: zod_1.z
        .object({
        requestType: zod_1.z.string().optional(),
        queryType: zod_1.z.string().optional(),
        responseType: zod_1.z.string().optional(),
        queryOptions: zod_1.z.string().optional(),
        mutationOptions: zod_1.z.string().optional(),
    })
        .optional(), // Generate file names you want (Optional)
}).superRefine((data, ctx) => {
    if (data.generateMode === GenerateModeEnum.Fetch && !data.postmanFetchConfigs) {
        ctx.addIssue({
            path: ["postmanFetchConfigs"],
            message: "postmanFetchConfigs is required when generateMode is 'fetch'.",
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
    if (data.generateMode === GenerateModeEnum.JsonFile && !data.postmanJsonPath) {
        ctx.addIssue({
            path: ["postmanJsonPath"],
            message: "postmanJsonPath is required when generateMode is 'json_file'.",
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
