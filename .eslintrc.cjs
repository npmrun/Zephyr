/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

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
        "prettier/prettier": [
            "error",
            {
                tabWidth: 4,
                useTabs: false,
                semi: false,
                singleQuote: false,
                trailingComma: "all",
                bracketSpacing: true,
                arrowParens: "avoid",
                printWidth: 140,
                htmlWhitespaceSensitivity: "ignore",
                proseWrap: "preserve",
                endOfLine: "auto",
            },
        ],
    },
}
