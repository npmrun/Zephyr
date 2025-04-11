import 'logger/renderer-error'
import "simplebar-vue/dist/simplebar.min.css"
import "@unocss/reset/normalize.css"
import "@/assets/style/_common.scss"
import "virtual:uno.css"
import 'nprogress/nprogress.css';

import { createApp } from "vue"
import App from "./App.vue"

import pinia from "./store"
import router from "./router"
import i18n from "./i18n"

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, _, info) => {
  // console.error("应用错误:", err)
  // console.info("错误信息:", info)
  errorHandler.captureError(err)
  errorHandler.captureError(info)
  // 可以添加错误上报逻辑
}

// 开发环境下的性能监控
if (import.meta.env.DEV) {
  app.config.performance = true
}

app.use(i18n)
app.use(pinia)
app.use(router)
app.mount("#app")
