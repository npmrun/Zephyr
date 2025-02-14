import "reflect-metadata"
import { _ioc } from "main/_ioc"
import { App } from "main/App"

const curApp = _ioc.get(App)
curApp.init()
