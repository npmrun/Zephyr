import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { app } from "electron"

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

app.on("will-quit", event => {
    event.preventDefault()

    // 假设已下载更新到临时目录
    const updateTempDir = path.join(os.tmpdir(), "app-update")
    const appPath = app.getAppPath()
    const appExePath = process.execPath

    // 生成动态脚本
    const scriptPath = generateUpdateScript()

    fs.chmodSync(scriptPath, 0o755)

    // 执行脚本
    const child = spawn(scriptPath, [], {
        detached: true,
        shell: true,
        env: {
            APP_PATH: appPath,
            UPDATE_DIR: updateTempDir,
            EXE_PATH: appExePath,
        },
    })
    child.unref()
    app.exit()
})
