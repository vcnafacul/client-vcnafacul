import js from "@eslint/js";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "storybook-static", "coverage", ".superpowers"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // Convenção do repo: prefixo `_` marca parâmetro/variável intencionalmente não usado (tickets/059).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // `role="list"` em ul/ol é intencional: com `list-style: none` (preflight do Tailwind) o Safari/VoiceOver
      // deixa de anunciar a lista sem ele.
      "jsx-a11y/no-redundant-roles": ["error", { ul: ["list"], ol: ["list"] }],
      // `<label>` envolvendo `input` + texto em `div > span` passa de 2 níveis de profundidade (padrão da regra).
      "jsx-a11y/label-has-associated-control": ["error", { depth: 3 }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // Padrão shadcn: o componente e o `cva` das suas variantes (e hooks do contexto) vivem no mesmo
    // arquivo. Só afeta o fast refresh em dev, não o build.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
);
