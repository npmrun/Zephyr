import { BaseEvent } from "common/lib/abstract"

class Updater extends BaseEvent {
  constructor() {
    super()
  }

  test() {
    this.api
  }
}

export { Updater }
