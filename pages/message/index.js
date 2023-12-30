// pages/message/index.js
import { Message } from '../../models/message'
const app = getApp()

Page({
  data: {
    messages: []
  },

  onLoad() {
    this.getMessages()
    this.readMessages()
  },

  /**
   * 获取动态消息
   */
  async getMessages() {
    const data = await Message.getMessages()
    this.setData({
      messages: data
    })
  },

  /**
   * 已读动态消息
   */
  async readMessages() {
    await Message.readMessages()
  },

  /**
   * 跳转话题详情页或我的关注页
   */
  onMessageTap(event) {
    const category = event.detail.category
    const topicId = event.detail.topicId

    if (category === 'STAR' || category === 'COMMENT') {
      wx.navigateTo({
        url: `/pages/topic-detail/index?topicId=${topicId}`
      })
    } else if (category === 'FOLLOWING') {
      wx.navigateTo({
        url: `/pages/follower/index?userId=${app.globalData.userDetail.id}&title=关注我的`
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '主页',
      path: '/pages/topic/index'
    }
  }
})
