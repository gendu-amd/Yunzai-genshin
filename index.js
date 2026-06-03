import fs from "node:fs"
// 向 L1 契约层注册能力(副作用 import,provider 自注册):account/gameRegistry/gacha。
import "./model/accountPort.js"
import "./model/gameRegistryPort.js"
import "./model/gachaPort.js"

// 注册多游戏命令前缀(genshin 拥有 gs/sr/zzz 域,直接注册到框架 gamePrefix;前缀与原 loader 逐字一致)。
try {
  const gp = globalThis.Bot?.core?.gamePrefix
  if (gp?.register) {
    gp.register({ game: "sr", test: /^#?(\*|星铁|星轨|穹轨|星穹|崩铁|星穹铁道|崩坏星穹铁道|铁道)+/, cmd: "#星铁" })
    gp.register({ game: "zzz", test: /^#?(%|％|绝区零|绝区)+/, cmd: "#绝区零" })
  }
} catch (err) {
  logger?.warn?.(`[contracts] 注册 gamePrefix 失败:${err?.message}`)
}

const files = fs.readdirSync("./plugins/genshin/apps").filter(file => file.endsWith(".js"))

let ret = []

files.forEach(file => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace(".js", "")

  if (ret[i].status != "fulfilled") {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }
