# genshin 对外提供的能力（L1 契约层）

> 本仓作为"数据 & 账号 SSOT",通过 Yunzai L1 契约层(`Bot.core`)对外暴露能力,供其它插件**按接口消费**,无需 import 本仓内部文件。
> 设计见主仓 `docs/target-architecture.md`。本文件随能力变更更新。

## 已提供

### `account`（AccountPort） — chapter1-03（2026-05-31）
- 实现:`model/accountPort.js`,注册于 `index.js`(副作用 import)。
- 获取:`const account = Bot.core.require("account")`(取不到→null,调用方降级)。
- 方法:
  | 方法 | 说明 |
  |---|---|
  | `getUid(e, matchMsgUid=true)` | 解析事件绑定的 uid(按 `e.game`),等价 `MysInfo.getUid` |
  | `getData(e, api, data={}, option={})` | 高层取数,等价 `MysInfo.get`(自动解析 uid/ck/公共池) |
  | `mysApi(uid, ck, {game})` | 构造 `MysApi` 客户端 |
  | `checkUidBing(uid, game="gs")` | uid 是否已绑定 Cookie,等价 `MysInfo.checkUidBing` |
  | `init(e, api)` | 初始化某 api 的 MysApi,等价 `MysInfo.init` |
  | `bindCookie(e)` | 绑定 Cookie/Stoken(先设 `e.ck`/`e.msg`),等价 `new User(e).bing()`;写操作 |
  | `forEachUser(fn)` | 遍历所有已绑 CK 用户(fn 收 NoteUser,含 `.qq`/`.eachMysUser`),等价 `NoteUser.forEach` |
- 性质:**非侵入新增**——仅在现有 `MysInfo`/`MysApi` 之上包一层 `core` 通道;旧的直接 import / `file://` 调用全部保留照常工作。消费方可逐步改用 `Bot.core.require("account")`。

### `gameRegistry`（多游戏 SSOT） — chapter1-02b（2026-05-31）
- 实现:`model/gameRegistryPort.js`,注册于 `index.js`(副作用 import)。
- 获取:`const gr = Bot.core.require("gameRegistry")`(取不到→null,调用方降级)。
- 底层即 `model/games.js`(纯配置查表、无副作用、无网络),把多游戏单一事实源对外标准化。
- 方法:
  | 方法 | 说明 / 示例 |
  |---|---|
  | `games()` | 全部游戏 key,如 `["gs","sr","zzz"]` |
  | `enabled()` | 已启用游戏 key |
  | `resolveGame(e)` | 由事件解析游戏(`#`=gs/`*`=sr/`%`=zzz) |
  | `gameKey(g)` | 归一化游戏 key |
  | `isGame(e, key)` | 事件是否属指定游戏 |
  | `biz(game, isOs=false)` | game_biz,如 `biz("sr")==="hkrpg_cn"` |
  | `region(uid, game)` | 由 uid 推断 region,如 `region("100098441","gs")==="cn_gf01"` |
  | `term(game, key)` | 术语,如 `term("sr","weapon")==="光锥"` |
  | `gachaPools(game)` / `ledgerFields(game)` | 抽卡卡池 / 札记字段 |
  | `uigfKey(game)` | 导出键,如 `uigfKey("sr")==="hkrpg"` |
  | `tplDir(game)` / `prefix(game)` | 模板子目录 / 命令前缀 |
- 性质:**非侵入新增**——`games.js` 现有 import/调用全部保留;消费方可逐步改用 `Bot.core.require("gameRegistry")` 替代散落的硬编码三元判断。

### `gacha`（GachaPort） — chapter2/P2（2026-05-31）
- 实现:`model/gachaPort.js`(工厂式包 `model/gachaLog.js` 的 `GachaLog` 与 `apps/payLog.js` 的 `payLog`),注册于 `index.js`。
- 获取:`const gacha = Bot.core.require("gacha")`。
- 方法:
  | 方法 | 说明 |
  |---|---|
  | `log(e)` | 构造抽卡记录处理器(等价 `new GachaLog(e)`),可 `.logUrl()/.updateLog()/.getLogData()` |
  | `importByUrl(e)` | 便捷:按 `e.msg` 中 url 导入(等价 `new GachaLog(e).logUrl()`) |
  | `payLog()` | 构造充值流水处理器(等价 `new payLog()`),设 `.e` 后 `.getAuthKey()/.payLog(e)` |
- 性质:工厂返回 genshin 现有类实例(同一类、构造无副作用),与旧 `file://` import 逐字等价;非侵入。
- 注:SR 抽卡 authkey 受平台限制(见 multi-game-refactor §4),与本能力无关。

## 插件清单（manifest） — chapter1-05（2026-05-31）
- 实现:`manifest.js`(副作用 import 自注册到 `Bot.core.require('pluginRegistry')`)。
- 声明:`provides=[account, gameRegistry]`、`requires=[]`、`type=data-provider`、`guoba=true`。
- 纯声明式元信息,框架据此做能力提供/消费查询、依赖体检;不触碰 loader/派发。
- 随迁移推进,`requires`/`hooks` 逐步填充(如接入 `renderer`/暴露 `gacha:afterFetch`)。

## 计划提供（后续）
- 懒激活(命令前缀命中才激活,改 loader,须 `0-00` 基线护栏)等,见主仓 `docs/refactor-progress.md` 路线。
