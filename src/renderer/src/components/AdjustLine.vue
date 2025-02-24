<template>
    <div ref="adjustLineEL" :class="['adjust-line', `adjust-line--${direction}`, { 'adjust-line--dragging': isDragging }]">
        <div class="adjust-line__handle">
            <div class="adjust-line__grip">
                <span class="grip-line"></span>
                <span class="grip-line"></span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, computed, onBeforeUnmount, onErrorCaptured } from "vue"
import { useDebounceFn } from "@vueuse/core"

const adjustLineEL = ref<HTMLElement>()

// 定义方向类型
type Direction = "left" | "right" | "top" | "bottom"

// 优化Props接口
interface AdjustLineProps {
    /**
     * 所在方向 'left' | 'right' | 'top' | 'bottom'
     */
    direction?: Direction
    /**
     * 需要调整的元素
     */
    target?: HTMLElement
    /**
     * 两个调整线时需要填写
     */
    watch?: HTMLElement
    /**
     * 唯一ID
     */
    mid?: string
    minSize?: number
    maxSize?: number
    defaultSize?: number
    onChange?: (size: number) => void
}

const props = withDefaults(defineProps<AdjustLineProps>(), {
    direction: "right",
    minSize: 100,
    maxSize: 800,
})

// 定义事件
const emit = defineEmits<{
    (e: "resize", size: number): void
    (e: "resizeStart"): void
    (e: "resizeEnd", size: number): void
}>()

let curTarget: HTMLElement | undefined | null

const isDragging = ref(false)
const currentSize = ref(props.defaultSize || 0)

// 使用computed优化方向判断
const isHorizontal = computed(() => props.direction === "left" || props.direction === "right")

// 使用computed获取光标样式
const cursorStyle = computed(() => (isHorizontal.value ? "ew-resize" : "ns-resize"))

// 保存状态到localStorage的优化
const storageKey = computed(() => `adjust-line-${props.mid}`)

function saveSize(size: number) {
    if (props.mid) {
        try {
            localStorage.setItem(storageKey.value, String(size))
        } catch (error) {
            console.warn("Failed to save size to localStorage:", error)
        }
    }
}

function loadSavedSize(): number | null {
    if (props.mid) {
        try {
            const saved = localStorage.getItem(storageKey.value)
            return saved ? Number(saved) : null
        } catch (error) {
            console.warn("Failed to load size from localStorage:", error)
            return null
        }
    }
    return null
}

// 使用防抖优化resize事件
const emitResize = useDebounceFn((size: number) => {
    emit("resize", size)
}, 16)

// 使用ResizeObserver监听容器大小变化
let observer: ResizeObserver | null = null
const observeResize = () => {
    if (!adjustLineEL.value) return

    observer = new ResizeObserver(() => {
        if (curTarget) {
            const size = isHorizontal.value ? curTarget.clientWidth : curTarget.clientHeight
            currentSize.value = size
            emitResize(size)
        }
    })

    observer.observe(adjustLineEL.value)
}

onBeforeUnmount(() => {
    observer && observer.disconnect()
})

onMounted(async () => {
    await nextTick()
    if (!props.target) {
        curTarget = adjustLineEL.value?.parentElement
    } else {
        curTarget = props.target
    }
    if (curTarget) {
        handle(curTarget)
    }
    watch(
        () => props.target,
        target => {
            curTarget = target
            if (curTarget) {
                handle(curTarget)
            }
        },
    )
    observeResize()
})

