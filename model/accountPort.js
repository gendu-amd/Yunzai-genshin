/**
 * AccountPort 实现（chapter1-03）
 *
 * 把 genshin 现有米游社能力（MysInfo / MysApi）包装成 L1 契约层的 `account` 能力，
 * 并注册到 `Bot.core.provide('account', …)`。
 *
 * 非侵入原则：
 *  - 不改任何现有逻辑，仅"新增"一条 core 通道；
 *  - 旧的 `file://` / 直接 import（xiaoyao 等）全部保留，照常工作；
 *  - 消费方今后可改用 `Bot.core.require('account')`，取不到时自行降级。
 *
 * 依赖懒加载（ESM 会缓存），避免与 genshin 内部模块的加载顺序/循环问题。
 */
const accountPort = {
  /** 能力元信息 */
  meta: { provider: "genshin", since: "3.1.3" },

  /** 解析当前事件绑定的 uid（按 e.game）。等价 MysInfo.getUid(e, matchMsgUid) */
  async getUid(e, matchMsgUid = true) {
    const MysInfo = (await import("./mys/mysInfo.js")).default
    return MysInfo.getUid(e, matchMsgUid)
  },

  /** 高层取数：等价 MysInfo.get(e, api, data, option)，内部自动解析 uid/ck/公共池 */
  async getData(e, api, data = {}, option = {}) {
    const MysInfo = (await import("./mys/mysInfo.js")).default
    return MysInfo.get(e, api, data, option)
  },

  /** 构造 MysApi 客户端（uid + ck + { game }） */
  async mysApi(uid, ck, option = { game: "gs" }) {
    const MysApi = (await import("./mys/mysApi.js")).default
    return new MysApi(uid, ck, option)
  },

  /** uid 是否已绑定 Cookie。等价 MysInfo.checkUidBing(uid, game) */
  async checkUidBing(uid, game = "gs") {
    const MysInfo = (await import("./mys/mysInfo.js")).default
    return MysInfo.checkUidBing(uid, game)
  },

  /** 初始化某 api 的 MysApi（解析 uid/ck 等）。等价 MysInfo.init(e, api) */
  async init(e, api) {
    const MysInfo = (await import("./mys/mysInfo.js")).default
    return MysInfo.init(e, api)
  },
}

/** 注册到 L1 契约层（宿主已挂载时）。幂等、容错：拿不到 core 不影响 genshin 加载。 */
try {
  if (globalThis.Bot?.core?.provide) {
    Bot.core.provide("account", accountPort)
    logger?.mark?.("[contracts] genshin 提供能力：account")
  }
} catch (err) {
  logger?.warn?.(`[contracts] 注册 account 失败：${err?.message}`)
}

export default accountPort
