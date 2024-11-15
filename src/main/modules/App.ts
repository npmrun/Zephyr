import { injectable, inject } from "inversify"
import Setting from "./setting"
import DB from "./db"

@injectable()
class App {
    private _setting: Setting
    private _db: DB

    constructor(@inject(Setting) setting: Setting, @inject(DB) db: DB) {
        console.log(`App inited`)

        this._setting = setting
        this._db = db
    }

    async init() {
        console.log(this._setting.config())
        this._db.saveData("aaa", { a: 123123 })
        console.log(await this._db.getData("aaa"))
    }
}

export default App
export { App }
