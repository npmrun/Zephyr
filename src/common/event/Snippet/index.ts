import { _Base } from "common/lib/_Base"
import { ApiFactory } from "common/lib/abstract"

class Snippet extends _Base {
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
