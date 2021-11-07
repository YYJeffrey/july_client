// pages/message/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

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
  getMessages() {
    const url = api.messageAPI

    wxutil.request.get(url).then((res) => {
      if (res.code == 200) {
        this.setData({
          messages: res.data
        })
      }
    })
  },

  /**
   * 跳转话题详情页
   */
  gotoTopicDetail(event) {
    const topicId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/topic-detail/index?topicId=" + topicId
    })
  },

  /**
   * 跳转到关注我的页面
   */
  gotoFollower() {
    wx.navigateTo({
      url: "/pages/follower/index?userId=" + app.globalData.userDetail.id
    })
  },

  /**
   * 跳转到用户名片页
   */
  gotoVisitingCard(event) {
    console.log(event)
    if (app.globalData.userDetail) {
      const userId = event.target.dataset.userId
      wx.navigateTo({
        url: "/pages/visiting-card/index?userId=" + userId
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },

  onShareAppMessage() {
    return {
      title: "动态消息",
      path: "/pages/message/index"
    }
  }
})