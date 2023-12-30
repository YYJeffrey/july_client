import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'

class OSS {
  /**
   * 获取七牛云配置
   */
  static async getQiniu() {
    const res = await wxutil.request.get(`${api.ossAPI}/token`)
    if (res.code === 0) {
      return res.data
    }
    return null
  }
}

export {
  OSS
}
