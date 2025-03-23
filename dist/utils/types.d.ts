import { GenerateTypeEnum } from "./schema";
export declare const enum CONFIG_ARGS_NAME {
    PLOP_ACTION = "generate-queries",
    GENERATE_ZOD_SCHEMA = "generate-zod-schema"
}
export interface PostmanFormData {
    key: string;
    type: string;
    value: string;
}
export interface APIData {
    method: string;
    formdata: PostmanFormData[] | null;
    rawBodyRequest: unknown | null;
    queryParams: PostmanFormData[] | null;
    response: unknown | null;
    url: string;
}
export interface PlopActionDataParams {
    generateType: GenerateTypeEnum;
    name: string;
    queryParamsType?: string;
    responseType: string;
    apiPath: string;
    infiniteQueryName?: string;
    hasItems?: boolean;
    method: string;
    isGenerateZod?: boolean;
    fetcher: string;
    template?: 'query' | 'queryWithParams' | 'mutation';
}
