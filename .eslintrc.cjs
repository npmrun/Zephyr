const { readFileSync } = require("node:fs")

/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

const prettierConfig = JSON.parse(readFileSync("./.prettierrc", { encoding: "utf-8" }))

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@electron-toolkit",
    "@electron-toolkit/eslint-config-ts/eslint-recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],
  rules: {
    "vue/require-default-prop": "off",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": ["error", prettierConfig],
  },
}
