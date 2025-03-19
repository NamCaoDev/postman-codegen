# Postman Codegen

![GitHub license](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/npm/v/@namcaodev/postman-codegen)
![Build Status](https://img.shields.io/github/actions/workflow/status/namcaodev1/@namcaodev/postman-codegen/ci.yml)

Postman Codegen is a tool that helps you automatically generate typescript files, tanstack queries easily from postman json

## ✨ Features

- 📌 Support full feature codegen typescript, tanstack query for people
- ⚡ Optimized performance and easy to use
- 🔧 Easily integrates with TypeScript projects

## 📦 Installation

Install via npm or yarn:

```sh
npm install @namcaodev/postman-codegen
# or
yarn add @namcaodev/postman-codegen
```

## 🚀 Usage

### 1. Create codegen.config.cjs

To configure the library, create a codegen.config.cjs file with the following examples options:

```js
/**
 * @namcaodev/postman-codegen configuration.
 *
 * @type {import("@namcaodev/postman-codegen").CodegenConfig}
 */

module.exports = {
  postmanJsonPath: "examples/postman-collection.json", // Postman Json Path
  generateOutputPath: "examples/generated", // Generated Folder path
  propertyApiGetList: "items", // API response field containing list data
  enableZodGeneration: true, // Enable zod schema generation
  typeConfigs: {
    allPropertiesOptional: true, // Mark all properties as optional
    inferEnums: true, // inferEnums to string
    inferDateTimes: true, // inferDateTimes to string
  }, // Type configs for generate (Optional)
  fetcher: "../../../helpers/fetcher", // Link to your custom fetcher
  generateFileNames: {
    requestType: "apiRequests.ts",
    queryType: "apiQueries.ts",
    responseType: "apiResponses.ts",
    queryOptions: "query.ts",
    mutationOptions: "mutation.ts",
  }, // Customize generated file names (Optional)
};
```

### 2. Run the command

After adding the configuration file, run the following command to generate the code:

```sh
npx postman-codegen
```

The generated files will be saved in the folder specified in generateOutputPath (e.g., examples/generated).

## 🔧 Configuration Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `postmanJsonPath` | `string` | Path to the Postman collection JSON file | ✅ |
| `generateOutputPath` | `string` | Path where the generated files will be stored | ✅ |
| `propertyApiGetList` | `string` | Field in API responses that contains list data | ✅ |
| `enableZodGeneration` | `boolean` | Enables the generation of Zod schemas | ❌ (default: `false`) |
| `typeConfigs.allPropertiesOptional` | `boolean` | Marks all properties as optional in generated types | ❌ (default: `false`) |
| `typeConfigs.inferEnums` | `boolean` | Infers enums from values automatically | ❌ (default: `false`) |
| `typeConfigs.inferDateTimes` | `boolean` | Infers date-time fields automatically | ❌ (default: `false`) |
| `fetcher` | `string` | Path to the custom fetcher module | ✅ |
| `generateFileNames.requestType` | `string` | Filename for API request types | ❌ (default: `apiRequests.ts`) |
| `generateFileNames.queryType` | `string` | Filename for API query types | ❌ (default: `apiQueries.ts`) |
| `generateFileNames.responseType` | `string` | Filename for API response types | ❌ (default: `apiResponses.ts`) |
| `generateFileNames.queryOptions` | `string` | Filename for query options | ❌ (default: `query.ts`) |
| `generateFileNames.mutationOptions` | `string` | Filename for mutation options | ❌ (default: `mutation.ts`) |

## 🛠 Contributing

If you want to contribute, please fork the repository and submit a pull request!

```sh
git clone https://github.com/NamCaoDev/postman-codegen.git
cd postman-codegen
npm install
npx postman-codegen
```

## 📜 License

Distributed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## 🌍 Contact

- 📧 Email: namcaodev@gmail.com
- 🐦 Twitter: [@namcaodev](https://twitter.com/namcaodev)

Thank you for using **Postman Codegen Library**! 🚀






