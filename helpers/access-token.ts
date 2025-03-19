export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
};

export const setAccessToken = (access_token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
};

export const deleteAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (refresh_token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
};

export const deleteRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
