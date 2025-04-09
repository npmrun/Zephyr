// https://blog.guowenfh.com/2017/10/21/2017/electron-multiple-session/#%E5%9C%A8-webview-%E4%B8%AD

import { BrowserWindow } from "electron"
/**
 * 创建一个 登录 的窗口。
 * 用于 session 隔离
 * Promise 中有  {partition,userinfo,cookies}
 * @returns Promise
 */
function createLoginWin(partition) {
  partition = partition || `persist:${Math.random()}`
  const charset = require("superagent-charset")
  const request = charset(require("superagent")) // HTTP
  let presWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    title: "用户登陆",
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: true,
      partition,
    },
  })
  let webContents = presWindow.webContents
  return new Promise(function (resove, reject) {
    // webContents.openDevTools();
    presWindow.loadURL("http://taobao.com/#/login")
    webContents.on("did-navigate-in-page", async function () {
      // 这里可以看情况进行参数的传递，获取制定的 cookies
      const cookies = await webContents.session.cookies.get({})
      let obj = { partition, cookies }
      resove(obj)
      // webContents.session.cookies.get({}, function (err, cookies) {
      //   if (err) {
      //     presWindow.close() // 关闭登陆窗口
      //     return reject(err)
      //   }
      //   let obj = { partition, cookies }
      //   resove(obj)
      // 这一步并不是必需的。
      //   request
      //     .get("http://taobao.com/userinfo")
      //     .query({ _: Date.now() }) // query string
      //     .set("Cookie", cookies.map(item => `${item.name}=${item.value};`).join(" "))
      //     .end(function (err, res) {
      //       presWindow.close()
      //       if (err) {
      //         return reject(err)
      //       }
      //       if (!res || !res.body || !res.body.result !== 1) {
      //         return reject(res.body)
      //       }
      //       let obj = { partition, cookies, userinfo: res.body.data }
      //       resove(obj)
      //     })
    })
    //   })
  })
}

export {
    createLoginWin
}