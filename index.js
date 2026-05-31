import fs from "node:fs"
// chapter1-03：向 L1 契约层注册 account 能力（副作用 import，非侵入；详见 model/accountPort.js）
import "./model/accountPort.js"

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
