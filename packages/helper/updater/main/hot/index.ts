import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { app } from "electron"
import download from "./download"
import extract from "extract-zip"

import _logger from "logger/main"
import { emit, EventEnum } from "../handler"

const logger = _logger.createNamespace("hot-updater")

function getUpdateScriptTemplate() {
  return process.platform === "win32"
    ? `
      @echo off
      timeout /t 2
      taskkill /IM "{{EXE_NAME}}" /F
      xcopy /Y /E "{{UPDATE_DIR}}\\*" "{{APP_PATH}}"
      start "" "{{EXE_PATH}}"
      `
    : `
      #!/bin/bash
      sleep 2
      pkill -f "{{EXE_NAME}}"
      cp -Rf "{{UPDATE_DIR}}/*" "{{APP_PATH}}/"
      open "{{EXE_PATH}}"
      `
}

function generateUpdateScript() {
  const scriptContent = getUpdateScriptTemplate()
    .replace(/{{APP_PATH}}/g, process.platform === "win32" ? "%APP_PATH%" : "$APP_PATH")
    .replace(/{{UPDATE_DIR}}/g, process.platform === "win32" ? "%UPDATE_DIR%" : "$UPDATE_DIR")
    .replace(/{{EXE_PATH}}/g, process.platform === "win32" ? "%EXE_PATH%" : "$EXE_PATH")
    .replace(/{{EXE_NAME}}/g, process.platform === "win32" ? "%EXE_NAME%" : "$EXE_NAME")

  const scriptPath = path.join(os.tmpdir(), `update.${process.platform === "win32" ? "bat" : "sh"}`)
  fs.writeFileSync(scriptPath, scriptContent)
  return scriptPath
}
// 标记是否需要热更新
let shouldPerformHotUpdate = false
let isReadyUpdate = false
// 更新临时目录路径
// 使用应用名称和随机字符串创建唯一的临时目录
const updateTempDirPath = path.join(os.tmpdir(), `${app.getName()}-update-${Math.random().toString(36).substring(2, 15)}`)
app.once("will-quit", event => {
  if (!shouldPerformHotUpdate) return
  event.preventDefault()
  const appPath = app.getAppPath()
  const appExePath = process.execPath
  const exeName = path.basename(appExePath)
  // 生成动态脚本
  const scriptPath = generateUpdateScript()

  fs.chmodSync(scriptPath, 0o755)

  // 执行脚本
  const child = spawn(scriptPath, [], {
    detached: true,
    shell: true,
    env: {
      APP_PATH: appPath,
      UPDATE_DIR: updateTempDirPath,
      EXE_PATH: appExePath,
      EXE_NAME: exeName,
    },
  })
  child.unref()
  app.exit()
})

// 下载热更新包
export async function fetchHotUpdatePackage(updatePackageUrl: string) {
  if (isReadyUpdate) return

  // 清除临时目录
  clearUpdateTempDir()
  // 创建临时目录
  if (!fs.existsSync(updateTempDirPath)) {
    fs.mkdirSync(updateTempDirPath, { recursive: true })
  }

  // 下载文件的本地保存路径
  const downloadPath = path.join(updateTempDirPath, "update.zip")

  try {
    // 使用 fetch 下载更新包
    const arrayBuffer = await download({
      url: updatePackageUrl,
      onprocess(now, all) {
        logger.debug(`下载进度: ${((now / all) * 100).toFixed(2)}%`)
        emit(EventEnum.UPDATE_PROGRESS, { percent: (now / all) * 100, now, all })
      },
    })
    fs.writeFileSync(downloadPath, Buffer.from(arrayBuffer))
    // 解压更新包
    await extract(downloadPath, { dir: updateTempDirPath })

    // 删除下载的zip文件
    fs.unlinkSync(downloadPath)
    isReadyUpdate = true
  } catch (error) {
    logger.debug("热更新包下载失败:", error)
    throw error
  }
}

function clearUpdateTempDir() {
  if (!fs.existsSync(updateTempDirPath)) return
  fs.rmSync(updateTempDirPath, { recursive: true })
}

export function flagNeedUpdate() {
  shouldPerformHotUpdate = true
}
