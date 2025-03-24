<template>
    <div
        relative
        h="30px"
        leading="29px"
        pr="137px"
        :style="{ paddingRight: isFullScreen ? '0' : '' }"
        select-none
        border-b="1px solid #E5E5E5"
        bg="#F8F8F8"
    >
        <div absolute top-0 right-0 bottom-0 left-0 style="-webkit-app-region: drag"></div>
        <div h-full px-2 flex items-center gap-1 justify-between>
            <div flex items-center gap-1>
                <img w="16px" h="16px" :src="icon" />
                <div relative h-full inline-flex items-center text-sm>{{ config.app_title }}</div>
                <div relative class="list">
                    <div class="item" @click="onClickMenu">{{ t("caidan") }}</div>
                </div>
            </div>
            <div float-right h-full flex items-center relative style="-webkit-app-region: no-drag">
                <div
                    v-if="!isHome"
                    text-sm
                    px-2
                    hover:rounded-md
                    hover:bg-gray-2
                    hover:cursor-pointer
                    text="hover:hover"
                    title="返回上一页"
                    @click="back"
                >
                    🏠
                </div>
                <div text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover" @click="onClickAbout">关于</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import icon from "@res/icon.png"
import config from "config"
import { PopupMenu } from "@/bridge/PopupMenu"
import { usePlatForm } from "common/usePlatform"

const { PlatForm } = usePlatForm()

const router = useRouter()
const route = useRoute()
const isFullScreen = ref(false)

onBeforeMount(async () => {
    isFullScreen.value = await PlatForm.isFullScreen()
})

const isHome = computed(() => {
    if (route.fullPath === "/") {
        return true
    }
    return false
})

function back() {
    router.push("/")
}
const { t } = useI18n()
const onClickMenu = e => {
    const menu = new PopupMenu([
        {
            label: isFullScreen.value ? t("qu-xiao-quan-ping") : t("quan-ping"),
            async click() {
                await PlatForm.toggleFullScreen()
                isFullScreen.value = !isFullScreen.value
            },
        },
        {
            label: t("qie-huan-kai-fa-zhe-gong-ju"),
            async click() {
                PlatForm.toggleDevTools()
            },
        },
    ])
    const obj = e.target.getBoundingClientRect()
    menu.show({ x: ~~obj.x, y: ~~(obj.y + obj.height) })
}

const onClickAbout = () => {
    PlatForm.showAbout()
}
</script>

<style lang="scss" scoped>
.list {
    @apply: flex gap="5px";
    -webkit-app-region: no-drag;

    .item {
        @apply: text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover";
    }
}
</style>
