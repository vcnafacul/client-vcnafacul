/*
  Tipos de `import.meta.env` para o `tsconfig.sw.json`. O `vite-env.d.ts` não
  entra lá porque puxa tipos de DOM (svg, vite-plugin-pwa/client).
*/
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
