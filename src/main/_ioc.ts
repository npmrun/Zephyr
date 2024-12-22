import IOC from "./_iocClass"
import { Container } from "inversify"
import iocModules, { destroyAllModules } from "./modules/_ioc"
import iocController, { destroyAllController } from "./controller/_ioc"
import iocCommand, { destroyAllCommand } from "./commands/_ioc"
import App from "./App"

async function destroyAll() {
    await destroyAllModules(_ioc)
    await destroyAllController(_ioc)
    await destroyAllCommand(_ioc)
}

const _modulesIOC = new Container()
_modulesIOC.load(iocModules)

const _commandIOC = _modulesIOC.createChild()
_commandIOC.load(iocCommand)

const _controllerIOC = _commandIOC.createChild()
_controllerIOC.load(iocController)

const _ioc = _controllerIOC.createChild()
_ioc.bind(IOC).toSelf().inSingletonScope()
_ioc.bind(App).toSelf().inSingletonScope()

export { IOC, destroyAll, _ioc }
export default IOC
