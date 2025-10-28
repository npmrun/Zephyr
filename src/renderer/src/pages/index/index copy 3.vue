<script setup lang="ts">
  // import { useUpdaterStore } from "common/event/Updater/hook"

  // const UpdaterStore = useUpdaterStore()

  const code = ref("")
  const aa = ref(true)
  const placeholder = function(){
      const fragment = document.createDocumentFragment()
      // 创建文本节点
      const textNode = document.createTextNode("请输入文本" + " ")
      fragment.appendChild(textNode)

      // 创建链接
      const link = document.createElement("a")
      link.href = "https://baidu.com"
      link.textContent = "AA阿松大"
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

      fragment.appendChild(link)
      return fragment
  }
</script>

<template>
  <div gap="20px" h-full>
    <input type="text" v-model="code" placeholder="请输入文本" class="input" />
    <input type="checkbox" v-model="aa" />
    {{ aa }}📁
    <div h-300px>
      <me-code :editorOptions="{ readOnly: aa }" filename="test.ts" v-model="code" :placeholder="placeholder"></me-code>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
