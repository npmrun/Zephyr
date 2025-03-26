import { JSONFile } from "lowdb/node"
import { Low } from "lowdb"
import fs from "fs-extra"

export class CustomAdapter<T> extends JSONFile<T> {
  constructor(filepath: string) {
    super(filepath)
    this.filepath = filepath
  }
  filepath: string = ""
  async read() {
    if (!fs.existsSync(this.filepath)) {
      return null
    }
    const data = fs.readJSONSync(this.filepath, { throws: false })
    if (!data) {
      return null
    }
    return data
  }

  async write(data: T) {
    fs.ensureFileSync(this.filepath)
    await super.write(data)
  }
}
export class CustomLow<T> extends Low<T> {
  constructor(adapter: CustomAdapter<T>, defaultData: T) {
    super(adapter, defaultData)
    this.filepath = adapter.filepath
  }
  filepath: string = ""
}
