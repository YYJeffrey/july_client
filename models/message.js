import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'

class Message {
  /**
   * 获取消息
   */
  static async getMessages() {
    const res = await wxutil.request.get(api.messageAPI)
    if (res.code === 0) {
      return res.data
    }
    return null
  }

  /**
   * 已读消息
   */
  static async readMessages() {
    return await wxutil.request.post(`${api.messageAPI}/read`)
  }
}

export {
  Message
}
