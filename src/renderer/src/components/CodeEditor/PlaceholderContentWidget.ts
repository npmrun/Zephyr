import { monaco } from "./monaco"

/**
 * Represents a placeholder renderer for monaco editor
 * Roughly based on https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/codeEditor/browser/untitledTextEditorHint/untitledTextEditorHint.ts
 */
export class PlaceholderContentWidget implements monaco.editor.IContentWidget {
  private static readonly ID = "editor.widget.placeholderHint"

  private domNode: HTMLElement | undefined

  constructor(
    private readonly placeholder: string,
    private readonly editor: monaco.editor.ICodeEditor,
  ) {
    // register a listener for editor code changes
    editor.onDidChangeModelContent(() => this.onDidChangeModelContent())
    // ensure that on initial load the placeholder is shown
    this.onDidChangeModelContent()
  }

  private onDidChangeModelContent(): void {
    if (this.editor.getValue() === "") {
      this.editor.addContentWidget(this)
    } else {
      this.editor.removeContentWidget(this)
    }
  }

  getId(): string {
    return PlaceholderContentWidget.ID
  }

  getDomNode(): HTMLElement {
    if (!this.domNode) {
      this.domNode = document.createElement("div")
      this.domNode.style.width = "max-content"
      this.domNode.style.pointerEvents = "none" // 整个容器禁用指针事件
      this.domNode.style.fontStyle = "italic"
      this.domNode.style.opacity = "0.6" // 添加透明度，更像 placeholder

      // 创建文本节点
      const textNode = document.createTextNode(this.placeholder + " ")
      this.domNode.appendChild(textNode)

      // 创建链接
      const link = document.createElement("a")
      link.href = "https://baidu.com"
      link.textContent = "AA"
      link.style.pointerEvents = "auto" // 只对链接启用指针事件
      link.style.color = "#0066cc" // 设置链接颜色
      link.style.textDecoration = "underline"
      link.style.cursor = "pointer"
      link.target = "_blank" // 在新标签页打开
      link.rel = "noopener noreferrer" // 安全属性

      // 阻止点击链接时编辑器获得焦点
      link.addEventListener("mousedown", e => {
        e.preventDefault()
        e.stopPropagation()
      })

      link.addEventListener("click", e => {
        e.preventDefault()
        e.stopPropagation()
        // window.open(link.href, "_blank", "noopener,noreferrer")
      })

      this.domNode.appendChild(link)
      this.editor.applyFontInfo(this.domNode)
    }

    return this.domNode
  }

  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
    }
  }

  dispose(): void {
    this.editor.removeContentWidget(this)
  }
}
