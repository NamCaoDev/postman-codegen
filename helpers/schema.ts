import { z } from "zod";

export const CodegenConfigSchema = z.object({
  postmanJsonPath: z.string().min(1, "postmanJsonPath is required"), // Postman Json Path
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
});

export type CodegenConfig = z.infer<typeof CodegenConfigSchema>;
