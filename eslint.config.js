import eslintPluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  ...eslintPluginVue.configs["flat/recommended"],
  {
    files: ["**/*.ts"],
    languageOptions: { parser: tseslint.parser },
  },
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  eslintConfigPrettier,
);
