import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

const reactRecommended = pluginReact.configs.flat.recommended;
const reactHooksRecommended = pluginReactHooks.configs.recommended;
const jsxA11yRecommended = pluginJsxA11y.flatConfigs.recommended;

export default [
  {
    ignores: ["dist/**", "assets/**", "node_modules/**", "build/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
    rules: {
      ...reactRecommended.rules,
      ...reactHooksRecommended.rules,
      ...jsxA11yRecommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
