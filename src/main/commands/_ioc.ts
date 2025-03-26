import { Container, ContainerModule } from "inversify"
import BasicCommand from "./BasicCommand"
import TabsCommand from "./TabsCommand"
import UpdateCommand from "./UpdateCommand"

// TODO 考虑迁移，将所有命令都注册common/event中

const modules = new ContainerModule(bind => {
    bind("BasicCommand").to(BasicCommand).inSingletonScope()
    bind("TabsCommand").to(TabsCommand).inSingletonScope()
    bind("UpdateCommand").to(UpdateCommand).inSingletonScope()
})

async function destroyAllCommand(ioc: Container) {
    await ioc.unloadAsync(modules)
}

export { modules, destroyAllCommand }
export default modules
