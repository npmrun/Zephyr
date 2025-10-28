import { monaco } from "./monaco"
import { PlaceholderContentWidget } from "./PlaceholderContentWidget"
import { judgeFile } from "./utils"
import type { Ref } from "vue"

function useResizeObserver(el: HTMLDivElement, callback: ResizeObserverCallback) {
  const isSupported = window && "ResizeObserver" in window
  let observer: ResizeObserver | undefined
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }
  }
  const stopWatch = watch(
    () => el,
    el => {
      cleanup()
      if (isSupported && window && el) {
        observer = new ResizeObserver(callback)
        observer!.observe(el, {})
      }
    },
    { immediate: true },
  )
  const stop = () => {
    cleanup()
    stopWatch()
  }
  function tryOnScopeDispose(fn: () => void) {
    if (getCurrentScope()) {
      onScopeDispose(fn)
      return true
    }
    return false
  }
  tryOnScopeDispose(() => {
    stop()
  })
}

export interface IOptions {
  placeholder: (() => Node) | string | undefined
  filename: string
  extendsExt?: {language: string, ext?: string, pre?: string}[]
  content: string
  editorOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions
  modelOptions: monaco.editor.ITextModelUpdateOptions
  onCursorChange?: (e: monaco.editor.ICursorPositionChangedEvent) => void
  onDidChangeContent?: (str: string) => void
}

const defaultOptions: IOptions = {
  placeholder: undefined,
  filename: "temp",
  extendsExt: [],
  content: "",
  editorOptions: {
    fontSize: 14,
    readOnly: false,
    theme: "vs-light",
    fontFamily: "Cascadia Mono, Consolas, 'Courier New', monospace",
    scrollBeyondLastLine: false,
    lineHeight: 22,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  },
  modelOptions: {},
}

const assign = (curOpt, opt, parenyKey: string[] = [], config = { arrayExtend: "concat" }) => {
  for (const key in opt) {
    if (opt[key] !== undefined) {
      if (typeof opt[key] === "function" && curOpt[key] !== undefined && typeof curOpt[key] !== "function") {
        opt[key] = opt[key](curOpt[key])
      }
      if (typeof opt[key] === "object" && !Array.isArray(opt[key]) && !Array.isArray(curOpt[key])) {
        parenyKey.push(key)
        assign(curOpt[key], opt[key], parenyKey, config)
      } else if (typeof opt[key] === "object" && Array.isArray(opt[key]) && Array.isArray(curOpt[key])) {
        if (config.arrayExtend === "concat") {
          curOpt[key] = curOpt[key].concat(opt[key])
        } else {
          curOpt[key] = opt[key]
        }
      } else if (curOpt[key] !== undefined && typeof curOpt[key] !== typeof opt[key]) {
        throw new Error(`Type of ${parenyKey.join(",") + "." + key} is not match`)
      } else {
        curOpt[key] = opt[key]
      }
    }
  }
  return curOpt
}

function getOptions(opt = {}, config = { arrayExtend: "concat" }): IOptions {
  const curOptions = structuredClone(defaultOptions)
  assign(curOptions, opt, [], config)
  return curOptions
}

export function useMonacoEditor(editorElement: Ref<HTMLDivElement | undefined>, opts: Partial<IOptions>) {
  let curOption = getOptions(opts) as IOptions
  let editor: monaco.editor.IStandaloneCodeEditor | null = null
  let placeholderWidget: PlaceholderContentWidget | null = null

  const updateOption = (opts: Partial<IOptions>) => {
    if (!editor) return
    curOption = assign(curOption, opts)
    if (Object.hasOwn(opts, "placeholder")) {
      if (placeholderWidget) {
        placeholderWidget.dispose()
        placeholderWidget = null
      }
      if (opts.placeholder) {
        placeholderWidget = new PlaceholderContentWidget(opts.placeholder, editor)
      }
    }
    if (Object.hasOwn(opts, "modelOptions") && opts.modelOptions) {
      const model = editor.getModel()
      model?.updateOptions(opts.modelOptions)
    }
    if (Object.hasOwn(opts, "editorOptions") && opts.editorOptions) {
      editor.updateOptions(opts.editorOptions)
    }
    if (Object.hasOwn(opts, "filename")) {
      updateModel(curOption.filename, curOption.content)
    }
    if (Object.hasOwn(opts, "content")) {
      console.log("无法通过updateOption修改content")
    }
  }

  let isInnerChange = "waitting" // waitting, out, in
  const setValue = (content: string) => {
    if (isInnerChange === "waitting") {
      isInnerChange = "out"
    }
    if (editor && isInnerChange === "out") {
      editor.setValue(content)
    } else {
      isInnerChange = "waitting"
    }
  }
  function updateModel(name: string, content: string) {
    if (editor) {
      const oldModel = editor.getModel() //获取旧模型
      const file = judgeFile(name, curOption.extendsExt || [])
      // 这样定义的话model无法清除
      // monaco.editor.createModel("const a = 111","typescript", monaco.Uri.parse('file://root/file3.ts'))
      const model: monaco.editor.ITextModel = monaco.editor.createModel(content ?? "", file?.language ?? "txt")
      model.updateOptions(curOption.modelOptions)
      model.onDidChangeContent(() => {
        if (model) {
          if (isInnerChange === "out") {
            isInnerChange = "waitting"
            return
          }
          isInnerChange = "in"
          const code = model.getValue()
          curOption.onDidChangeContent?.(code)
        }
      })
      if (oldModel) {
        oldModel.dispose()
      }
      editor.setModel(model)
    }
  }

  tryOnMounted(() => {
    if (editorElement.value && !editor) {
      editor = monaco.editor.create(editorElement.value, curOption.editorOptions) as monaco.editor.IStandaloneCodeEditor
      editor.onDidChangeCursorPosition(e => {
        curOption.onCursorChange?.(e)
      })
      if (!curOption.content) {
        placeholderWidget = new PlaceholderContentWidget(curOption.placeholder || "", editor)
      } else {
        if (isInnerChange === "waitting") {
          isInnerChange = "out"
        }
      }
      updateModel(curOption.filename, curOption.content)
      useResizeObserver(editorElement.value, () => {
        editor!.layout()
      })
    }
  })

  tryOnUnmounted(() => {
    if (editor) {
      const oldModel = editor.getModel()
      if (oldModel) {
        oldModel.dispose()
      }
      editor.dispose()
      editor = null
    }
  })

  return {
    setValue,
    scrollTop() {
      editor?.setScrollTop(0)
    },
    updateOption,
  }
}
