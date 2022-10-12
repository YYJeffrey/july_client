import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"

class Message {
  /**
   * 获取消息概要
   */
  static async getMessageBrief() {
    const res = await wxutil.request.get(api.messageAPI + "brief/")
    if (res.code === 200) {
      return res.data
    }
    return null
  }

  /**
   * 获取消息列表
   */
  static async getMessagList() {
    const res = await wxutil.request.get(api.messageAPI)
    if (res.code === 200) {
      return res.data
    }
    return null
  }
}

export {
  Message
}
