import querystring from 'querystring';
import { NewmanGETrequestQueryParams } from "./apiQueries";
import customFetch from "@/lib/fetch";

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



export const newmanGeTrequestQueryOptions = (params: NewmanGETrequestQueryParams) => ({
  queryKey: ['Newman:GETrequest', params],
  queryFn: async () => {
    const queryString = querystring.stringify(convertQueryParams(params));

    const res = await customFetch({
      url: `https://postman-echo.com/get` + (queryString ? `?${queryString}` : ''),
      method: 'GET' 
    });

    const resWithParse = 
    res;

    return resWithParse;
  },
});

export const newmanGeTrequestQueryKeys = (params: NewmanGETrequestQueryParams) => {
  return ['Newman:GETrequest', params];
} 

