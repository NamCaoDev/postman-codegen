import querystring from 'query-string';
import { NewmanGetRequestQueryParams } from "./apiQueries";
import customFetch from "../../utils/fetcher";

type QueryParamsCompatible<T> = {
  [K in keyof T]: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | null;
};

function convertQueryParams<T extends object>(params: T): QueryParamsCompatible<T> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ])
  ) as QueryParamsCompatible<T>;
}



export const newmanGetRequestQueryOptions = (params: NewmanGetRequestQueryParams) => ({
  queryKey: ['NewmanGetRequest', params],
  queryFn: async () => {
    const queryString = querystring.stringify(convertQueryParams(params));

    const res = await customFetch({
      url: `/postman-echo.com/get` + (queryString ? `?${queryString}` : ''),
      method: 'GET' 
    });

    const resWithParse = 
    res;

    return resWithParse;
  },
});

export const newmanGetRequestQueryKeys = (params: NewmanGetRequestQueryParams) => {
  return ['NewmanGetRequest', params];
} 

