/**
 * genshin 插件清单（chapter1-05 · 声明式元信息）
 *
 * 向 L1 契约层的 pluginRegistry 声明本插件的能力关系（provides/requires/hooks）。
 * 纯声明、不触碰 loader：框架据此做能力提供/消费查询、依赖体检、后续懒激活/Guoba 发现。
 * 与 model/*Port.js 一致采用"副作用 import 自注册 + 默认导出 manifest 对象"。
 */
export const manifest = {
  name: "genshin",
  version: "3.x",
  type: "data-provider",
  // 已对外提供（见 model/*Port.js / CONTRACTS.md）
  provides: ["account", "gameRegistry", "gacha"],
  // 依赖能力（缺失→降级；随迁移逐步接入 core.require，当前仍走插件内部实现）
  requires: [],
  // 后续暴露的 hook 点（如 gacha:afterFetch），待实现后填充
  hooks: [],
  guoba: true,
}

try {
  const reg = globalThis.Bot?.core?.require?.("pluginRegistry")
  if (reg) {
    reg.register(manifest)
    logger?.mark?.("[contracts] genshin 声明 manifest：provides=[account, gameRegistry, gacha]")
  }
} catch (err) {
  logger?.warn?.(`[contracts] 注册 genshin manifest 失败：${err?.message}`)
}

export default manifest
