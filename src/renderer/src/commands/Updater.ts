import { BaseEvent } from "base/api/abstract"

class Updater extends BaseEvent {
  constructor() {
    super()
  }

  test() {
    this.api
  }
}

export { Updater }
