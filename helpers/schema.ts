import { z } from "zod";

export enum GenerateModeEnum {
  Fetch = 'fetch',
  JsonFile = 'json_file'
}

export const CodegenConfigSchema = z.object({
  generateMode: z.nativeEnum(GenerateModeEnum), // Fetch | JsonFile
  postmanFetchConfigs: z.object({
    collectionId: z.string(),
    collectionAccessKey: z.string(),
  }).optional(),
  postmanJsonPath: z.string().optional(), // Postman Json Path
  generateOutputPath: z.string().min(1, "generateOutputPath is required"), // Generated Folder path
  propertyApiGetList: z.string().min(1, "propertyApiGetList is required"), // With api get list fields includes list data
  enableZodGeneration: z.boolean().optional(), // enabled zod,
  fetcher: z.string().min(1, "fetcher is required"), // Link fetcher
  typeConfigs: z
    .object({
      allPropertiesOptional: z.boolean().optional(), // mark all properties will optional,
      inferEnums: z.boolean().optional(),
      inferDateTimes: z.boolean().optional(),
    })
    .optional(), // Generate file names you want (Optional),
  generateFileNames: z
    .object({
      requestType: z.string().optional(),
      queryType: z.string().optional(),
      responseType: z.string().optional(),
      queryOptions: z.string().optional(),
      mutationOptions: z.string().optional(),
    })
    .optional(), // Generate file names you want (Optional)
}).superRefine((data, ctx) => {
  if (data.generateMode === GenerateModeEnum.Fetch && !data.postmanFetchConfigs) {
    ctx.addIssue({
      path: ["postmanFetchConfigs"],
      message: "postmanFetchConfigs is required when generateMode is 'fetch'.",
      code: z.ZodIssueCode.custom,
    });
  }
  if (data.generateMode === GenerateModeEnum.JsonFile && !data.postmanJsonPath) {
    ctx.addIssue({
      path: ["postmanJsonPath"],
      message: "postmanJsonPath is required when generateMode is 'json_file'.",
      code: z.ZodIssueCode.custom,
    });
  }
});

export type CodegenConfig = z.infer<typeof CodegenConfigSchema>;
