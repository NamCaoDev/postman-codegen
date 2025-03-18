import { PlopTypes } from "@turbo/gen";
import { z } from "zod";
export declare const CodegenConfigSchema: z.ZodObject<{
    postmanJsonPath: z.ZodString;
    generateOutputPath: z.ZodString;
    hbsTemplateQueryPath: z.ZodString;
    hbsTemplateQueryWithParamsPath: z.ZodString;
    hbsTemplateMutationPath: z.ZodString;
    propertyApiGetList: z.ZodString;
    enableZodGeneration: z.ZodOptional<z.ZodBoolean>;
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
    postmanJsonPath?: string;
    generateOutputPath?: string;
    hbsTemplateQueryPath?: string;
    hbsTemplateQueryWithParamsPath?: string;
    hbsTemplateMutationPath?: string;
    propertyApiGetList?: string;
    enableZodGeneration?: boolean;
    generateFileNames?: {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    };
}, {
    postmanJsonPath?: string;
    generateOutputPath?: string;
    hbsTemplateQueryPath?: string;
    hbsTemplateQueryWithParamsPath?: string;
    hbsTemplateMutationPath?: string;
    propertyApiGetList?: string;
    enableZodGeneration?: boolean;
    generateFileNames?: {
        requestType?: string;
        queryType?: string;
        responseType?: string;
        queryOptions?: string;
        mutationOptions?: string;
    };
}>;
export type CodegenConfig = z.infer<typeof CodegenConfigSchema>;
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
export default function (plop: PlopTypes.NodePlopAPI): Promise<void>;
