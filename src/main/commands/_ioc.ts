import { Container, ContainerModule } from "inversify"
import BasicCommand from "./BasicCommand"
import TabsCommand from "./TabsCommand"

const modules = new ContainerModule(bind => {
    bind("BasicCommand").to(BasicCommand).inSingletonScope()
    bind("TabsCommand").to(TabsCommand).inSingletonScope()
})

async function destroyAllCommand(ioc: Container) {
    await ioc.unloadAsync(modules)
}

export { modules, destroyAllCommand }
export default modules
