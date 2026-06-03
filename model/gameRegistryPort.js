/**
 * `gameRegistry` 能力实现 —— 把多游戏 SSOT（model/games.js）暴露成一组干净的契约方法名
 * (gameKey/biz/region/term/gachaPools…)。纯配置查表、无副作用。games.js 现有调用全部保留。
 */
import * as Games from "./games.js"

const gameRegistryPort = {
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

try {
  globalThis.Bot?.core?.provide?.("gameRegistry", gameRegistryPort)
} catch (err) {
  logger?.warn?.(`[contracts] 注册 gameRegistry 失败:${err?.message}`)
}

export default gameRegistryPort
