import api from '../config/api'
import wxutil from '../miniprogram_npm/@yyjeffrey/wxutil/index'
import { Paging } from '../utils/paging'

class Comment {
  /**
   * 获取话题评论分页器
   */
  static async getCommentPaging(params) {
    return new Paging(api.commentAPI, params)
  }

  /**
   * 发送评论
   */
  static async sendComment(data) {
    return await wxutil.request.post(api.commentAPI, data)
  }

  /**
   * 删除评论
   */
  static async deleteComment(commentId) {
    return await wxutil.request.delete(`${api.commentAPI}/${commentId}`)
  }
}

export {
  Comment
}
