/**
 * Games 注册中心（多游戏配置驱动 · 单一真相源 SSOT）
 *
 * 目标：把散落在各业务模块里的 `e.isSr ? a : b` 二元分支、硬编码 game_biz/region/
 * 卡池/货币字段/术语/模板目录，统一收敛到这里。后续各功能改为"按 e.game 查表"，
 * 加新游戏 ≈ 在 GAMES 增加一条配置（+ 数据/模板），业务层近乎零改动。
 *
 * 说明：
 *  - region/getServer 逻辑与 model/mys/mysApi.js 保持一致（该文件为历史 canonical，
 *    本表为后续统一入口；迁移完成后 mysApi/xiaoyao 等应改为引用本表，消除重复实现）。
 *  - 绝区零(zzz) 当前 enabled=false（先不开放功能，仅保留扩展位）。
 *
 * 触发契约：# = 原神(gs)，* / 星铁 = 崩铁(sr)，% / 绝区零 = zzz
 */

/** 各游戏 region 列表（索引固定）：0官服 1渠道/B服 2美 3欧 4亚 5港澳台 */
const GAME_REGION = {
  gs: ["cn_gf01", "cn_qd01", "os_usa", "os_euro", "os_asia", "os_cht"],
  sr: [
    "prod_gf_cn",
    "prod_qd_cn",
    "prod_official_usa",
    "prod_official_euro",
    "prod_official_asia",
    "prod_official_cht",
  ],
  zzz: ["prod_gf_cn", "prod_gf_cn", "prod_gf_us", "prod_gf_eu", "prod_gf_jp", "prod_gf_sg"],
}

/**
 * 由 uid 推断 region（逻辑与 mysApi.getServer 一致）
 * @param {string|number} uid
 * @param {"gs"|"sr"|"zzz"} game
 */
export function getRegion(uid, game = "gs") {
  game = getGameKey(game)
  const region = GAME_REGION[game] || GAME_REGION.gs
  const _uid = String(uid)

  if (game === "zzz") {
    if (_uid.length < 10) return region[0] // 官服
    switch (_uid.slice(0, -8)) {
      case "10":
        return region[2] // 美服
      case "15":
        return region[3] // 欧服
      case "13":
        return region[4] // 亚服
      case "17":
        return region[5] // 港澳台服
    }
  } else {
    switch (_uid.slice(0, -8)) {
      case "5":
        return region[1] // 渠道/B服
      case "6":
        return region[2] // 美服
      case "7":
        return region[3] // 欧服
      case "8":
      case "18":
        return region[4] // 亚服
      case "9":
        return region[5] // 港澳台服
    }
  }
  return region[0] // 官服
}

/**
 * 游戏配置表
 * 字段：
 *  - key/name/prefix：标识与触发前缀
 *  - biz：米游社 game_biz（cn 国服 / os 国际服）
 *  - terms：术语映射（武器/光锥/音擎 等），消除业务层硬编码
 *  - tplDir：渲染模板子目录（genshin 插件 resources 下）
 *  - gachaPools：抽卡卡池（type 与 typeName），与 gachaLog 一致
 *  - ledger：札记/月历货币字段名 + 展示名
 *  - enabled：是否启用该游戏功能（zzz 先关闭，仅占位）
 */
