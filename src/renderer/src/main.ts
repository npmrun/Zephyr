import "simplebar-vue/dist/simplebar.min.css"
import "@unocss/reset/normalize.css"
import "@/assets/style/_common.scss"
import "virtual:uno.css"

import { createApp } from "vue"
import App from "./App.vue"

import router from "./router"
import i18n from "./i18n"

const app = createApp(App)
app.use(i18n)
app.use(router as any)
app.mount("#app")
