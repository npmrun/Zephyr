import { Container, ContainerModule } from "inversify"
import BasicService from "./BasicService"
import TabsService from "./TabsService"

const modules = new ContainerModule(bind => {
    bind(BasicService.name).to(BasicService).inSingletonScope()
    bind(TabsService.name).to(TabsService).inSingletonScope()
})

async function destroyAllController(ioc: Container) {
    await ioc.unloadAsync(modules)
}

export { modules, destroyAllController }
export default modules
