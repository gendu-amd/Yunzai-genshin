import base from "./base.js"
import MysInfo from "./mys/mysInfo.js"

export default class Deck extends base {
  constructor(e) {
    super(e)
    this.model = "deck"
  }

  async getIndex(id, list = false) {
    let res = await MysInfo.get(this.e, "deckList")
    if (res?.retcode !== 0) return false

    let Data
    if (!list) {
      for (let i of res.data.deck_list) {
        if (i.id == id) Data = i
      }
      if (!Data) {
        this.e.reply(`无牌组${id}，请查看#七圣卡组列表`)
        return false
      }
    } else {
      this.model = "deckList"
      Data = res.data.deck_list
    }

    /** 截图数据 */
    let data = {
      quality: 80,
      ...this.screenData,
      uid: this.e.uid,
      saveId: this.e.uid,
      nickname: res.data.nickname,
      level: res.data.level,
      Data,
    }
    return data
  }
  async getcard(id) {
    let res = {}
    for (let api of ["basicInfo", "avatar_cardList", "action_cardList"]) {
      if ((id == 2 && api == "avatar_cardList") || (id == 1 && api == "action_cardList")) continue
      let ret = await MysInfo.get(this.e, api)
      if (!ret) return false // 接口失败(MysInfo.get 已回复错误),避免 false.data 崩溃
      res[api] = ret.data
    }
    this.model = "deckCard"

    let data = {
      quality: 80,
      ...this.screenData,
      uid: this.e.uid,
      saveId: this.e.uid,
      ...res,
    }
    return data
  }
}
