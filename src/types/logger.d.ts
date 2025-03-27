declare const logger: import("logger/preload").IRendererLogger

interface Window {
  logger: import("logger/preload").IRendererLogger
}
