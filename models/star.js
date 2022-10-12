import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Star {
  /**
   * 获取用户收藏分页器
   */
  static async getStarUserPaging(userId) {
    return new Paging(api.starAPI + "user/" + userId + "/")
  }

  /**
   * 获取话题收藏列表
   */
  static async getStarList(topicId) {
    const res = wxutil.request.get(api.starAPI + "topic/" + topicId + "/")
    if (res.code === 200) {
      return res.data
    }
    return null
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
