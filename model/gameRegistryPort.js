/**
 * GameRegistry 实现（chapter1-02b）
 *
 * 把 genshin 的多游戏 SSOT（model/games.js）包装成 L1 契约层的 `gameRegistry` 能力，
 * 注册到 `Bot.core.provide('gameRegistry', …)`。纯配置查表、无副作用。
 *
 * 非侵入：仅"新增" core 通道；games.js 现有 import/调用全部保留。
 */
import * as Games from "./games.js"

const gameRegistryPort = {
  meta: { provider: "genshin", since: "3.1.3" },

  /** 全部游戏 key（含未启用） */
  games: () => Games.GAME_KEYS,
  /** 已启用游戏 key */
  enabled: () => Games.ENABLED_GAMES,
  /** 从事件解析游戏（#=gs / *=sr / %=zzz） */
  resolveGame: e => Games.getGame(e),
  /** 归一化游戏 key */
  gameKey: g => Games.getGameKey(g),
  /** 事件是否属指定游戏 */
  isGame: (e, key) => Games.isGame(e, key),
  /** game_biz（isOs 国际服） */
  biz: (game, isOs = false) => Games.getBiz(game, isOs),
  /** 由 uid 推断 region */
  region: (uid, game) => Games.getRegion(uid, game),
  /** 术语，如 term('sr','weapon')==='光锥' */
  term: (game, key) => Games.term(game, key),
  /** 抽卡卡池 */
  gachaPools: game => Games.gachaPools(game),
  /** 札记货币字段 */
  ledgerFields: game => Games.ledgerFields(game),
  /** UIGF/SRGF 导出键（hk4e/hkrpg/nap） */
  uigfKey: game => Games.uigfKey(game),
  /** 模板子目录 */
  tplDir: game => Games.tplDir(game),
  /** 命令前缀（若配置中有） */
  prefix: game => Games.GAMES?.[Games.getGameKey(game)]?.prefix,
}

// ADR-007：注册由框架据 manifest.provides 自动完成,此处只导出实现。
export default gameRegistryPort
