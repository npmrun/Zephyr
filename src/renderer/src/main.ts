import "virtual:uno.css"
import "@unocss/reset/normalize.css"
import "@/assets/style/_common.scss"

import { createApp } from "vue"
import App from "./App.vue"

import router from "./router"

const app = createApp(App)
app.use(router as any)
app.mount("#app")
