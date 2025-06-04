type DownloadPercent = {
  url: string
  option?: object
  onprocess?: (now: number, all: number) => void
  onsuccess?: (data: any) => void
  onerror?: (res: Response) => void
}
const RequestPercent = async ({
  url = "",
  option = {
    headers: {
      responseType: "arraybuffer",
    },
  },
  onsuccess,
  onerror,
  onprocess,
}: DownloadPercent) => {
  const response = (await fetch(url, option)) as any
  if (!response.ok) {
    onerror?.(response)
    throw new Error(`下载失败`)
  }
  const reader = response?.body.getReader()

  // 文件总长度
  const contentLength = +response.headers.get("content-length")

  let receivedLength = 0
  const chunks: any[] = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    chunks.push(value)
    receivedLength += value.length
    onprocess?.(receivedLength, contentLength)
  }
  // 这里的chunksAll 已经是ArrayBuffer的数据类型了，可以直接返回，也可以转为blob处理
  const chunksAll = new Uint8Array(receivedLength)
  let position = 0
  for (const chunk of chunks) {
    chunksAll.set(chunk, position)
    position += chunk.length
  }

  onsuccess?.(chunksAll)

  return chunksAll
}

export { RequestPercent }
export default RequestPercent

// RequestPercent({
//   url: "http://117.21.250.136:9812/ZxqyGateway/biz/file/downApk/%E6%98%93%E4%BC%81%E6%95%B0%E8%BD%AC%E5%B9%B3%E5%8F%B0app-1.2.7.apk",
//   option: {
//     headers: {
//       responseType: "arraybuffer",
//     },
//   },
//   onerror: () => {},
//   onsuccess: data => {
//     fs.writeFileSync("./aaa.apk", Buffer.from(data))
//     console.log("success", data)
//   },
//   onprocess: (receivedLength, contentLength) => {
//     console.log(receivedLength, contentLength)
//   },
// })
