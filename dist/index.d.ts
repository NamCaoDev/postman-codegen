import { PlopTypes } from "@turbo/gen";
import { CodegenConfig, GenerateModeEnum } from "./helpers/schema";
import { CONFIG_ARGS_NAME, PostmanFormData, APIData, PlopActionDataParams } from "./helpers/types";
export type { CONFIG_ARGS_NAME, PostmanFormData, APIData, PlopActionDataParams, CodegenConfig, GenerateModeEnum };
export default function (plop: PlopTypes.NodePlopAPI): Promise<void>;
