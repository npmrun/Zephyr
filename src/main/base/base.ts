import EventEmitter from "node:events"

abstract class BaseClass {
    public _events = new EventEmitter()
    abstract init(...argus: any[])
    abstract destroy()
}

export { BaseClass }
export default BaseClass
