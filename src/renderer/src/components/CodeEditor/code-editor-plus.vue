<script lang="ts" setup>
  import { useMonacoEditor, IOptions } from "./hook"

  const props = withDefaults(
    defineProps<{
      readonly?: boolean
      modelValue?: string
      filename?: string
      placeholder?: string
      modelOptions?: IOptions["modelOptions"]
      editorOptions?: IOptions["editorOptions"]
    }>(),
    {
      readonly: false,
      modelValue: "",
      filename: "",
    },
  )

  const emit = defineEmits<{
    (e: "update:modelValue", code: string): void
    (e: "change", code: string): void
    (e: "cursor:position", position: [number, number]): void
  }>()

  const editorRef = ref<HTMLDivElement>()
  const { updateOption, setValue } = useMonacoEditor(editorRef, {
    placeholder: "请输入一些文本测试",
    content: props.modelValue,
    filename: props.filename,
    modelOptions: props.modelOptions,
    editorOptions: props.editorOptions,
    onCursorChange(e) {
      emit("cursor:position", [e.position.lineNumber, e.position.column])
    },
    onDidChangeContent(code) {
      emit("update:modelValue", code)
      emit("change", code)
    },
  })
  watch(
    () => props.modelValue,
    () => {
      setValue(props.modelValue)
    },
  )
  watch(
    () => props.filename,
    () => {
      updateOption({
        filename: props.filename,
      })
    },
  )
  watch(
    () => props.editorOptions,
    () => {
      updateOption({
        editorOptions: props.editorOptions,
      })
    },
    { deep: true },
  )
  watch(
    () => props.modelOptions,
    () => {
      updateOption({
        modelOptions: props.modelOptions,
      })
    },
    { deep: true },
  )
</script>

<template>
  <div class="monaco-wrapper">
    <div ref="editorRef" class="monaco-editor"></div>
  </div>
</template>

<style lang="scss" scoped>
  .monaco-wrapper {
    height: 100%;
    position: relative;

    .monaco-editor {
      height: 100%;
    }

    .monaco-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      opacity: 0.1;
      overflow: hidden;

      .monaco-logo {
        @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
      }
    }
  }
</style>
