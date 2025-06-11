declare const errorHandler: import("logger/preload-error").IRendererErrorHandler

interface Window {
  errorHandler: import("logger/preload-error").IRendererErrorHandler
}
