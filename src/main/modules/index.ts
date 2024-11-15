import { Container } from "inversify"
import module from "./module"

const container = new Container()

container.load(module)

export default container
export { container }
