import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'
import { Paging } from '../utils/paging'

class Following {
  /**
   * 获取关注分页器
   */
  static async getFollowingPaging(params) {
    return new Paging(api.followingAPI, params)
  }

  /**
   * 关注或取关
   */
  static async followOrCancel(userId) {
    return await wxutil.request.post(api.followingAPI, { 'follow_user_id': userId })
  }
}

export {
  Following
}
