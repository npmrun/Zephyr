/**
 *
 * @param url 路径
 * @returns 图片路径
 */
export const getAssetsFile = url => {
  const urlArr = String(url).split("/")
  const prefix = urlArr.slice(-2)[0]
  const fileName = urlArr.slice(-1)[0]
  return new URL(`../assets/images/${prefix}/${fileName}`, import.meta.url).href
}
