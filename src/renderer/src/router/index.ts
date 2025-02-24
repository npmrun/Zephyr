import { createWebHashHistory, createRouter } from "vue-router"
import { routes as generatedRoutes, handleHotUpdate } from "vue-router/auto-routes"
import { setupLayouts } from "virtual:generated-layouts"

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export { router }

export default router

if (import.meta.hot) {
    handleHotUpdate(router)
}
