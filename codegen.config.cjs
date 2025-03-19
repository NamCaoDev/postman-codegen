module.exports = {
  postmanJsonPath: "examples/pos-postman-collection.json", // Postman Json Path
  generateOutputPath: "examples/generated", // Generated Folder path
  propertyApiGetList: "items", // With api get list fields includes list data
  enableZodGeneration: true, // Enable genearate schema
  typeConfigs: {
    allPropertiesOptional: true, // mark all properties will optional,
    inferEnums: true,
    inferDateTimes: true,
  },
  fetcher: "../../../helpers/fetcher",
  generateFileNames: {
    requestType: "apiRequests.ts",
    queryType: "apiQueries.ts",
    responseType: "apiResponses.ts",
    queryOptions: "query.ts",
    mutationOptions: "mutation.ts",
  }, // Generate file names you want (Optional)
};
