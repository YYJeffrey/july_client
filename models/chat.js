import api from '../config/api'
import { Paging } from '../utils/paging'

class Chat {
  /**
   * 获取聊天分页器
   */
  static async getChatPaging(params) {
    return new Paging(api.chatResAPI, params)
  }
}

export {
  Chat
}
