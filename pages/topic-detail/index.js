// pages/topic-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    topic: {},
    actionList: [{
        name: "分享",
        color: "#666",
        openType: "share"
      },
      {
        name: "举报",
        color: "#666"
      }
    ],
    showAction: false // 操作菜单
  },

  onLoad(options) {
    const topicId = options.topicId
    this.getTopicDetail(topicId)
  },

  /**
   * 获取动态详情
   */
  getTopicDetail(topicId) {
    const url = api.topicAPI + topicId + "/"
    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          topic: res.data.data
        })
      }
    })
  },

  /**
   * 图片浏览
   */
  previewImage(event) {
    const current = event.currentTarget.dataset.src
    const urls = this.data.topic.images

    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  /**
   * 点击更多
   */
  clickMore() {
    this.setData({
      showAction: true
    })
  },

  /**
   * 关闭操作菜单
   */
  lincancel(e) {
    this.setData({
      showAction: false
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.topic.content,
      imageUrl: this.data.topic.images ? this.data.topic.images[0] : '',
      path: "/pages/topic-detail/index?topicId=" + this.data.topic.id
    }
  }
})