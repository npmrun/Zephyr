import { interfaces } from "inversify"
import BaseClass from "./base/base"
import { destroyAll, _ioc } from "./_ioc"

class IOC extends BaseClass {
    init() {
        // TODO
    }

    destroy() {
        destroyAll()
    }

    get<T = unknown>(serviceIdentifier: interfaces.ServiceIdentifier<T>) {
        return _ioc.get<T>(serviceIdentifier)
    }

    getAsync<T = unknown>(serviceIdentifier: interfaces.ServiceIdentifier<T>) {
        return _ioc.getAsync<T>(serviceIdentifier)
    }
}

export { IOC }
export default IOC
