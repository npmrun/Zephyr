// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import VueMacros from "unplugin-vue-macros/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import VueRouter from "unplugin-vue-router/vite";
import Layouts from "vite-plugin-vue-layouts";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
var __electron_vite_injected_dirname = "D:\\@code\\xyx\\electron-app";
var electron_vite_config_default = defineConfig({
  main: {
    resolve: {
      alias: {
        config: resolve("config"),
        main: resolve("src/main"),
        common: resolve("src/common"),
        "@res": resolve("resources")
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      lib: {
        entry: {
          index: resolve(__electron_vite_injected_dirname, "./src/preload/index.ts"),
          plugin: resolve(__electron_vite_injected_dirname, "./src/preload/plugin.ts")
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: resolve(__electron_vite_injected_dirname, "./src/renderer"),
    resolve: {
      alias: {
        config: resolve("config"),
        common: resolve("src/common"),
        "@": resolve("src/renderer/src"),
        "@res": resolve("resources")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/style/global" as *;
`,
          api: "modern-compiler"
        }
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__electron_vite_injected_dirname, "./src/renderer/index.html"),
          about: resolve(__electron_vite_injected_dirname, "./src/renderer/about.html")
        }
      }
    },
    plugins: [
      UnoCSS(),
      VueMacros({
        plugins: {
          vue: vue(),
          vueJsx: vueJsx(),
          vueRouter: VueRouter({
            root: resolve(__electron_vite_injected_dirname, "src/renderer"),
            // https://github.com/posva/unplugin-vue-router
            extensions: [".vue", ".setup.tsx"],
            exclude: ["**/_ui"]
          })
        }
      }),
      VueI18nPlugin({
        compositionOnly: false,
        include: resolve(__electron_vite_injected_dirname, "packages/locales/languages/**")
      }),
      Layouts({
        layoutsDirs: "src/layouts",
        pagesDirs: "src/pages",
        defaultLayout: "default",
        extensions: ["vue", "setup.tsx"],
        exclude: ["**/_ui"]
      }),
      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: [
          "vue",
          "@vueuse/core",
          VueRouterAutoImports,
          {
            // add any other imports you were relying on
            "vue-router/auto": ["useLink"]
          },
          "vue-i18n"
        ],
        dts: true,
        dirs: ["src/composables"],
        vueTemplate: true
      }),
      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: true,
        dirs: ["src/components", "src/ui"],
        resolvers: [
          IconsResolver({
            prefix: "icon"
          })
        ]
      }),
      Icons(),
      // https://wf0.github.io/example/plugins/Formatter.html
      // @ts-ignore ...
      monacoEditorPlugin.default({
        publicPath: "monacoeditorwork",
        customDistPath() {
          return resolve(__electron_vite_injected_dirname, "out/renderer/monacoeditorwork");
        }
      })
    ]
  }
});
export {
  electron_vite_config_default as default
};
