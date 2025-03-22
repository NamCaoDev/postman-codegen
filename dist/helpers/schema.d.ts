import { z } from "zod";
export declare enum GenerateModeEnum {
    Fetch = "fetch",
    JsonFile = "json_file"
}
export declare const CodegenConfigSchema: z.ZodEffects<z.ZodObject<{
    generateMode: z.ZodNativeEnum<typeof GenerateModeEnum>;
    postmanFetchConfigs: z.ZodOptional<z.ZodObject<{
        collectionId: z.ZodString;
        collectionAccessKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        collectionId?: string;
        collectionAccessKey?: string;
    }, {
        collectionId?: string;
        collectionAccessKey?: string;
    }>>;
    postmanJsonPath: z.ZodOptional<z.ZodString>;
    generateOutputPath: z.ZodString;
    propertyApiGetList: z.ZodString;
    enableZodGeneration: z.ZodOptional<z.ZodBoolean>;
    fetcher: z.ZodString;
    typeConfigs: z.ZodOptional<z.ZodObject<{
        allPropertiesOptional: z.ZodOptional<z.ZodBoolean>;
        inferEnums: z.ZodOptional<z.ZodBoolean>;
        inferDateTimes: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        allPropertiesOptional?: boolean;
        inferEnums?: boolean;
        inferDateTimes?: boolean;
    }, {
        allPropertiesOptional?: boolean;
        inferEnums?: boolean;
        inferDateTimes?: boolean;
    }>>;
    generateFileNames: z.ZodOptional<z.ZodObject<{
        requestType: z.ZodOptional<z.ZodString>;
        queryType: z.ZodOptional<z.ZodString>;
        responseType: z.ZodOptional<z.ZodString>;
        queryOptions: z.ZodOptional<z.ZodString>;
        mutationOptions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    }, {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    generateMode?: GenerateModeEnum;
    postmanFetchConfigs?: {
        collectionId?: string;
        collectionAccessKey?: string;
    };
    postmanJsonPath?: string;
    generateOutputPath?: string;
    propertyApiGetList?: string;
    enableZodGeneration?: boolean;
    fetcher?: string;
    typeConfigs?: {
        allPropertiesOptional?: boolean;
        inferEnums?: boolean;
        inferDateTimes?: boolean;
    };
    generateFileNames?: {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    };
}, {
    generateMode?: GenerateModeEnum;
    postmanFetchConfigs?: {
        collectionId?: string;
        collectionAccessKey?: string;
    };
    postmanJsonPath?: string;
    generateOutputPath?: string;
    propertyApiGetList?: string;
    enableZodGeneration?: boolean;
    fetcher?: string;
    typeConfigs?: {
        allPropertiesOptional?: boolean;
        inferEnums?: boolean;
        inferDateTimes?: boolean;
    };
    generateFileNames?: {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    };
}>, {
    generateMode?: GenerateModeEnum;
    postmanFetchConfigs?: {
        collectionId?: string;
        collectionAccessKey?: string;
    };
    postmanJsonPath?: string;
    generateOutputPath?: string;
    propertyApiGetList?: string;
    enableZodGeneration?: boolean;
    fetcher?: string;
    typeConfigs?: {
        allPropertiesOptional?: boolean;
        inferEnums?: boolean;
        inferDateTimes?: boolean;
    };
    generateFileNames?: {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    };
}, {
    generateMode?: GenerateModeEnum;
    postmanFetchConfigs?: {
        collectionId?: string;
        collectionAccessKey?: string;
    };
    postmanJsonPath?: string;
    generateOutputPath?: string;
    propertyApiGetList?: string;
    enableZodGeneration?: boolean;
    fetcher?: string;
    typeConfigs?: {
        allPropertiesOptional?: boolean;
        inferEnums?: boolean;
        inferDateTimes?: boolean;
    };
    generateFileNames?: {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    };
}>;
export type CodegenConfig = z.infer<typeof CodegenConfigSchema>;
