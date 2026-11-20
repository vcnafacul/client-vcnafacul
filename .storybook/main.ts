import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

// tickets/059 §5.1
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: [
    "../src/components/ui/**/*.stories.tsx",
    "../src/design-system/docs/**/*.mdx",
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  // O VitePWA registra service worker e manifest: não serve para o catálogo.
  // Os plugins podem vir aninhados em arrays, então achata antes de filtrar.
  viteFinal: async (viteConfig) => {
    const achatar = (lista: PluginOption[]): PluginOption[] =>
      lista.flatMap((p) => (Array.isArray(p) ? achatar(p) : [p]));
    viteConfig.plugins = achatar(viteConfig.plugins ?? []).filter(
      (p) =>
        !(
          p &&
          typeof p === "object" &&
          "name" in p &&
          typeof p.name === "string" &&
          p.name.startsWith("vite-plugin-pwa")
        ),
    );
    return viteConfig;
  },
};

export default config;
