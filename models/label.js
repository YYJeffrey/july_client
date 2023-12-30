import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'

class Label {
  /**
   * 获取标签列表
   */
  static async getLabelList(params) {
    const res = await wxutil.request.get(api.labelAPI, params)
    if (res.code === 0) {
      return res.data
    }
    return []
  }
}

export {
  Label
}
