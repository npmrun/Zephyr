import { Container, ContainerModule } from "inversify"
import { Setting } from "./setting"
import { DB } from "./db"
import { Api } from "./api"
import { WindowManager } from "./window-manager"
import { Tabs } from "./tabs"
import Commands from "./commands"
import Zephyr from "./zephyr"
import Updater from "./updater"

const modules = new ContainerModule(bind => {
  bind(Setting).toConstantValue(new Setting())
  bind(Zephyr).toSelf().inSingletonScope()
  bind(Updater).toSelf().inSingletonScope()
  bind(Api).toSelf().inSingletonScope()
  bind(WindowManager).toSelf().inSingletonScope()
  bind(Commands).toSelf().inSingletonScope()
  bind(Tabs).toSelf().inSingletonScope()
  bind(DB).toSelf().inSingletonScope()
})

async function destroyAllModules(ioc: Container) {
  await Promise.all([
    ioc.get(Setting).destroy(),
    ioc.get(WindowManager).destroy(),
    ioc.get(Commands).destroy(),
    ioc.get(Updater).destroy(),
    ioc.get(Zephyr).destroy(),
    ioc.get(Tabs).destroy(),
    ioc.get(Api).destroy(),
    ioc.get(DB).destroy(),
  ])
  ioc.unloadAsync(modules)
}

export default modules
export { modules, destroyAllModules }
