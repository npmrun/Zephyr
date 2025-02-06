import type { IPluginAPI, IPluginContext } from '../../types'
import type { WebContents } from 'electron'

export default class ExamplePlugin implements IPluginAPI {
    async activate(context: IPluginContext) {
        // 注册命令
        context.commands.register("examplePlugin.hello", () => {
            // 创建一个新标签页显示欢迎消息
            context.tabs.createTab('data:text/html,<h1 style="text-align:center;margin-top:50px;font-family:system-ui;">Example Plugin 加载成功！🎉</h1>')
        })

        // 监听新标签页
        context.tabs.onCreated((tab: WebContents) => {
            console.log("New tab created:", tab.getURL())
        })

        // 自动执行欢迎命令
        setTimeout(() => {
            context.tabs.createTab('data:text/html,<h1 style="text-align:center;margin-top:50px;font-family:system-ui;">Example Plugin 加载成功！🎉</h1>')
        }, 1000)
    }

    async deactivate() {
        // 清理资源
    }
} 