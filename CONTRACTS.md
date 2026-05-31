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
- 性质:**非侵入新增**——仅在现有 `MysInfo`/`MysApi` 之上包一层 `core` 通道;旧的直接 import / `file://` 调用全部保留照常工作。消费方可逐步改用 `Bot.core.require("account")`。

## 计划提供（后续）
- `gameRegistry`（多游戏 SSOT,基于 `model/games.js`）
- 见主仓 `docs/refactor-progress.md` 路线。
