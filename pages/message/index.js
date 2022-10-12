// pages/message/index.js
import { Message } from "../../models/message"

Page({
  data: {
    messages: []
  },

  onLoad() {
    this.getMessages()
  },

  /**
   * 获取动态消息
   */
  async getMessages() {
    const data = await Message.getMessagList()
    this.setData({
      messages: data
    })
  },

  /**
   * 跳转话题详情页或我的关注页
   */
  onMessageTap(event) {
    const category = event.detail.category
    const topicId = event.detail.topicId

    if (category === "star" || category === "comment") {
      wx.navigateTo({
        url: "/pages/topic-detail/index?topicId=" + topicId
      })
    } else if (category === "follow") {
      wx.navigateTo({
        url: "/pages/follower/index?userId=" + app.globalData.userDetail.id + "&title=我的关注"
      })
    }
  },

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})
