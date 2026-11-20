import js from "@eslint/js";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// jsx-a11y recomendado, tudo em warn dentro da branch; vira error na limpeza (tickets/059 §5.4).
const a11yWarn = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.recommended.rules).map((r) => [r, "warn"]),
);

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
      ...a11yWarn,
      // tickets/059: rebaixada até a limpeza (Task 13)
      "@typescript-eslint/no-explicit-any": "warn",
      // tickets/059: rebaixada até a limpeza (Task 13)
      "@typescript-eslint/no-this-alias": "warn",
      // tickets/059: rebaixada até a limpeza (Task 13)
      "@typescript-eslint/no-unused-vars": "warn",
      // tickets/059: rebaixada até a limpeza (Task 13)
      "@typescript-eslint/no-empty-object-type": "warn",
      // tickets/059: rebaixada até a limpeza (Task 13)
      "@typescript-eslint/no-unused-expressions": "warn",
      // tickets/059: rebaixada até a limpeza (Task 13)
      "react-hooks/rules-of-hooks": "warn",
      // tickets/059: rebaixada até a limpeza (Task 13)
      "no-useless-assignment": "warn",
      // tickets/059: rebaixada até a limpeza (Task 13)
      "preserve-caught-error": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
);
