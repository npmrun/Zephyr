import { Container, ContainerModule } from "inversify"
import UpdateCommand from "common/event/Update/main/command"
import PlatFormCommand from "common/event/PlatForm/main/command"
import SnippetCommand from "common/event/Snippet/main/command"
import TabsCommand from "common/event/Tabs/main/command"

const modules = new ContainerModule(bind => {
  bind("TabsCommand").to(TabsCommand).inSingletonScope()
  bind("PlatFormCommand").to(PlatFormCommand).inSingletonScope()
  bind("SnippetCommand").to(SnippetCommand).inSingletonScope()
  bind("UpdateCommand").to(UpdateCommand).inSingletonScope()
})

async function destroyAllCommand(ioc: Container) {
  await ioc.unloadAsync(modules)
}

export { modules, destroyAllCommand }
export default modules
