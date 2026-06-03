/**
 * `gacha` 能力实现 —— 工厂式包 genshin 的抽卡记录(GachaLog)/充值流水(payLog),返回同一类实例
 * (构造无副作用)。供 xiaoyao 等按接口消费,不再 `file://` 直 import genshin 内部文件;数据逐字等价。
 */
import GachaLog from "./gachaLog.js"
import { payLog } from "../apps/payLog.js"

const gachaPort = {
  /** 构造抽卡记录处理器。等价 new GachaLog(e);可 `.logUrl()/.updateLog()/.getLogData()` */
  log: e => new GachaLog(e),

  /** 便捷：按事件 msg 中 url 导入抽卡记录。等价 new GachaLog(e).logUrl() */
  importByUrl: e => new GachaLog(e).logUrl(),

  /** 构造充值流水处理器。等价 new payLog();调用方设 .e 后 `.getAuthKey()/.payLog(e)` */
  payLog: () => new payLog(),
}

try {
  globalThis.Bot?.core?.provide?.("gacha", gachaPort)
} catch (err) {
  logger?.warn?.(`[contracts] 注册 gacha 失败:${err?.message}`)
}

export default gachaPort
