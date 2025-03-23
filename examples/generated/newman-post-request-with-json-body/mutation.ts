import { MutationOptions } from "@tanstack/react-query";
import { NewmanPostRequestWithJSONBodyRequest } from "./apiRequests";
import customFetch from "../../utils/fetcher";

export const newmanPostRequestWithJsonBodyMutationOptions = (): MutationOptions<
  null , 
  unknown,
  NewmanPostRequestWithJSONBodyRequest
> => ({
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
