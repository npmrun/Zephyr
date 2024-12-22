import { defineConfig, presetAttributify, presetUno, transformerDirectives } from "unocss"
import presetRemToPx from "@unocss/preset-rem-to-px"

export default defineConfig({
    presets: [presetAttributify(), presetUno(), presetRemToPx()],
    transformers: [transformerDirectives()],
    shortcuts: [
        // 正方形 square-100px
        [
            /^square-\[?(.*?)\]?$/,
            ([, size]) => {
                return `w-${size} h-${size}`
            },
        ],
        // 圆形 circle-100px
        [
            /^circle-\[?(.*?)\]?$/,
            ([, size]) => {
                return `square-${size} rounded-full`
            },
        ],
        // 垂直水平居中
        ["flex-center", "flex justify-center items-center"],
    ],
    rules: [
        [
            /^text-(.*)$/,
            ([, c]) => {
                if (c === "normal") return { color: "var(--text-normal)" }
                if (c === "hover") return { color: "var(--text-hover)" }
            },
        ],
        // 多行文本超出部分省略号 line-n (已内置 line-clamp-n)
        [
            /^line-(\d+)$/,
            ([, l]) => {
                if (~~l === 1) {
                    return {
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        "white-space": "nowrap",
                        width: "100%",
                    }
                }
                return {
                    overflow: "hidden",
                    display: "-webkit-box",
                    "-webkit-box-orient": "vertical",
                    "-webkit-line-clamp": l,
                }
            },
        ],
        // 一侧圆角 rounded-left-5px (已内置 rounded-l-n)
        [
            /^rounded-(left|right|top|bottom)-(.*?)$/,
            ([, position, m]) => {
                let x1, x2, y1, y2
                if (["left", "right"].includes(position)) {
                    y1 = "top"
                    y2 = "bottom"
                    x1 = x2 = position
                } else {
                    x1 = "left"
                    x2 = "right"
                    y1 = y2 = position
                }
                if (m === "full") m = "99999px"

                return {
                    [`border-${y1}-${x1}-radius`]: m,
                    [`border-${y2}-${x2}-radius`]: m,
                }
            },
        ],
    ],
})
