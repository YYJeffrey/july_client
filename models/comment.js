import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Comment {
  /**
   * 获取用户评论分页器
   */
  static async getCommentUserPaging(userId) {
    return new Paging(api.commentAPI + "user/" + userId + "/")
  }

  /**
   * 获取话题评论分页器
   */
  static async getCommentTopicPaging(topicId) {
    return new Paging(api.commentAPI + "topic/" + topicId + "/")
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
    return await wxutil.request.delete(api.commentAPI + commentId + "/")
  }
}

export {
  Comment
}
