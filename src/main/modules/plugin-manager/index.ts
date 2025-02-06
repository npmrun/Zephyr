import { injectable, inject } from "inversify"
import { app } from "electron"
import path from "path"
import fs from "fs-extra"
import BaseClass from "vc/base/base"
import { Setting } from "../setting"
import Commands from "../commands"
import { Tabs } from "../tabs"
import { WindowManager } from "../window-manager"
import { IPluginContext } from "./types"

export interface IPlugin {
    name: string
    version: string
    description?: string
    author?: string
    main: string
    preload?: string
    // 插件入口方法
    activate?: (context: IPluginContext) => Promise<void>
    deactivate?: () => Promise<void>
}

@injectable()
class PluginManager extends BaseClass {
    private plugins: Map<string, IPlugin> = new Map()
    private pluginInstances: Map<string, any> = new Map()
    
    constructor(
        @inject(Setting) private setting: Setting,
        @inject(Commands) private commands: Commands,
        @inject(Tabs) private tabs: Tabs,
        @inject(WindowManager) private windowManager: WindowManager
    ) {
        super()
    }

    async init() {
        // 获取插件目录路径
        const pluginsPath = this.getPluginsPath()
        await fs.ensureDir(pluginsPath)
        
        // 加载所有插件
        await this.loadPlugins(pluginsPath)
    }

    private getPluginsPath(): string {
        if (process.env.NODE_ENV === 'development') {
            // 开发环境下从项目根目录加载
            return path.join(process.cwd(), 'plugins')
        } else {
            // 生产环境下从 resources 目录加载
            return path.join(process.resourcesPath, 'plugins')
        }
    }

    async destroy() {
        // 卸载所有插件
        for (const [name, instance] of this.pluginInstances) {
            if (instance.deactivate) {
                await instance.deactivate()
            }
        }
        this.plugins.clear()
        this.pluginInstances.clear()
    }

    private async loadPlugins(pluginsPath: string) {
        const entries = await fs.readdir(pluginsPath)
        
        for (const entry of entries) {
            // 跳过 types 目录和 node_modules
            if (entry === 'types' || entry === 'node_modules') continue;
            
            const pluginPath = path.join(pluginsPath, entry)
            const stat = await fs.stat(pluginPath)
            
            if (stat.isDirectory()) {
                await this.loadPlugin(pluginPath)
            }
        }
    }

    private createPluginContext(): IPluginContext {
        return {
            commands: {
                register: (command: string, callback: (...args: any[]) => any) => {
                    this.commands.register(command, callback)
                }
            },
            tabs: {
                getCurrentTab: () => this.tabs.getCurrentTab(),
                getAllTabs: () => this.tabs.getAllTabs(),
                createTab: (url: string) => this.tabs.createTab(url),
                onCreated: (callback) => this.tabs.events.on('created', callback)
            },
            windows: {
                getCurrentWindow: () => this.windowManager.getCurrentWindow(),
                getAllWindows: () => this.windowManager.getAllWindows()
            }
        }
    }

    private async loadPlugin(pluginPath: string) {
        try {
            console.log("Trying to load plugin from:", pluginPath)
            
            // 不要尝试加载 node_modules 目录
            if (pluginPath.includes('node_modules')) {
                return;
            }
            
            const manifestPath = path.join(pluginPath, "package.json")
            const manifest = await fs.readJSON(manifestPath)
            console.log("Plugin manifest loaded:", manifest)
            
            if (!this.validatePlugin(manifest)) {
                throw new Error(`Invalid plugin format: ${manifest.name}`)
            }

            const mainPath = path.join(pluginPath, manifest.main)
            console.log("Loading plugin main file from:", mainPath)
            
            const pluginModule = require(mainPath)
            console.log("Plugin module loaded:", !!pluginModule)
            
            const instance = new pluginModule.default()
            await instance.activate(this.createPluginContext())
            
            this.pluginInstances.set(manifest.name, instance)
            console.log("Plugin loaded successfully:", manifest.name)
            
        } catch (error) {
            console.error("Failed to load plugin:", error)
        }
    }

    private validatePlugin(manifest: any): manifest is IPlugin {
        return (
            typeof manifest.name === "string" &&
            typeof manifest.version === "string" &&
            typeof manifest.main === "string"
        )
    }

    // 获取已加载的插件列表
    getPlugins() {
        return Array.from(this.plugins.values())
    }

    // 获取插件实例
    getPlugin(name: string) {
        return this.pluginInstances.get(name)
    }
}

export { PluginManager }
export default PluginManager 