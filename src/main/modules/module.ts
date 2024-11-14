import { ContainerModule } from "inversify"
import { Setting } from "./setting"
import { DB } from "./db"
import App from "./App"

const module = new ContainerModule((bind) => {
    bind(Setting).toConstantValue(new Setting())
    bind(DB).toSelf().inSingletonScope()
    bind(App).toSelf().inSingletonScope()
})

export default module
export {
    module
}