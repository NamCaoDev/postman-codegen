import { PostmanFormData } from "./types";
export declare function isValidJSON(jsonString: any): boolean;
export declare const convertToKebabCase: (str: any) => any;
export declare function transformFormDataToPayloadObject(arr: PostmanFormData[]): {};
export declare const cleanUrl: (url: string) => string;
export declare function replaceQuicktypeSpecialWords(str: string): string;
export declare const cleanSpecialCharacter: (text: string, options?: {
    transformSpace?: boolean;
    pascalCase?: boolean;
}) => string;
export declare const safeStringify: (json: any) => string;
export declare function cleanGeneratedFolder(generatedFolderPath: string): Promise<void>;