function handle(target: HTMLElement) {
    if (!adjustLineEL.value) return
    const nextContainer = target
    const el = adjustLineEL.value
    const container = el.parentElement
    const parentContainer = container?.parentElement
    const watchContainer = props.watch
    let isThree = false
    if (container !== nextContainer) {
        isThree = true
    }
    if (nextContainer && el && container && parentContainer) {
        if (props.direction === "left" || props.direction === "right") {
            if (props.mid) {
                let w = localStorage.getItem(props.mid)
                if (w != undefined) {
                    container.style.width = w + "px"
                }
            }
            el.onmousedown = function (e) {
                let width = container.clientWidth
                let nwidth = nextContainer.clientWidth
                // let owidth = nwidth + width
                let owidth = parentContainer.clientWidth
                let wwidth = watchContainer?.clientWidth ?? 0

                if (isThree) {
                    owidth = nwidth + width
                }

                let startX = e.clientX

                let lastPointerEvents = document.body.style.pointerEvents
                let lastUserSelect = document.body.style.userSelect
                let lastOnmousemove = document.onmousemove
                let lastOnmouseup = document.onmouseup
                document.onmousemove = function (e) {
                    let nowX = e.clientX
                    let w = 0
                    let offset = startX - nowX
                    if (props.direction == "left") {
                        w = width + offset
                    }
                    if (props.direction == "right") {
                        w = width - offset
                    }
                    if (w >= owidth) {
                        w = owidth
                    }
                    if (w <= 0) {
                        w = 0
                    }
                    // if (Math.abs(w - owidth / 2) <= 10) {
                    //     w = owidth / 2
                    // }
                    // if (Math.abs(w - owidth) < 10) {
                    //     w = owidth
                    // }
                    // if (Math.abs(w) < 10) {
                    //     w = 0
                    // }
                    document.body.style.pointerEvents = "none"
                    document.body.style.userSelect = "none"
                    if (!isThree && watchContainer) {
                        let ww = wwidth - offset
                        if (width >= -offset) {
                            watchContainer.style.width = ww + "px"
                        }
                        nextContainer.style.width = w + "px"
                    } else {
                        if (!isThree) {
                            nextContainer.style.width = w + "px"
                            // nextContainer.style.minWidth = w + 'px'
                            // nextContainer.style.flexBasis = w + 'px'
                        } else {
                            nextContainer.style.width = owidth - w + "px"
                            // nextContainer.style.minWidth = (owidth-w) + 'px'
                            // nextContainer.style.flexBasis = (owidth - w) + 'px'
                        }
                    }
                }
                document.onmouseup = function () {
                    document.onmousemove = lastOnmousemove
                    document.onmouseup = lastOnmouseup
                    document.body.style.pointerEvents = lastPointerEvents
                    document.body.style.userSelect = lastUserSelect
                    if (props.mid) {
                        let width = container.clientWidth
                        localStorage.setItem(props.mid, String(width))
                    }
                }
            }
        }
        if (props.direction === "top" || props.direction === "bottom") {
            if (props.mid) {
                let w = localStorage.getItem(props.mid)
                if (w != undefined) {
                    container.style.height = w + "px"
                }
            }
            el.onmousedown = function (e) {
                let height = container.clientHeight
                let nheight = nextContainer.clientHeight
                // let oheight = nheight + height
                let oheight = parentContainer.clientHeight
                let hheight = watchContainer?.clientHeight ?? 0
                if (isThree) {
                    oheight = nheight + height
                }

                let startY = e.clientY

                let lastPointerEvents = document.body.style.pointerEvents
                let lastUserSelect = document.body.style.userSelect
                let lastOnmousemove = document.onmousemove
                let lastOnmouseup = document.onmouseup

                document.onmousemove = function (e) {
                    let nowY = e.clientY
                    let h = 0
                    let offset = startY - nowY
                    if (props.direction == "top") {
                        h = height + startY - nowY
                    }
                    if (props.direction == "bottom") {
                        h = height - offset
                    }
                    console.log(oheight)

                    if (h >= oheight) {
                        h = oheight
                    }
                    if (h <= 0) {
                        h = 0
                    }
                    // if (Math.abs(h - oheight / 2) <= 15) {
                    //     h = oheight / 2
                    // }
                    // if (Math.abs(h - oheight) < 50) {
                    //     h = oheight
                    // }
                    // if (Math.abs(h) < 50) {
                    //     h = 0
                    // }
                    document.body.style.pointerEvents = "none"
                    document.body.style.userSelect = "none"
                    if (!isThree && watchContainer) {
                        let hh = hheight - offset
                        if (height >= -offset) {
                            watchContainer.style.height = hh + "px"
                        }
                        nextContainer.style.height = h + "px"
                    } else {
                        if (!isThree) {
                            nextContainer.style.height = h + "px"
                            // nextContainer.style.minHeight = h + 'px'
                            // nextContainer.style.flexBasis = h + 'px'
                        } else {
                            nextContainer.style.height = oheight - h + "px"
                            // nextContainer.style.minHeight = (oheight - h) + 'px'
                            // nextContainer.style.flexBasis = (oheight - h) + 'px'
                        }
                    }
                }
                document.onmouseup = function () {
                    document.onmousemove = lastOnmousemove
                    document.onmouseup = lastOnmouseup
                    document.body.style.pointerEvents = lastPointerEvents
                    document.body.style.userSelect = lastUserSelect
                    if (props.mid) {
                        let height = container.clientHeight
                        localStorage.setItem(props.mid, String(height))
                    }
                }
            }
        }
    }
}

