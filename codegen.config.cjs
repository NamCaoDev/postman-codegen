/**
 * @namcaodev/postman-codegen configuration.
 *
 * @type {import("./dist/index").CodegenConfig}
 */

module.exports = {
  generateMode: 'fetch', // 'fetch' | 'json_file'
  postmanFetchConfigs: {
    collectionId: '<YOUR_COLLECTION_ID>',
    collectionAccessKey: '<YOUR_COLLECTION_ACCESS_KEY>'
  }, // Config for fetch Postman document (Require when generate mode is fetch)
  postmanJsonPath: 'examples/postman-collection.json', // Postman Json Path (Require when generate mode is json_file)
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
