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

To configure the library, create a codegen.config.cjs file in your root project with the following examples options:

```js
/**
 * @namcaodev/postman-codegen configuration.
 *
 * @type {import("@namcaodev/postman-codegen").CodegenConfig}
 */

module.exports = {
  generateType: 'seperate', // 'seperate' | 'combine',
  generateMode: 'json_file', // 'fetch' | 'json_file'
  postmanFetchConfigs: {
    collectionId: '<YOUR_COLLECTION_ID>',
    collectionAccessKey: '<YOUR_COLLECTION_ACCESS_KEY>'
  }, // Config for fetch Postman document (Require when generate mode is fetch)
  postmanJsonPath: "examples/postman-collection.json", // Postman Json Path (Require when generate mode is json_file)
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

The generated files will be saved in the folder specified in generateOutputPath (e.g., [generated](/examples/generated)).

### 3. Usage in React Component

Next, easy usage in your React Component with full type safe power [demo.tsx](/examples/demo.tsx)

```tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  newmanGetRequestQueryOptions,
  newmanGetRequestQueryKeys,
} from "./generated/newman-get-request/query";

const DemoCodegen = () => {
  const query = useQuery({
    ...newmanGetRequestQueryOptions({
      source: "test",
    }),
  });
  const queryKeys = newmanGetRequestQueryKeys({ source: "test" });
  console.log("Data response", query);
  console.log("Query keys", queryKeys);
  return <div>DemoCodegen</div>;
};

export default DemoCodegen;
```
⚠️ Warning

With your custom fetcher you must follow the standard interface and function creation here:

```ts
export interface CustomFetchParams<TBody> {
  url: string;
  method: string;
  options?: RequestInit;
  body?: TBody;
}

export const customFetch = async <TResponseData = undefined, TBody = undefined>(
  params: CustomFetchParams<TBody>
): Promise<TResponseData> => {
  // You will handle your fetch here
};

export default customFetch; // You must be export default it
```

You can see an example in the source code here: [fetcher.ts](/helpers/fetcher.ts) and how it is handled here: [queryWithParams.hbs](/plop-templates/queryWithParams.hbs).

## 🔧 Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `generateType` | `'seperate' \| 'combine'` | ❌ No (Default: `seperate`) | `'separate'`: Generates separate folders/files for each API path. `'combine'`: Merges all types and queries into a single file. |
| `generateMode` | `'fetch' \| 'json_file'` | ✅ Yes | Determines how data is retrieved from Postman. `'fetch'` fetches the collection via API, while `'json_file'` uses an exported JSON file. |
| `postmanFetchConfigs.collectionId` | `string` | 🔹 If `generateMode` = `'fetch'` | The Postman Collection ID to fetch. |
| `postmanFetchConfigs.collectionAccessKey` | `string` | 🔹 If `generateMode` = `'fetch'` | The API Key required to access the collection from Postman API. |
| `postmanJsonPath` | `string` | 🔹 If `generateMode` = `'json_file'` | Path to the exported Postman JSON file. |
| `generateOutputPath` | `string` | ✅ Yes | Directory where the generated files will be stored. |
| `propertyApiGetList` | `string` | ✅ Yes | The key containing the list of data in the API response. |
| `enableZodGeneration` | `boolean` | ❌ No (Default: `false`) | If `true`, automatically generates Zod schemas. |
| `typeConfigs.allPropertiesOptional` | `boolean` | ❌ No (Default: `false`) | If `true`, all properties will be optional. |
| `typeConfigs.inferEnums` | `boolean` | ❌ No (Default: `false`) | If `true`, automatically infers enums from API responses. |
| `typeConfigs.inferDateTimes` | `boolean` | ❌ No (Default: `false`) | If `true`, automatically detects datetime fields in responses. |
| `fetcher` | `string` | ✅ Yes | Path to a custom fetcher function. |
| `generateFileNames.requestType` | `string` | ❌ No (Default: `apiRequests.ts`) | Filename for API request definitions. |
| `generateFileNames.queryType` | `string` | ❌ No (Default: `apiQueries.ts`) | Filename for API queries. |
| `generateFileNames.responseType` | `string` | ❌ No (Default: `apiResponses.ts`) | Filename for API response types. |
| `generateFileNames.queryOptions` | `string` | ❌ No (Default: `query.ts`) | Filename for query options. |
| `generateFileNames.mutationOptions` | `string` | ❌ No (Default: `mutation.ts`) | Filename for mutation options. |

📌 **Notes:**  
- If `generateMode = 'fetch'`, **both** `postmanFetchConfigs.collectionId` and `postmanFetchConfigs.collectionAccessKey` are **required**.  

- If `generateMode = 'json_file'`, **postmanJsonPath** is **required**.  

- ⚡ **Using `generateMode = 'fetch'` allows you to sync updates from your backend in Postman documents instantly.**  

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
