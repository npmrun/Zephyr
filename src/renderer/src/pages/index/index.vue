<script setup lang="ts">
  // import { useUpdaterStore } from "common/event/Updater/hook"

  // const UpdaterStore = useUpdaterStore()

  const code = ref("")
  const aa = ref(true)
</script>

<template>
  <div gap="20px" h-full>
    <input type="text" v-model="code" placeholder="请输入文本" class="input" />
    <input type="checkbox" v-model="aa" />
    {{ aa }}
    <div h-300px>
      <code-editor-plus :editorOptions="{ readOnly: aa }" filename="test.js" v-model="code" placeholder="请输入文本"></code-editor-plus>
    </div>
    <div p="20px" flex flex-wrap items-start gap="20px" justify-start rounded>
      <Card v-for="i in 20" :key="i"></Card>
      <button class="button">Button</button>
      <!-- <button @click="UpdaterStore.checkForUpdates()">更新</button> -->
      <button @click="$router.push('/browser')">浏览器</button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
