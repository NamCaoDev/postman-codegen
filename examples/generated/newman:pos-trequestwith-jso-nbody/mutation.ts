import { MutationOptions } from "@tanstack/react-query";
import { NewmanPOSTrequestwithJSONbodyRequest } from "./apiRequests";
import customFetch from "../../../helpers/fetcher";

export const newmanPosTrequestwithJsoNbodyMutationOptions = (): MutationOptions<
  null , 
  unknown,
  NewmanPOSTrequestwithJSONbodyRequest
> => ({
  mutationFn: async (data) => {
    const res = await customFetch<null, NewmanPOSTrequestwithJSONbodyRequest>({
      url: '',
      method: 'POST',
      body: data, 
    });

    const resWithParse =     res

    return resWithParse;
  },
});
