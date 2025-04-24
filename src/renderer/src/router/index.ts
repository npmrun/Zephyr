import { createWebHashHistory, createRouter, isNavigationFailure } from "vue-router"
import { routes as generatedRoutes, handleHotUpdate } from "vue-router/auto-routes"
import { setupLayouts } from "virtual:generated-layouts"
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, parent: "#page-container" })

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((_to, _from, next)=>{
  NProgress.start();
  return next()
})

router.afterEach((_to, _from, failure) => {
  NProgress.done();
  if (isNavigationFailure(failure)) {
    console.log('failed navigation', failure)
  }
})

export { router }

export default router

if (import.meta.hot) {
  handleHotUpdate(router)
}
