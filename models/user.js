import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'

class User {
  /**
   * 获取用户信息
   */
  static async getUserInfo(userId) {
    const res = await wxutil.request.get(`${api.userAPI}/${userId}`)
    if (res.code === 0) {
      return res.data
    }
    return null
  }

  /**
   * 更新用户信息
   */
  static async updateUser(data) {
    return await wxutil.request.put(api.userAPI, data)
  }
}

export {
  User
}
