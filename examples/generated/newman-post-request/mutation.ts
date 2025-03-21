import { MutationOptions } from "@tanstack/react-query";
import customFetch from "../../../helpers/fetcher";

export const newmanPostRequestMutationOptions = (): MutationOptions<
  null , 
  unknown
  
> => ({
  mutationFn: async (data) => {
    const res = await customFetch<null >({
      url: '',
      method: 'POST',
      body: data, 
    });

    const resWithParse =     res

    return resWithParse;
  },
});
