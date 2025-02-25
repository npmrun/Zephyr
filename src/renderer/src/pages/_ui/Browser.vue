<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, ref, useTemplateRef, nextTick } from "vue"
import { PopupMenu } from "@/bridge/PopupMenu"

// const PlaceHolderRef = useTemplateRef("PlaceHolder")
// function OnResize() {
//     const el = PlaceHolderRef.value
//     if (el) {
//         const rect = el.getBoundingClientRect().toJSON()
//         console.log(rect)
//         api.call("TabsCommand.bindElement", rect)
//     }
// }
// onMounted(OnResize)
// window.addEventListener("resize", OnResize)
// onBeforeUnmount(() => {
//     window.removeEventListener("resize", OnResize)
// })

const PlaceHolder = useTemplateRef("PlaceHolder")
const { stop } = useResizeObserver(PlaceHolder, () => {
    const el = PlaceHolder.value
    if (el) {
        const rect = el.getBoundingClientRect().toJSON()
        api.call("TabsCommand.bindElement", rect)
    }
})

onBeforeUnmount(() => {
    stop()
    api.call("TabsCommand.closeAll")
})

const list = ref<any[]>([])
const curUrl = ref<any>("")
const curIndex = ref<any>(-1)
const listener = (_, v) => {
    list.value = v
    const el = v.find(v => v.isActive)
    curIndex.value = v.findIndex(v => v.isActive)
    if (el) {
        curUrl.value = el.showUrl
    } else {
        curUrl.value = ""
    }
}
if (import.meta.hot) {
    api.off("main:TabsCommand.update", listener)
}
api.on("main:TabsCommand.update", listener)
onMounted(() => {
    api.call("TabsCommand.sync")
})

onBeforeMount(async () => {
    list.value = await fetch("api://fuck/TabsService/getAllTabs").then(async res => await res.json())
})

// const url = ref("")

// async function addTab() {
//     if (!url.value) url.value = "about:blank"
//     await fetch("api://fuck/TabsService/add", {
//         method: "POST",
//         body: JSON.stringify({ url: url.value }),
//     })
//     url.value = ""
//     onClick()
// }

function handleTabContextMenu(_, index) {
    const menu = new PopupMenu([
        {
            label: "右侧关闭",
            click() {
                const all: number[] = []
                list.value.forEach((_, i) => {
                    if (i <= index) return
                    all.push(i)
                })
                fetch("api://fuck/TabsService/closeTabAll", {
                    method: "POST",
                    body: JSON.stringify({ active: all }),
                })
            },
        },
        {
            type: "separator",
        },
    ])
    menu.show()
}

function scrollTabIntoView(index: number) {
    nextTick(() => {
        const tabList = document.querySelector(".tab-list")
        const tabItems = tabList?.querySelectorAll(".tab-item")
        if (tabList && tabItems && tabItems[index]) {
            tabItems[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
        }
    })
}

async function changeTab(_, index) {
    await api.call("TabsCommand.setActive", index)
    scrollTabIntoView(index)
}

function addTabInput() {
    if (curUrl.value) {
        if (curIndex.value !== undefined && curIndex.value >= 0) {
            api.call("TabsCommand.nagivate", curIndex.value, curUrl.value)
        } else {
            api.call("TabsCommand.add", curUrl.value)
        }
    }
}

async function addTab() {
    await api.call("TabsCommand.add", "about:blank")
    scrollTabIntoView(list.value.length - 1)
}

async function closeTab(_, index) {
    await fetch("api://fuck/TabsService/closeTab", {
        method: "POST",
        body: JSON.stringify({ active: index }),
    })
    onClick()
}

const onClick = async () => {
    list.value = await api.call("TabsCommand.getAllTabs")
    // list.value = await fetch("api://fuck/TabsService/getAllTabs").then(async res => await res.json())
    // fetch("api://fuck/BasicService/showAbout").then(async res => console.log(await res.json()))
    // fetch("api://index/openAbout", {
    //     method: "POST",
    //     body: JSON.stringify({ a: "234" }),
    // }).then(async res => console.log(await res.json()))
}

function onClickDevTool() {
    fetch("api://fuck/BasicService/openTabDevtool")
}
</script>

<template>
    <div h="100px" flex flex-col b-b="1px solid var(--border-color)" class="tab-container">
        <!-- Tab列表 -->
        <div class="tab-list-container">
            <div class="tab-list">
                <div
                    v-for="(item, index) in list"
                    :key="index"
                    :class="{
                        'tab-item': true,
                        active: item.isActive,
                    }"
                    @contextmenu="handleTabContextMenu(item, index)"
                    @click="changeTab(item, index)"
                >
                    <div class="tab-content">
                        <!-- 网站图标 -->
                        <img v-if="item.favicons?.length" :src="item.favicons[0]" class="tab-icon" alt="" />
                        <div v-else class="tab-icon-placeholder"></div>

                        <!-- 标题 -->
                        <div class="tab-title">{{ item.title || "加载中..." }}</div>

                        <!-- 关闭按钮 -->
                        <div class="tab-close" @click.stop="closeTab(item, index)">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path
                                    d="M12.81 4.36l-1.17-1.17L8 6.83 4.36 3.19 3.19 4.36 6.83 8l-3.64 3.64 1.17 1.17L8 9.17l3.64 3.64 1.17-1.17L9.17 8z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 新建标签页按钮移到容器外部 -->
            <div class="new-tab-button-container">
                <div class="new-tab-button" @click.stop="addTab()">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- 地址栏 -->
        <div class="address-bar">
            <div class="url-input-container">
                <input v-model="curUrl" placeholder="输入网址" type="text" class="url-input" />
            </div>
            <button class="action-button" @click="addTabInput()">前往</button>
            <button class="action-button" @click="onClickDevTool()">DevTool</button>
        </div>
    </div>

    <!-- 内容区域 -->
    <div ref="PlaceHolder" ml="1px" flex-1 h-0 flex items-center justify-center>
        <!-- 保持原有内容 -->
    </div>
