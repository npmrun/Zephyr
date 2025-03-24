import type { AllKeys } from "./common"

const curProgress = ref(0)
api.on<AllKeys>("progress", () => {
    curProgress.value = 10
})

function useUpdate() {
    return {
        curProgress,
    }
}

export { useUpdate }
