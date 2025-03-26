import IOC from "./_iocClass"
import { Container } from "inversify"
import iocModules, { destroyAllModules } from "./modules/_ioc"
import iocController, { destroyAllController } from "./controller/_ioc"
import iocCommand, { destroyAllCommand } from "common/_ioc.main"
import App from "./App"

async function destroyAll() {
    await destroyAllModules(_ioc)
    await destroyAllController(_ioc)
    await destroyAllCommand(_ioc)
}

const _ioc = new Container()
_ioc.load(iocModules)
_ioc.load(iocCommand)
_ioc.load(iocController)
_ioc.bind(IOC).toSelf().inSingletonScope()
_ioc.bind(App).toSelf().inSingletonScope()

export { IOC, destroyAll, _ioc }
export default IOC
