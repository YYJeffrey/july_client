import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'

class Video {
  /**
   * 上传视频
   */
  static async uploadVideo(data) {
    return await wxutil.request.post(api.videoAPI, data)
  }
}

export {
  Video
}
