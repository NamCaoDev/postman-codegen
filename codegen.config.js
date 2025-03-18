module.exports = {
  postmanJsonPath: "examples/postman-collection.json", // Postman Json Path
  generateOutputPath: "examples/generated", // Generated Folder path
  hbsTemplateQueryPath: "plop-templates/query.hbs", // Template hbs for query
  hbsTemplateQueryWithParamsPath: "plop-templates/queryWithParams.hbs", // Template hbs for query with search params
  hbsTemplateMutationPath: "plop-templates/mutation.hbs", // Template hbs for mutation
  propertyApiGetList: "items", // With api get list fields includes list data
  enableZodGeneration: true, // Enable genearate schema
  generateFileNames: {
    requestType: "apiRequests.ts",
    queryType: "apiQueries.ts",
    responseType: "apiResponses.ts",
    queryOptions: "query.ts",
    mutationOptions: "mutation.ts",
  }, // Generate file names you want (Optional)
};