</template>

<style scoped>
.tab-container {
    background: var(--tab-bar-bg, #f3f3f3);
    border-bottom: none;
    padding-top: 4px;
    height: auto;
    min-height: 80px;
}

.tab-list-container {
    position: relative;
    display: flex;
    align-items: flex-end;
    height: 32px;
    padding: 0;
    margin-bottom: 0;
    width: 100%;
    overflow: auto;
}

.tab-list {
    height: 32px;
    display: flex;
    align-items: flex-end;
    gap: 0;
    margin-bottom: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 4px;
    /* 隐藏滚动条但保持功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    &::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
}

.tab-item {
    position: relative;
    min-width: 160px;
    max-width: 240px;
    height: 29px;
    margin-right: -6px;
    border-radius: 6px 6px 0 0;
    background: var(--tab-bg, #dee1e6);
    transition: all 0.15s ease;
    z-index: 1;
    display: flex;
    align-items: center;
    flex-shrink: 0; /* 防止标签被压缩 */
    cursor: pointer;
}

.tab-item::after {
    content: "";
    position: absolute;
    right: 0;
    top: 6px;
    height: 16px;
    width: 1px;
    background: var(--tab-separator-color, #bdc1c6);
    opacity: 0.3;
}

.tab-item:hover {
    background: var(--tab-hover-bg, #e9ebee);
}

.tab-item.active {
    background: var(--tab-active-bg, #fff);
    z-index: 2;
    height: 32px;
    margin-bottom: -1px;
}

.tab-item.active::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: var(--primary-color, #1a73e8);
    border-radius: 2px 2px 0 0;
}

.tab-content {
    display: flex;
    align-items: center;
    padding: 0 8px;
    height: 100%;
    gap: 6px;
    width: 100%;
}

.tab-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 3px;
}

.tab-icon-placeholder {
    width: 16px;
    height: 16px;
    background: #bdc1c6;
    border-radius: 50%;
    flex-shrink: 0;
    opacity: 0.7;
}

.tab-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    color: var(--text-color, #5f6368);
    line-height: 1.2;
    padding-right: 4px;
}

.tab-item.active .tab-title {
    color: var(--active-text-color, #202124);
}

.tab-close {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--icon-color, #5f6368);
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
}

.tab-item:hover .tab-close {
    opacity: 0.6;
}

.tab-close:hover {
    background: var(--close-hover-bg, rgba(0, 0, 0, 0.08));
    opacity: 1;
}

.new-tab-button-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 32px;
    background: var(--tab-bar-bg);
}

.new-tab-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--icon-color, #5f6368);
    transition: all 0.15s ease;
    cursor: pointer;
    opacity: 0.8;
    background: transparent;
}

.new-tab-button:hover {
    background: var(--tab-hover-bg, rgba(0, 0, 0, 0.06));
    opacity: 1;
}

.address-bar {
    padding: 8px 12px;
    margin: 0;
    background: var(--address-bar-bg, #fff);
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    border-top: 1px solid var(--tab-separator-color, rgba(0, 0, 0, 0.1));
}

.url-input-container {
    flex: 1;
    height: 36px;
    background: var(--input-bg, #f1f3f4);
    border-radius: 18px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    margin: 0;
    min-width: 0;
}

.url-input {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: var(--text-color, #333);
}

.action-button {
    flex-shrink: 0;
    height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 18px;
    background: transparent;
    color: var(--text-color, #333);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.action-button:hover {
    background: var(--button-hover-bg, #f1f3f4);
}

/* 修改CSS变量 */
:root {
    --tab-bar-bg: #f1f3f4;
    --tab-bg: rgba(32, 33, 36, 0.1);
    --tab-hover-bg: rgba(32, 33, 36, 0.08);
    --tab-active-bg: #fff;
    --tab-separator-color: rgba(0, 0, 0, 0.2);
    --text-color: #5f6368;
    --active-text-color: #202124;
    --icon-color: #5f6368;
    --close-hover-bg: rgba(0, 0, 0, 0.08);
    --primary-color: #1a73e8;
    --new-tab-shadow: 0 -8px 12px -6px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
    --tab-bar-bg: #202124;
    --tab-bg: rgba(255, 255, 255, 0.1);
    --tab-hover-bg: rgba(255, 255, 255, 0.08);
    --tab-active-bg: #292a2d;
    --tab-separator-color: rgba(255, 255, 255, 0.2);
    --text-color: #9ba0a5;
    --active-text-color: #e8eaed;
    --icon-color: #9ba0a5;
    --close-hover-bg: rgba(255, 255, 255, 0.08);
    --primary-color: #8ab4f8;
    --new-tab-shadow: 0 -8px 12px -6px rgba(0, 0, 0, 0.3);
}
</style>