function handleDrag(e: MouseEvent, target: HTMLElement) {
    const startPos = isHorizontal.value ? e.clientX : e.clientY
    const startSize = isHorizontal.value ? target.clientWidth : target.clientHeight

    const handleMouseMove = (e: MouseEvent) => {
        const currentPos = isHorizontal.value ? e.clientX : e.clientY
        const diff = props.direction === "right" || props.direction === "bottom" ? startPos - currentPos : currentPos - startPos

        let newSize = startSize - diff

        // 限制大小范围
        newSize = Math.max(props.minSize, Math.min(props.maxSize, newSize))

        // 应用新尺寸
        if (isHorizontal.value) {
            target.style.width = `${newSize}px`
        } else {
            target.style.height = `${newSize}px`
        }

        currentSize.value = newSize
        emit("resize", newSize)
    }

    const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.userSelect = ""
        isDragging.value = false
        saveSize(currentSize.value)
        emit("resizeEnd", currentSize.value)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.body.style.userSelect = "none"
    isDragging.value = true
    emit("resizeStart")
}

const debug = {
    log: (...args: any[]) => {
        if (process.env.NODE_ENV === "development") {
            console.log("[AdjustLine]", ...args)
        }
    },
    error: (...args: any[]) => {
        console.error("[AdjustLine]", ...args)
    },
}

function handleError(error: Error, context: string) {
    debug.error(`Error in ${context}:`, error)
    // 可以添加错误上报逻辑
}

// 错误边界处理
onErrorCaptured((err, instance, info) => {
    handleError(err as Error, info)
    return false
})
</script>

<style lang="scss" scoped>
.adjust-line {
    position: absolute;
    z-index: 999;

    &__handle {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        transition: all 0.2s ease;
    }

    &__grip {
        display: flex;
        gap: 3px;
        opacity: 0;
        transition: opacity 0.2s;

        .adjust-line:hover &,
        .adjust-line--dragging & {
            opacity: 1;
        }
    }

    .grip-line {
        background-color: #999;
        border-radius: 1px;

        .adjust-line:hover &,
        .adjust-line--dragging & {
            background-color: #666;
        }
    }

    // 水平方向的调整线
    &--left,
    &--right {
        top: 0;
        bottom: 0;
        width: 10px; // 增加可点击区域
        cursor: col-resize;

        .adjust-line__handle {
            left: 0;
            top: 0;
            bottom: 0;
            width: 100%;
        }

        .adjust-line__grip {
            flex-direction: column;
        }

        .grip-line {
            width: 2px;
            height: 16px;
        }

        &:hover .adjust-line__handle {
            background-color: rgba(0, 0, 0, 0.05);
        }
    }

    // 垂直方向的调整线
    &--top,
    &--bottom {
        left: 0;
        right: 0;
        height: 10px; // 增加可点击区域
        cursor: row-resize;

        .adjust-line__handle {
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
        }

        .adjust-line__grip {
            flex-direction: row;
        }

        .grip-line {
            width: 16px;
            height: 2px;
        }

        &:hover .adjust-line__handle {
            background-color: rgba(0, 0, 0, 0.05);
        }
    }

    // 调整位置以居中
    &--left {
        left: -5px;
    }
    &--right {
        right: -5px;
    }
    &--top {
        top: -5px;
    }
    &--bottom {
        bottom: -5px;
    }

    // 拖动时的全局遮罩
    &--dragging {
        &::after {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            cursor: inherit;
        }

        .adjust-line__handle {
            background-color: rgba(0, 0, 0, 0.08);
        }

        .grip-line {
            background-color: #666;
        }
    }
}
</style>
