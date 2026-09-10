/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute base URL of the Express API (no trailing slash). Empty in dev to use the Vite proxy. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
