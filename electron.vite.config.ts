import { resolve } from "path"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import vue from "@vitejs/plugin-vue"
import UnoCSS from "unocss/vite"

export default defineConfig({
    main: {
        resolve: {
            alias: {
                config: resolve("config"),
                vc: resolve("src/main"),
                res: resolve("resources"),
            },
        },
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            alias: {
                config: resolve("config"),
                "@renderer": resolve("src/renderer/src"),
                "@res": resolve("resources"),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@renderer/assets/style/global" as *;\n`,
                },
            },
        },
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "./src/renderer/index.html"),
                    about: resolve(__dirname, "src/renderer/about.html"),
                },
            },
        },
        plugins: [UnoCSS(), vue()],
    },
})
