// import fs from "fs"
const fs = require("fs")
const text = fs.readFileSync("./config/exe_config.json", "utf8")
const ExeConfig = JSON.parse(text)

module.exports = {
  appId: ExeConfig.appId,
  productName: ExeConfig.name,
  directories: {
    buildResources: "build",
  },
  files: [
    "out/**/*",
    "package.json",
    "!**/.vscode/*",
    "!src/*",
    "!electron.vite.config.{js,ts,mjs,cjs}",
    "!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}",
    "!{.env,.env.*,.npmrc,pnpm-lock.yaml}",
    "!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}",
  ],
  asarUnpack: ["node_modules/sqlite3", "out/main/chunks/*.node", "resources/*"],
  win: {
    executableName: ExeConfig.win.executableName,
  },
  nsis: {
    artifactName: "${name}-${version}-setup.${ext}",
    shortcutName: "${productName}",
    uninstallDisplayName: "${productName}",
    createDesktopShortcut: "always",
  },
  dmg: {
    artifactName: "${name}-${version}.${ext}",
  },
  linux: ExeConfig.linux,
  appImage: {
    artifactName: "${name}-${version}.${ext}",
  },
  npmRebuild: false,
  publish: ExeConfig.publish,
  electronDownload: {
    mirror: "https://npmmirror.com/mirrors/electron/",
  },
}
