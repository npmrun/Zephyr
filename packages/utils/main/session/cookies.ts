import { BrowserView, BrowserWindow } from "electron"

const cookies = {
  getCurrCookies(params = {}, currWin: BrowserView | BrowserWindow) {
    let currSession = currWin.webContents.session
    return currSession.cookies.get(Object.assign({}, params))
  },
  removeCurrCookies(cookies = [], currWin: BrowserView | BrowserWindow) {
    let currSession = currWin.webContents.session
    let err = []
    let apiCount = 0
    return new Promise((resove, reject) => {
      cookies.forEach(async (item: any) => {
        await currSession.cookies.remove(`http://${item.domain}`, item.name)
        apiCount = apiCount + 1
        if (err.length === apiCount) {
          resove({ message: "cookie 清除成功" })
        } else {
          reject(err)
        }
      })
    })
  },
  setCurrCookies(cookies = [], currWin: BrowserView | BrowserWindow) {
    let currSession = currWin.webContents.session
    let err = []
    let apiCount = 0
    return new Promise((resove, reject) => {
      cookies.forEach(async (item: any) => {
        await currSession.cookies.set(
          Object.assign({}, item, {
            url: `http://${item.domain}`,
            name: item.name,
          }),
        )
        apiCount = apiCount + 1
        if (err.length === apiCount) {
          resove({ message: "cookie 设置成功！" })
        } else {
          reject(err)
        }
      })
    })
  },
}

export default cookies