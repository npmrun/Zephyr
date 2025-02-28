<script setup lang="ts">
import Simplebar from "simplebar-vue"
import { getAssetsFile } from "@/utils"

const allModules: Record<string, any> = import.meta.glob("./_ui/**/*.vue", { eager: true })
let allApp: any[] = []
Object.keys(allModules).forEach(key => {
    // let [, p] = key.match("./_ui/(.*?).vue")!
    // p = p.replace(/\.vue$/, "")
    const m = allModules[key]?.default || allModules[key]
    allApp.push({
        label: m.title,
        bg: m.bg,
        _sort: m.index ?? 0,
        comp: m,
    })
})
allApp = allApp.sort((a, b) => (a.index - b.index <= 0 ? 1 : -1))

const active = ref(0)
// const allApp = [
//     { label: "浏览器", comp: defineAsyncComponent(() => import("./_ui/Browser.vue")) },
//     { label: "观山", bg: "gs", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "听雨", bg: "ty", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "赏月", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "抚琴", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "望云", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "踏雪", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "卧松", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "泛舟", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "弈星", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "垂钓", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "采菊", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "倚栏", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "望霞", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "枕风", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "沐泉", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "汲露", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "步竹", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "剪烛", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "拾阶", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "撷兰", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "访柳", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "谒梅", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "拨荷", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
//     { label: "望鹤", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
// ]

const activeBg = computed(() => {
    if (active.value === undefined) return ""
    const value = allApp[active.value]?.bg
    return value ? getAssetsFile(`@/assets/images/home/${value}.png`) : ""
})

function onClick(index: number) {
    active.value = index
}
</script>

<template>
    <div h-full flex>
        <div w="100px" h-full relative max-w="200px" min-w="80px">
            <Simplebar h-full>
                <div
                    v-for="(app, index) in allApp"
                    :key="index"
                    p="8px 10px"
                    text="12px"
                    border
                    border-b
                    h="30px"
                    cursor="pointer"
                    hover:bg-gray-50
                    class="item"
                    transition-all
                    :class="{ active: active === index }"
                    @click="onClick(index)"
                >
                    <div class="text" transition-all position="absolute" left="10px">{{ app.label }}</div>
                </div>
            </Simplebar>
            <!-- <AdjustLine></AdjustLine> -->
        </div>
        <div class="content" relative b-l="1px solid #E5E5E5" flex-1 w-0 overflow-auto flex flex-col>
            <div v-if="activeBg" class="bg" :style="{ backgroundImage: activeBg ? `url(${activeBg})` : '' }"></div>
            <div @click="$router.push('/about')">关于</div>
            <component :is="allApp[active].comp" v-if="allApp[active]"></component>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.content {
    .bg {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: -1;
        opacity: 0.1;
        // blur(4px)
        filter: brightness(1);
    }
}
.item {
    position: relative;
    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 6px;
        background-color: #f3f4f6;
        transition: all linear 300ms;
    }
    &:hover {
        &::before {
            width: 30px;
        }
        .text {
            left: 20px;
        }
    }
    &.active {
        @apply: text-black;
        &::before {
            width: 100%;
        }
        .text {
            left: 50%;
            transform: translateX(-50%);
        }
    }
    .text {
        transition-duration: 300ms;
    }
}
</style>
