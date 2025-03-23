export declare class UnauthenticatedError extends Error {
    name: string;
}
export declare class RefreshTokenError extends Error {
    name: string;
}
export type CustomError<T = unknown> = T & {
    response?: {
        status: number;
        errors: {
            message: string;
        }[];
    };
};
export type APIResponse<TData, TError> = {
    success: boolean;
    data?: TData;
    message: string;
    error?: TError;
};
export declare const enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    PUT = "PUT",
    DELETE = "DELETE"
}
export interface CustomFetchParams<TBody> {
    url: string;
    method: string;
    options?: RequestInit;
    body?: TBody;
}
export declare const customFetch: <TResponseData = undefined, TBody = undefined>(params: CustomFetchParams<TBody>) => Promise<TResponseData>;
export default customFetch;
