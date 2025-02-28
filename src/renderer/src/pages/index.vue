<script setup lang="ts">
definePage({
    meta: {
        home: true,
    },
})
</script>

<template>
    <div @click="$router.push('/about')">
        <div v-for="i in 1000">{{ i }}</div>
    </div>
</template>
