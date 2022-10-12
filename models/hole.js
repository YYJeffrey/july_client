import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Hole {
  /**
   * 获取树洞分页器
   */
  static async getHolePaging(appId) {
    return new Paging(api.holeAPI, { app_id: appId })
  }

  /**
   * 获取树洞详情
   */
  static async getHoleDetail(holeId) {
    const res = await wxutil.request.get(api.holeAPI + holeId + "/")
    if (res.code === 200) {
      return res.data
    }
    return null
  }

  /**
   * 预约树洞
   */
  static async orderHole(holeId) {
    return await wxutil.request.post(api.holeAPI + "order/", { hole_id: holeId })
  }
}

export {
  Hole
}
