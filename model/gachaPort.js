/**
 * GachaPort 实现（chapter2 · P2）
 *
 * 把 genshin 的抽卡记录(GachaLog)/充值流水(payLog)能力包装成 L1 契约层的 `gacha` 能力，
 * 注册到 `Bot.core.provide('gacha', …)`。供 xiaoyao 等按接口消费，
 * 不再 `file://` 直 import genshin 的 `model/gachaLog.js` / `apps/payLog.js`。
 *
 * 工厂式：返回 genshin 现有类的实例（同一类、构造无副作用），消费方调其方法
 *（如 `.logUrl()` / `.getAuthKey()`）。数据与旧直接 import 逐字等价。
 * 顶部静态 import:本模块由框架 wireManifests 在全部插件加载完后才导入,无加载顺序/循环之虞。
 */
import GachaLog from "./gachaLog.js"
import { payLog } from "../apps/payLog.js"

const gachaPort = {
  meta: { provider: "genshin", since: "P2" },

  /** 构造抽卡记录处理器。等价 new GachaLog(e);可 `.logUrl()/.updateLog()/.getLogData()` */
  log: e => new GachaLog(e),

  /** 便捷：按事件 msg 中 url 导入抽卡记录。等价 new GachaLog(e).logUrl() */
  importByUrl: e => new GachaLog(e).logUrl(),

  /** 构造充值流水处理器。等价 new payLog();调用方设 .e 后 `.getAuthKey()/.payLog(e)` */
  payLog: () => new payLog(),
}

// ADR-007：注册由框架据 manifest.provides 自动完成,此处只导出实现。
export default gachaPort
