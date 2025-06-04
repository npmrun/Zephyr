import { BaseSingleton } from "base"
import { ApiFactory } from "common/lib/abstract"

class Snippet extends BaseSingleton {
  constructor() {
    super()
  }

  private get api() {
    return ApiFactory.getApiClient()
  }

  getTree = async () => {
    return this.api.call("SnippetCommand.getTree")
  }
}

export { Snippet }
