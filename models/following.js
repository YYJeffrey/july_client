import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Following {
  /**
   * 获取关注Ta的用户分页器
   */
  static async getFollowerPaging(followUserId) {
    return new Paging(api.followingAPI + "follow_user/" + followUserId + "/")
  }

  /**
   * 获取Ta关注的用户分页器
   */
  static async getFollowingPaging(userId) {
    return new Paging(api.followingAPI + "user/" + userId + "/")
  }

  /**
   * 关注或取关
   */
  static async followOrCancel(userId) {
    return await wxutil.request.post(api.followingAPI, { "follow_user_id": userId })
  }
}

export {
  Following
}
