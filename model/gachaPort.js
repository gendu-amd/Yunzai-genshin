/**
 * GachaPort 实现（chapter2 · P2）
 *
 * 把 genshin 的抽卡记录(GachaLog)/充值流水(payLog)能力包装成 L1 契约层的 `gacha` 能力，
 * 注册到 `Bot.core.provide('gacha', …)`。供 xiaoyao 等按接口消费，
 * 不再 `file://` 直 import genshin 的 `model/gachaLog.js` / `apps/payLog.js`。
 *
 * 工厂式：返回 genshin 现有类的实例（同一类、构造无副作用），消费方调其方法
 *（如 `.logUrl()` / `.getAuthKey()`）。数据与旧直接 import 逐字等价。
 * 非侵入：仅"新增" core 通道；genshin 内部用法全保留。
 */
const gachaPort = {
  meta: { provider: "genshin", since: "P2" },

  /** 构造抽卡记录处理器（等价 new GachaLog(e)）。调用方可 `.logUrl()/.updateLog()/.getLogData()` 等 */
  async log(e) {
    const GachaLog = (await import("./gachaLog.js")).default
    return new GachaLog(e)
  },

  /** 便捷：按事件 msg 中的 url 导入抽卡记录（等价 new GachaLog(e).logUrl()） */
  async importByUrl(e) {
    const GachaLog = (await import("./gachaLog.js")).default
    return new GachaLog(e).logUrl()
  },

  /** 构造充值流水处理器（等价 new payLog()）。调用方设置 .e 后可 `.getAuthKey()/.payLog(e)` */
  async payLog() {
    const { payLog } = await import("../apps/payLog.js")
    return new payLog()
  },
}

// ADR-007：注册由框架据 manifest.provides 自动完成,此处只导出实现。
export default gachaPort
