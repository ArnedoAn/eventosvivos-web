declare const process: { env: { API_BASE_URL?: string } };

export const environment = {
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:8080/api',
};
