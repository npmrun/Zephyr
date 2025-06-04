import { Container, ContainerModule } from "inversify"

/**
 * 自动加载所有命令模块
 */
const commandModules = import.meta.glob("./event/**/main/command.{ts,js}", { eager: true })

const modules = new ContainerModule(bind => {
  // 自动绑定所有命令类
  Object.values(commandModules).forEach(module => {
    // 由于 module 类型为 unknown，先进行类型断言为包含 default 属性的对象
    const CommandClass = (module as { default: any }).default
    if (CommandClass) {
      const className = CommandClass.name.replace("Command", "")
      if (CommandClass["init"]) {
        CommandClass["init"]()
      }
      bind(className + "Command")
        .to(CommandClass)
        .inSingletonScope()
    }
  })
})

/**
 * 销毁所有命令绑定
 * @param ioc - Inversify 容器实例
 */
async function destroyAllCommand(ioc: Container) {
  await ioc.unloadAsync(modules)
}

export { modules, destroyAllCommand }
export default modules
