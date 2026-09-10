/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the live Zenom Alpha API. Unset → the committed fixture is used. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
