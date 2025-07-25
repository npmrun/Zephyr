// import fs from "fs-extra"
// import path from "path/posix"
// import Setting from "setting/main"

// 代码片段命令处理器
// base/__snippet__.json 基础信息
// 路径做为ID, 当前文件夹的信息

export default class SnippetCommand {
  // storagePath: string = Setting.values("snippet.storagePath")

  constructor() {
    const handler = {
      get: function (target, prop, receiver) {
        if (!target["check"]()) {
          throw new Error(`代码片段路径存在问题`)
        }
        const value = target[prop]
        if (typeof value === "function") {
          return (...args) => Reflect.apply(value, receiver, args)
        }
        return value
      },
    }
    return new Proxy(this, handler)
  }

  async check() {
    // const stat = await fs.statSync(this.storagePath)
    // const inforFile = path.resolve(this.storagePath, "__snippet__.json")
    // if (stat.isDirectory() && stat.size == 0) {
    //   await fs.writeJSON(inforFile, {})
    //   // 空文件夹, 初始化信息
    //   return true
    // } else {
    //   const isExist = await fs.pathExists(inforFile)
    //   return isExist
    // }
  }

  getTree() {
    // return this.storagePath
  }
}
