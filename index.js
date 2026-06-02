import fs from "node:fs"
// ADR-007 统一装配：能力注册 + manifest 声明由框架 loader.wireManifests() 据 manifest.js 自动完成,
// 不再在此手写副作用 import(*Port.js 仅导出实现,manifest.js 仅声明)。

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
