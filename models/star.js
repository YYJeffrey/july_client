import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'
import { Paging } from '../utils/paging'

const defaultPage = 1
const defaultSize = 16

class Star {
  /**
   * 获取收藏分页器
   */
  static async getStarPaging(params, page = defaultPage, size = defaultSize) {
    return new Paging(api.starAPI, params, page, size)
  }

  /**
   * 收藏或取消收藏
   */
  static async starOrCancel(topicId) {
    return await wxutil.request.post(api.starAPI, { topic_id: topicId })
  }
}

export {
  Star
}
