import fs from "fs-extra";
import path from "path";
import { PostmanFormData } from "./types";
import { QUICK_TYPE_SPECIAL_CHARACTERS } from './constants';

export function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}

export const convertToKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

export function transformFormDataToPayloadObject(arr: PostmanFormData[]) {
  return arr.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
}

function toPascalCase(str: string) {
  const specialWords = new Set(QUICK_TYPE_SPECIAL_CHARACTERS)
  return str
      ?.split(/\s+/)
      ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      ?.map(word => {
        let lower = word.toLowerCase();
        return specialWords.has(lower) ? lower.toUpperCase() : word;
      })
      ?.join('');
}

export const cleanUrl = (url: string) => {
  return url?.replace(/^[^\/]+\/+/, "/").split("?")[0];
};

export function replaceQuicktypeSpecialWords(str: string) {
  return str.replace(/\b(api|id|http|url|json|xml|html|sql)\b/gi, (match) =>
    match.toUpperCase()
  );
}

export const cleanSpecialCharacter = (text: string, options?: {
  transformSpace?: boolean,
  pascalCase?: boolean,
}):string => {
  const cleanText = text?.replace(/[^a-zA-Z0-9\s]/g, options?.transformSpace ? ' ' : '');
  return options?.pascalCase ? toPascalCase(cleanText) : cleanText;
}

export const safeStringify = (json) => {
  return JSON.stringify(
    json,
    (_, value) =>
      typeof value === "undefined"
        ? null
        : typeof value === "bigint"
        ? value.toString()
        : value,
    2
  );
};

export const replaceTypeDuplicateString = (content: string): string => {
  const interfaceMap = {};
  let newContent = content;
  newContent = newContent.replace(/export interface (\w+)/g, (match, typeName) => {
  if (!interfaceMap[typeName]) {
    interfaceMap[typeName] = 1;
    return match; 
  }
  
  const newName = `${typeName}${interfaceMap[typeName]++}`;
  
  newContent = newContent.replace(new RegExp(`\\b${typeName}\\b`, "g"), newName);
  
  return `export interface ${newName}`;
  });
  return newContent;
}

export function fixDuplicateInterfacesBetweenStrings(baseContent, newContent, entityName) {
  const typeRegex = /export (interface|enum) (\w+)/g;
  const baseTypes = new Set();

  let match;
  while ((match = typeRegex.exec(baseContent)) !== null) {
    baseTypes.add(match[2]);
  }

  let updatedContent = newContent;
  const typeMap = {};
  let counter = 1;

  updatedContent = updatedContent.replace(typeRegex, (match, typeKind, typeName) => {
    if (!baseTypes.has(typeName)) {
      return match;
    }

    const newName = `${entityName}${typeName}${counter++}`;
    typeMap[typeName] = newName;

    return `export ${typeKind} ${newName}`;
  });

  for (const [oldName, newName] of Object.entries(typeMap)) {
    const usageRegex = new RegExp(`\\b${oldName}\\b`, "g"); 
    updatedContent = updatedContent.replace(usageRegex, newName);
  }

  return updatedContent;
}

export async function cleanGeneratedFolder(generatedFolderPath: string) {
  const GENERATED_FOLDER = path.join(process.cwd(), generatedFolderPath);
  try {
    if (await fs.pathExists(GENERATED_FOLDER)) {
      console.log("🧹 Cleaning up generated folder...");
      await fs.remove(GENERATED_FOLDER);
      console.log("✅ Cleaned generated folder.");
    }
    await fs.mkdirp(GENERATED_FOLDER);
    console.log('📂 Created fresh generated folder');
  } catch (error) {
    console.error("❌ Error cleaning generated folder:", error);
  }
}
