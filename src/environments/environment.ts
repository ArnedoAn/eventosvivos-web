declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

export const environment = {
  apiBaseUrl: (typeof window !== 'undefined' && window.__env?.apiUrl) || '/api',
};
