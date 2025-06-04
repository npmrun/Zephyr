export const enum EventEnum {
  UPDATE_PROGRESS = "update-progress",
}

export type EventMaps = {
  [EventEnum.UPDATE_PROGRESS]: () => void
}
