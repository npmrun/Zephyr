if (import.meta.env.DEV) {
    // 引入之后可以热更新
    import("./languages/zh.json")
    import("./languages/en.json")
}

const datetimeFormats = {
    en: {
        short: {
            year: "numeric",
            month: "short",
            day: "numeric",
        },
        long: {
            year: "numeric",
            month: "short",
            day: "numeric",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
        },
    },
    zh: {
        short: {
            year: "numeric",
            month: "short",
            day: "numeric",
        },
        long: {
            year: "numeric",
            month: "short",
            day: "numeric",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        },
    },
}

export { datetimeFormats }