export const GAMES = {
  gs: {
    key: "gs",
    name: "原神",
    prefix: "#",
    biz: { cn: "hk4e_cn", os: "hk4e_global" },
    uigfKey: "hk4e", // UIGF/SRGF 导入导出的游戏键
    terms: { weapon: "武器", relic: "圣遗物", talent: "天赋", currency: "原石" },
    tplDir: "",
    gachaPools: [
      { type: 301, typeName: "角色" },
      { type: 302, typeName: "武器" },
      { type: 500, typeName: "集录" },
      { type: 200, typeName: "常驻" },
    ],
    ledger: { jadeField: "current_primogems", coinField: "current_mora", label: "原石" },
    enabled: true,
  },
  sr: {
    key: "sr",
    name: "星穹铁道",
    prefix: "*",
    biz: { cn: "hkrpg_cn", os: "hkrpg_global" },
    uigfKey: "hkrpg",
    terms: { weapon: "光锥", relic: "遗器", talent: "行迹", currency: "星琼" },
    tplDir: "StarRail/",
    gachaPools: [
      { type: 11, typeName: "角色" },
      { type: 12, typeName: "光锥" },
      { type: 21, typeName: "角色联动" },
      { type: 22, typeName: "光锥联动" },
      { type: 1, typeName: "常驻" },
      { type: 2, typeName: "新手" },
    ],
    ledger: { jadeField: "current_hcoin", coinField: "current_rails_pass", label: "星琼" },
    enabled: true,
  },
  zzz: {
    key: "zzz",
    name: "绝区零",
    prefix: "%",
    biz: { cn: "nap_cn", os: "nap_global" },
    uigfKey: "nap",
    terms: { weapon: "音擎", relic: "驱动盘", talent: "技能", currency: "菲林" },
    tplDir: "ZZZero/",
    // 以下为占位，待 P4 阶段补全真实卡池/字段
    gachaPools: [],
    ledger: { jadeField: "", coinField: "", label: "菲林" },
    enabled: false,
  },
}

/** 游戏 key 列表（含未启用，用于遍历/校验） */
export const GAME_KEYS = Object.keys(GAMES)

/** 已启用的游戏 key 列表 */
export const ENABLED_GAMES = GAME_KEYS.filter(k => GAMES[k].enabled)

/**
 * 标准化 game key：接受 string 或事件对象 e（读 e.game），归一到 gs/sr/zzz
 * @param {string|object} game
 * @returns {"gs"|"sr"|"zzz"}
 */
export function getGameKey(game) {
  if (game && typeof game === "object") game = game.game
  switch (game) {
    case "sr":
    case "star":
      return "sr"
    case "zzz":
    case "nap":
      return "zzz"
    default:
      return "gs"
  }
}

/**
 * 从事件解析当前游戏 key（统一入口，替代各处 `e.isSr ? 'sr' : 'gs'` / `/星铁/.test`）
 * @param {object} e 事件对象
 */
export function getGame(e) {
  return getGameKey(e?.game)
}

/** 取游戏配置对象 */
export function game(key) {
  return GAMES[getGameKey(key)]
}

/** 判断事件是否为指定游戏 */
export function isGame(e, key) {
  return getGame(e) === getGameKey(key)
}

/** 取 game_biz（isOs 国际服） */
export function getBiz(gameKey, isOs = false) {
  const g = game(gameKey)
  return isOs ? g.biz.os : g.biz.cn
}

/** game_biz（hk4e_cn/hkrpg_global/nap_cn 等）反查游戏 key；未知→gs */
export function gameKeyByBiz(gameBiz) {
  for (const k of GAME_KEYS) {
    const b = GAMES[k]?.biz
    if (b && (b.cn === gameBiz || b.os === gameBiz)) return k
  }
  return "gs"
}

/** 取 UIGF/SRGF 导入导出的游戏键（hk4e/hkrpg/nap） */
export function uigfKey(gameKey) {
  return game(gameKey).uigfKey
}

/** 取术语，如 term('sr','weapon') => '光锥' */
export function term(gameKey, key) {
  return game(gameKey).terms?.[key] ?? ""
}

/** 取抽卡卡池 */
export function gachaPools(gameKey) {
  return game(gameKey).gachaPools || []
}

/** 取札记货币字段 */
export function ledgerFields(gameKey) {
  return game(gameKey).ledger || {}
}

/** 取模板子目录（如 'StarRail/'） */
export function tplDir(gameKey) {
  return game(gameKey).tplDir || ""
}

export default {
  GAMES,
  GAME_KEYS,
  ENABLED_GAMES,
  GAME_REGION,
  getGame,
  getGameKey,
  game,
  isGame,
  getRegion,
  getBiz,
  gameKeyByBiz,
  uigfKey,
  term,
  gachaPools,
  ledgerFields,
  tplDir,
}
