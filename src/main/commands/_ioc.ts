import { Container, ContainerModule } from "inversify"
import BasicCommand from "./BasicCommand"
import TabsCommand from "./TabsCommand"

const modules = new ContainerModule(bind => {
    bind(BasicCommand.name).to(BasicCommand).inSingletonScope()
    bind(TabsCommand.name).to(TabsCommand).inSingletonScope()
})

async function destroyAllCommand(ioc: Container) {
    await ioc.unloadAsync(modules)
}

export { modules, destroyAllCommand }
export default modules
