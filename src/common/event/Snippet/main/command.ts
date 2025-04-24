import path from "path/posix"
import Setting from "setting/main"

// 代码片段命令处理器
// base/__snippet__.json 基础信息
// 路径做为ID, 当前文件夹的信息

export default class SnippetCommand {
  storagePath: string = Setting.values("snippet.storagePath")

  getTree() {
    path.resolve(this.storagePath, "__snippet__.json")
    return this.storagePath
  }
}
