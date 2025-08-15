import { monaco } from "./monaco"

/**
 * Represents an placeholder renderer for monaco editor
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
      this.domNode.style.pointerEvents = "none"
      this.domNode.textContent = this.placeholder
      this.domNode.style.fontStyle = "italic"
      const a = document.createElement("a")
      a.href = "https://baiud.com"
      a.textContent = "百度"
      this.domNode.appendChild(a)
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
