// import { EventEnum } from "helper/updater/common"

const curProgress = ref(0)

// .on(EventEnum.UPDATE_PROGRESS, ({ percent, now, all }) => {
//   curProgress.value = percent
// })

function useUpdate() {
  return {
    curProgress,
  }
}

export { useUpdate }
