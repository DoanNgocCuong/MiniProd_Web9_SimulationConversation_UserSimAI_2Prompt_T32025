// Helper to manage environment variables
export const getWebSocketUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8000';
}; 