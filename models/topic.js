import api from "../config/api"
import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Paging } from "../utils/paging"

class Topic {
  /**
   * 获取话题分页器
   */
  static async getTopicPaging(params) {
    return new Paging(api.topicAPI, params)
  }

  /**
   * 获取用户话题分页器
   */
  static async getTopicUserPaging(userId) {
    return new Paging(api.topicAPI + "user/" + userId + "/")
  }

  /**
   * 获取话题详情
   */
  static async getTopicDetail(topicId) {
    const res = await wxutil.request.get(api.topicAPI + topicId + "/")
    if (res.code === 200) {
      return res.data
    }
    return null
  }

  /**
   * 上传话题
   */
  static async sendTopic(data) {
    return await wxutil.request.post(api.topicAPI, data)
  }


  /**
   * 删除话题
   */
  static async deleteTopic(topicId) {
    return await wxutil.request.delete(api.topicAPI + topicId + "/")
  }

  /**
   * 举报话题
   */
  static async reportTopic(topicId) {
    return await wxutil.request.post(api.topicAPI + "report/", { topic_id: topicId })
  }
}

export {
  Topic
}
