import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"

class Label {
  /**
   * 获取标签列表
   */
  static async getLabelList(appId) {
    const res = await wxutil.request.get(api.labelAPI, { app_id: appId })
    if (res.code === 200) {
      return res.data
    }
    return null
  }
}

export {
  Label
}
