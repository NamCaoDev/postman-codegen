// eslint-disable
// @ts-nocheck
import customFetch from "../../utils/fetcher";

export const newmanPostRequestMutationOptions = () => ({
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
