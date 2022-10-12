import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"

class Template {
  /**
   * 获取模板ID
   */
  static async getTemplateId(title) {
    const res = await wxutil.request.get(api.templateAPI, { title: title })
    if (res.code === 200) {
      return res.data
    }
    return null
  }
}

export {
  Template
}
