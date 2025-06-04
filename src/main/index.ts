import "reflect-metadata"
import "./debug"
import "setting/main"
import "logger/main"
import "logger/main-error"

import { _ioc } from "main/_ioc"
import { App } from "main/App"

const curApp = _ioc.get(App)
curApp.init()
