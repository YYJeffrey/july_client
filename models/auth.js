import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'

class Auth {
  /**
   * 被动授权
   */
  static async passive(code) {
    return await wxutil.request.post(`${api.authAPI}/passive`, { code: code })
  }

  /**
   * 主动授权
   */
  static async initiative(data) {
    return await wxutil.request.post(`${api.authAPI}/initiative`, data)
  }
}

export {
  Auth
}
