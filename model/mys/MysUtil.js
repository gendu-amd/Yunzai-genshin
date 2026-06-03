import { Data } from "#miao"
import { getGameKey as gamesGetGameKey } from "../games.js"

const games = [
  { key: "gs", name: "原神" },
  { key: "sr", name: "星穹铁道" },
  { key: "zzz", name: "绝区零" },
]

const MysUtil = {
  // 获取标准ltuid
  getLtuid(data) {
    if (!data) {
      return false
    }
    if (/^\d{4,10}$/.test(data)) {
      return data
    }
    let testRet = /ltuid=(\d{4,10})/g.exec(data.ck || data)
    if (testRet && testRet[1]) {
      return testRet[1]
    }
    return false
  },

  // 获取标准gameKey —— 委托 games.js SSOT(含 null 守卫 + nap 别名,消除重复 switch)
  getGameKey(game) {
    return gamesGetGameKey(game)
  },

  // 生成设备guid
  getDeviceGuid() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }

    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()
  },

  // 循环game
  async eachGame(fn) {
    await Data.forEach(games, ds => {
      return fn(ds.key, ds)
    })
  },

  // 循环server
  async eachServ(fn) {
    await Data.forEach(["mys", "hoyolab"], fn)
  },
}
export default MysUtil
