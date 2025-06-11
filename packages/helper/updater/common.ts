export type EventMaps = {
  "update-progress": (data: { percent: number; all: number; now: number }) => void
}
