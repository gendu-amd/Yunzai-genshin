/**
 * `account` 能力实现 —— 对 genshin 现有 MysInfo/MysApi/User/NoteUser 的薄封装(同一函数,数据等价)。
 * 各方法即转调底层,给消费方一个稳定接口;消费方经 `Bot.core.require('account')` 取用,取不到自行降级。
 */
import MysInfo from "./mys/mysInfo.js"
import MysApi from "./mys/mysApi.js"
import User from "./user.js"
import NoteUser from "./mys/NoteUser.js"

const accountPort = {
  /** 解析当前事件绑定的 uid（按 e.game）。等价 MysInfo.getUid */
  getUid: (e, matchMsgUid = true) => MysInfo.getUid(e, matchMsgUid),

  /** 高层取数（自动解析 uid/ck/公共池）。等价 MysInfo.get */
  getData: (e, api, data = {}, option = {}) => MysInfo.get(e, api, data, option),

  /** 构造 MysApi 客户端。等价 new MysApi(uid, ck, {game}) */
  mysApi: (uid, ck, option = { game: "gs" }) => new MysApi(uid, ck, option),

  /** uid 是否已绑定 Cookie。等价 MysInfo.checkUidBing */
  checkUidBing: (uid, game = "gs") => MysInfo.checkUidBing(uid, game),

  /** 初始化某 api 的 MysApi。等价 MysInfo.init */
  init: (e, api) => MysInfo.init(e, api),

  /** 绑定 Cookie/Stoken(先设 e.ck/e.msg)。等价 new User(e).bing();写操作 */
  bindCookie: e => new User(e).bing(),

  /** 遍历所有已绑 CK 用户(fn 收 NoteUser,含 .qq/.eachMysUser)。等价 NoteUser.forEach */
  forEachUser: fn => NoteUser.forEach(fn),

  /**
   * 取某用户某游戏「已绑 CK」的 uid 列表(去重)。等价 NoteUser.create(e).getCkUidList(game)。
   * 供消费方按 uid 逐个 getData('dailyNote') —— 统一账号源,替代各插件自维护的 ck 库。
   * @returns {Promise<string[]>}
   */
  async getBindUidList(e, game = "gs") {
    const user = await NoteUser.create(e)
    const list = user?.getCkUidList?.(game) || []
    return [...new Set(list.map(ds => String(ds?.uid)).filter(Boolean))]
  },
}

// 直接注册到 L1 契约层(provider 自注册,简单显式;容错:拿不到 core 不影响 genshin 加载)。
try {
  globalThis.Bot?.core?.provide?.("account", accountPort)
} catch (err) {
  logger?.warn?.(`[contracts] 注册 account 失败:${err?.message}`)
}

export default accountPort
