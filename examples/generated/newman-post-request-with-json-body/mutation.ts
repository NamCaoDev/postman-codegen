// eslint-disable
// @ts-nocheck
import { NewmanPostRequestWithJSONBodyRequest } from "./apiRequests";
import customFetch from "../../utils/fetcher";

export const newmanPostRequestWithJsonBodyMutationOptions = () => ({
  mutationFn: async (data) => {
    const res = await customFetch<null, NewmanPostRequestWithJSONBodyRequest>({
      url: '',
      method: 'POST',
      body: data, 
    });

    const resWithParse =     res

    return resWithParse;
  },
});
