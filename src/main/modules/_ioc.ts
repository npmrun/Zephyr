import { Container, ContainerModule } from "inversify"
import { DB } from "./db"
import { Api } from "./api"
import { WindowManager } from "./window-manager"
import { Tabs } from "./tabs"
import Commands from "./commands"
import Zephyr from "./zephyr"

const modules = new ContainerModule(bind => {
  bind(Zephyr).toSelf().inSingletonScope()
  bind(Api).toSelf().inSingletonScope()
  bind(WindowManager).toSelf().inSingletonScope()
  bind(Commands).toSelf().inSingletonScope()
  bind(Tabs).toSelf().inSingletonScope()
  bind(DB).toSelf().inSingletonScope()
})

async function destroyAllModules(ioc: Container) {
  await Promise.all([
    ioc.get(WindowManager).destroy(),
    ioc.get(Commands).destroy(),
    ioc.get(Zephyr).destroy(),
    ioc.get(Tabs).destroy(),
    ioc.get(Api).destroy(),
    ioc.get(DB).destroy(),
  ])
  ioc.unloadAsync(modules)
}

export default modules
export { modules, destroyAllModules }
