import { createWebHashHistory, createRouter } from "vue-router"
import { routes } from "vue-router/auto-routes"

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export { router }

export default router
