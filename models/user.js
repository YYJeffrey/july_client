import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"

class User {
  /**
   * 用户授权
   */
  static async auth(data) {
    return await wxutil.request.post(api.userAPI, data)
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(userId) {
    const res = await wxutil.request.get(api.userAPI + userId + "/")
    if (res.code === 200) {
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

  /**
   * 上传封面
   */
  static async uploadPoster(fileKey, filePath) {
    const res = await wxutil.file.upload({
      url: api.userAPI + "poster/",
      fileKey: fileKey,
      filePath: filePath
    })
    return JSON.parse(res.data)
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(fileKey, filePath) {
    const res = await wxutil.file.upload({
      url: api.userAPI + "avatar/",
      fileKey: fileKey,
      filePath: filePath
    })
    return JSON.parse(res.data)
  }
}

export {
  User
}
