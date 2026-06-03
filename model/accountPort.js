/**
 * AccountPort 实现（chapter1-03）
 *
 * 把 genshin 现有米游社能力（MysInfo / MysApi）包装成 L1 契约层的 `account` 能力，
 * 并注册到 `Bot.core.provide('account', …)`。
 *
 * 非侵入原则：仅"新增"一条 core 通道;旧的 file:// / 直接 import 全部保留;消费方取不到自行降级。
 *
 * 实现=对现有 MysInfo/MysApi/User/NoteUser 的薄封装(同一函数,数据等价)。
 * 顶部静态 import:本模块由框架 wireManifests 在全部插件加载完后才导入,无加载顺序/循环之虞。
 */
import MysInfo from "./mys/mysInfo.js"
import MysApi from "./mys/mysApi.js"
import User from "./user.js"
import NoteUser from "./mys/NoteUser.js"

const accountPort = {
  meta: { provider: "genshin", since: "3.1.3" },

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

// ADR-007：注册由框架据 manifest.provides 自动完成(loader.wireManifests),此处只导出实现。
export default accountPort
