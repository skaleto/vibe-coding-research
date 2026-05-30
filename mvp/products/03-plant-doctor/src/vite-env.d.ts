/// <reference types="vite/client" />

declare const __OTA_BACKEND_URL__: string;
declare const __GATEWAY_URL__: string;
declare const __APP_ID__: string;
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL?: string;
  readonly VITE_OTA_BACKEND_URL?: string;
  readonly VITE_APP_ID?: string;
  readonly VITE_PRODUCT_INDEX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
