import { Container, ContainerModule } from "inversify"

/**
 * 自动加载所有服务模块
 */
const serviceModules = import.meta.glob("./*.{ts,js}", { eager: true })

const modules = new ContainerModule(bind => {
  // 自动绑定所有服务类
  Object.values(serviceModules).forEach(module => {
    // 由于 module 类型为 unknown，需要进行类型断言
    const ServiceClass = (module as { default: any }).default
    if (ServiceClass && ServiceClass.name.endsWith("Service")) {
      const serviceName = ServiceClass.name
      bind(serviceName).to(ServiceClass).inSingletonScope()
    }
  })
})

/**
 * 销毁所有控制器绑定
 * @param ioc - Inversify 容器实例
 */
async function destroyAllController(ioc: Container) {
  await ioc.unloadAsync(modules)
}

export { modules, destroyAllController }
export default modules
