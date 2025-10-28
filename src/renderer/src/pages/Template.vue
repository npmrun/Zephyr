<script lang="ts" setup>
import { moduleArray } from "./Template/all"
let store = usePageStore()
const cacheList = computed(() => store.cache)

</script>

<template>
    <div class="flex h-full dev-filetree">
        <div class="w-200px px-5 py-5 flex flex-col gap-1 bg-white relative" style="border-right: 1px solid #e5e8ea">
            <router-link to="/Template">
                首页
            </router-link>
            <router-link class="truncate" :title="item.title" :to="item.url" v-for="item in moduleArray"
                :key="item.title">
                {{ item.title }}
            </router-link>
            <AdjustLine></AdjustLine>
        </div>
        <div class="flex-1 w-0 relative">
            <router-view v-slot="{ Component, route }">
                <!-- 缓存界面 -->
                <keep-alive :include="cacheList">
                    <component :key="route.meta.parentPath ? route.meta.parentPath : route.fullPath" :is="Component" />
                </keep-alive>
                <div class="flex items-center justify-center h-full text-2xl" v-if="!Component">请选中侧边栏查看详情</div>
            </router-view>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dev-filetree {
    :deep(.router-link-exact-active) {
        color: red;
    }
}
</style>