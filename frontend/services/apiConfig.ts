const configuredUrl = import.meta.env.DEV ? import.meta.env.VITE_API_URL?.trim() : undefined;

export const API_URL = import.meta.env.PROD ? '/api' : (configuredUrl || 'http://localhost:4000/api');
