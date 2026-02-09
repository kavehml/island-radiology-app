// API Configuration
// Uses VITE_API_URL environment variable in production, falls back to relative /api in development
export const API_URL = import.meta.env.VITE_API_URL || '/api';
