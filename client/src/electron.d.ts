export {};

declare global {
  interface Window {
    auth: {
      beginGoogle: () => Promise<{ authenticated: boolean }>;
      session: () => Promise<{ authenticated: boolean }>;
      logout: () => Promise<{ authenticated: boolean }>;
    };
  }
}
