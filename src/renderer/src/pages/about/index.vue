<script setup lang="ts">
definePage({
    name: "about",
    meta: {
        title: "听雨",
        bg: "gs",
    },
})

// const activeTab = ref(0)
// const TopMenu = computed<any[]>(() => {
//     return [
//         { key: 0, title: "sada", url: "/setting" },
//         { key: 1, title: "sdas", url: "/setting/editor" },
//         { key: 2, title: "asdas", url: "/setting/update" },
//     ]
// })
// const route = useRoute()
// watch(
//     () => route,
//     route => {
//         for (let i = 0; i < TopMenu.value.length; i++) {
//             const element = TopMenu.value[i]
//             if (route.path.startsWith(element.url)) {
//                 activeTab.value = element.key
//             }
//         }
//     },
//     { immediate: true },
// )
</script>
<template>
    <div>
        <!-- <HTab v-model="activeTab" :list="TopMenu"></HTab> -->
    </div>
</template>
