import { EventMaps } from "helper/updater/common"

const curProgress = ref(0)

getApi<EventMaps>().on("update-progress", (_, data) => {
  console.log(data)
})

function useUpdate() {
  return {
    curProgress,
  }
}

export { useUpdate }
