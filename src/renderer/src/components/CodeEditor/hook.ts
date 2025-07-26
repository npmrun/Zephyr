import { monaco } from "./monaco"

const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  readOnly: false,
  theme: "vs-light",
  fontFamily: "Cascadia Mono, Consolas, 'Courier New', monospace",
  lineHeight: 22,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
}

function getOptions(opt = {}) {
  return {
    ...defaultOptions,
    ...opt,
  }
}

export function useMonacoEditor(editor: HTMLDivElement) {
  let editor: monaco.editor.IStandaloneCodeEditor | null = null
  let placeholderWidget: PlaceholderContentWidget | null = null


  return {
    scrollTop() {
        
    }
  }
}
