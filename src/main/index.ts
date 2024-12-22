import "reflect-metadata"
import { _ioc } from "vc/_ioc"
import { App } from "vc/App"

const curApp = _ioc.get(App)
curApp.init()
