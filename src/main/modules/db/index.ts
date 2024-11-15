import { inject, injectable } from "inversify"
import Setting from "../setting"
import { CustomAdapter, CustomLow } from "./custom"
import path from "node:path"

@injectable()
class DB {
    private _setting: Setting
    Modules: Record<string, CustomLow<any>> = {}

    constructor(@inject(Setting) setting: Setting) {
        console.log(`DB inited`)

        this._setting = setting
    }

    create(filepath) {
        const adapter = new CustomAdapter<any>(filepath)
        const db = new CustomLow<object>(adapter, {})
        db.filepath = filepath
        return db
    }

    getDB(dbName: string) {
        if (this.Modules[dbName] === undefined) {
            const filepath = path.resolve(this._setting.values("storagePath"), "./db/" + dbName + ".json")
            this.Modules[dbName] = this.create(filepath)
            return this.Modules[dbName]
        } else {
            const cur = this.Modules[dbName]
            const filepath = path.resolve(this._setting.values("storagePath"), "./db/" + dbName + ".json")
            if (cur.filepath != filepath) {
                this.Modules[dbName] = this.create(filepath)
            }
            return this.Modules[dbName]
        }
    }

    async saveData(data: any): Promise<any>
    async saveData(dbName: string, data: any): Promise<any>
    async saveData(dbName: string, data?: any): Promise<any> {
        let db, rData
        if (arguments.length === 2) {
            db = this.getDB(dbName)
            rData = data
        } else {
            db = this.getDB("db")
            rData = dbName
        }
        if (db) {
            db.data = rData
            await db.write()
            return db.data
        }
        return null
    }

    async getData(dbName?: string) {
        let db
        if (dbName) {
            db = this.getDB(dbName)
        } else {
            db = this.getDB("db")
        }
        if (db) {
            await db.read()
            return db.data
        }
        return null
    }
}

export default DB
export { DB }
