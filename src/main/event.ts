import EventEmitter from "events"

const globalEvent = new EventEmitter()

export default globalEvent
export { globalEvent as eventbus }
