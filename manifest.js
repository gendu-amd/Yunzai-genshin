/**
 * genshin 插件清单（ADR-007 统一装配：manifest = 单一声明源，框架自动接线）
 *
 * provides 用 {能力名: () => import(实现)} 声明,框架(loader.wireManifests)自动 core.provide,
 * 无需各 *Port.js 再手写 Bot.core.provide 样板。importer 闭包在本文件作用域,相对路径相对本文件解析。
 */
export const manifest = {
  name: "genshin",
  version: "3.x",
  type: "data-provider",
  provides: {
    account: () => import("./model/accountPort.js"),
    gameRegistry: () => import("./model/gameRegistryPort.js"),
    gacha: () => import("./model/gachaPort.js"),
  },
  // 依赖能力(缺失→降级;随迁移逐步接入 core.require)
  requires: [],
  // 后续暴露的 hook 点,待实现后填充
  hooks: [],
  // ADR-007 贡献点：本插件支持的游戏命令前缀,框架 wireManifests 自动注册到 gamePrefix。
  // test 为正则字符串(框架 new RegExp),与框架旧 srReg/zzzReg 逐字一致、顺序 sr→zzz。
  contributes: {
    gamePrefix: [
      { game: "sr", test: "^#?(\\*|星铁|星轨|穹轨|星穹|崩铁|星穹铁道|崩坏星穹铁道|铁道)+", cmd: "#星铁" },
      { game: "zzz", test: "^#?(%|％|绝区零|绝区)+", cmd: "#绝区零" },
    ],
  },
  guoba: true,
}

export default manifest
