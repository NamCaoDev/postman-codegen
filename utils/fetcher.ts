import { getAccessToken } from "./access-token";

export class UnauthenticatedError extends Error {
  name: string = "UnauthenticatedError";
}

export class RefreshTokenError extends Error {
  name: string = "RefreshTokenError";
}

export type CustomError<T = unknown> = T & {
  response?: { status: number; errors: { message: string }[] };
};

export type APIResponse<TData, TError> = {
  success: boolean;
  data?: TData;
  message: string;
  error?: TError;
};

export const enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface CustomFetchParams<TBody> {
  url: string;
  method: string;
  options?: RequestInit;
  body?: TBody;
}

const API_URL = "https://example.com";

const REFRESH_TOKEN_URL = "https://example.com/api/v2/refresh_token";

const BASE_HEADERS = {
  headers: {
    "Content-Type": "application/json",
  },
};

const serializeBody = <TBody>(body: TBody) =>
  JSON.stringify(body);

const getUrl = (url: string) => {
  if (url.startsWith("/")) {
    return API_URL + url;
  }
  return API_URL + "/" + url;
};

const getOptions = (options?: RequestInit, accessToken?: string) => {
  if (!options) {
    return {
      headers: {
        ...BASE_HEADERS.headers,
        Authorization: accessToken ? "Bearer " + accessToken : "",
      },
    };
  }
  return {
    ...options,
    headers: {
      ...BASE_HEADERS.headers,
      ...options.headers,
      Authorization: accessToken ? "Bearer " + accessToken : "",
    },
  };
};

const getOptionsByMethod = <TBody>(params: CustomFetchParams<TBody>) => {
  const { method } = params;
  const accessToken = getAccessToken();
  switch (method) {
    case RequestMethod.GET:
      return getOptions(params?.options, accessToken);
    case RequestMethod.POST:
      return getOptions(
        {
          ...params?.options,
          method: method,
          body: params?.body ? serializeBody(params?.body) : "",
        },
        accessToken
      );
    case RequestMethod.PATCH:
      return getOptions(
        {
          ...params?.options,
          method: method,
          body: params?.body ? serializeBody(params?.body) : "",
        },
        accessToken
      );
    case RequestMethod.PUT:
      return getOptions(
        {
          ...params?.options,
          method: method,
          body: params?.body ? serializeBody(params?.body) : "",
        },
        accessToken
      );
    case RequestMethod.DELETE:
      return getOptions(
        {
          ...params?.options,
          method: "DELETE",
        },
        accessToken
      );
  }
};

const refreshToken = async () => {
  return await fetch(REFRESH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
};

let refreshPromise: Promise<Response> | null = null;

async function retryFetching<TData>({
  fetcher,
}: {
  fetcher: () => Promise<TData>;
}): Promise<TData> {
  if (!refreshPromise) {
    refreshPromise = refreshToken();
  }

  const refreshRes = await refreshPromise?.finally(() => {
    refreshPromise = null;
  });

  if (!refreshRes.ok) {
    throw new RefreshTokenError("Refresh token failed in failed");
  }

  try {
    return await fetcher();
  } catch (error) {
    throw error as CustomError;
  }
}

const fetchingWithJson = async <TBody>(params: CustomFetchParams<TBody>) => {
  const res = await fetch(getUrl(params.url), getOptionsByMethod(params));
  return await res.json();
};

export const customFetch = async <TResponseData = undefined, TBody = undefined>(
  params: CustomFetchParams<TBody>
): Promise<TResponseData> => {
  try {
    return await fetchingWithJson(params);
  } catch (error) {
    const parsedError = error as CustomError;

    if (parsedError instanceof UnauthenticatedError) {
      return await retryFetching({
        fetcher: () => fetchingWithJson(params),
      });
    }

    throw parsedError;
  }
};

export default customFetch;
