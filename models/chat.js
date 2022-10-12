import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"

class Chat {
  /**
   * 获取聊天列表
   */
  static async getChatList(data) {
    const res = await wxutil.request.get(api.chatResAPI, data)
    if (res.code === 200) {
      return res.data
    }
    return []
  }

  /**
   * 上传图片
   */
  static async uploadImage(fileKey, filePath) {
    const res = await wxutil.file.upload({
      url: api.holeAPI + "images/",
      fileKey: fileKey,
      filePath: filePath
    })
    return JSON.parse(res.data)
  }
}

export {
  Chat
}
