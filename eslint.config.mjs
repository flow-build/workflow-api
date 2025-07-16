// @ts-check

//import tseslint from "typescript-eslint";

//export default tseslint.config(tseslint.configs.recommended);

import { builtinModules } from "module";

import jsLint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import tsLint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,mjs,ts,mts}"],
    languageOptions: {
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  },
  // rules
  jsLint.configs.recommended,
  ...tsLint.configs.recommended,
  {
    plugins: {
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            [`node:`, `^(${builtinModules.join("|")})(/|$)`],
            // Parent imports. Put `..` last.
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Other relative imports. Put same-folder imports and `.` last.
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  stylistic.configs["disable-legacy"],
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: false,
    commaDangle: "never",
  }),
  {
    ignores: ["node_modules", "**/node_modules"],
  },
];
