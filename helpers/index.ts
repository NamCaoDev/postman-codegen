import { PostmanFormData } from "./types";

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
    .toLowerCase();
};

export function transformFormDataToPayloadObject(arr: PostmanFormData[]) {
  return arr.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
}

export const cleanUrl = (url: string) => {
  return url?.replace(/^[^\/]+\/+/, "/").split("?")[0];
};

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
