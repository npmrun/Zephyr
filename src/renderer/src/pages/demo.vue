<script setup lang="ts">
  definePage({
    meta: {
      home: true,
    },
  })

  const state = reactive({
    content: "",
    name: "aaa.ts",
  })
</script>

<template>
  <div class="locale-changer">
    <select v-model="$i18n.locale">
      <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>
    </select>
  </div>
  <div @click="$router.push('/about')">
    <span>跳转 about</span>
  </div>
  <div @click="$router.push('/browser')">
    <span>跳转 browser</span>
  </div>
  <input v-model="state.content" />
  <CodeEditor v-model="state.content" style="height: 400px" :name="state.name" placeholder="输入代码"></CodeEditor>
  <div v-for="i in 1000" :key="i">
    <span>{{ i }}</span>
  </div>
</template>
