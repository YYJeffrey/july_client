// pages/topic/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 10 // 每页显示条数

Page({
  data: {
    labels: [],
    topics: [],
    page: 1,
    labelId: -1,
    height: 1206,
    show: false,
    loading: false
  },

  onLoad() {
    this.getScrollHeight()
    this.getLabels()
    this.getTopics()
  },

  /**
   * 获取话题窗口高度
   */
  getScrollHeight() {
    const that = this;
    wx.getSystemInfo({
      success: function(res) {
        const windowHeight = res.windowHeight;
        const windowWidth = res.windowWidth;
        const ratio = 750 / windowWidth;
        const height = windowHeight * ratio;
        that.setData({
          height: height - 90
        })
      }
    })
  },

  /**
   * 获取标签
   */
  getLabels() {
    const that = this
    const url = api.labelAPI
    const data = {
      app_id: app.globalData.appId
    }

    wxutil.request.get(url, data).then((res) => {
      this.setData({
        labels: res.data.data
      })
    })
  },

  /**
   * 获取话题
   */
  getTopics(page = 1, labelId = -1, size = pageSize) {
    const url = api.topicAPI
    let data = {
      app_id: app.globalData.appId,
      size: size,
      page: page
    }
    if (labelId != -1) {
      data["label_id"] = labelId
    }

    wx.showNavigationBarLoading()
    wxutil.request.get(url, data).then((res) => {
      const topics = res.data.data
      this.setData({
        page: (topics.length == 0 && page != 1) ? page - 1 : page,
        loading: false,
        topics: page == 1 ? topics : this.data.topics.concat(topics)
      })
      wx.hideNavigationBarLoading()
    })
  },

  /**
   * 图片浏览
   */
  previewImage(event) {
    const index = event.currentTarget.dataset.index
    const current = event.currentTarget.dataset.src
    const urls = this.data.topics[index].images

    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  /**
   * 触顶刷新
   */
  scrollToUpper() {
    const labelId = this.data.labelId

    if (labelId == -1) {
      this.getTopics()
    } else {
      this.getTopics(1, labelId)
    }
  },

  /**
   * 触底加载
   */
  scrollToLower() {
    const labelId = this.data.labelId
    const page = this.data.page

    this.setData({
      loading: true
    })
    if (labelId == -1) {
      this.getTopics(page + 1)
    } else {
      this.getTopics(page + 1, labelId)
    }
  },

  /**
   * 标签切换
   */
  clickTag(event) {
    const labelId = this.data.labelId
    const currLabelId = event.currentTarget.dataset.label

    if (labelId == currLabelId) {
      this.getTopics(1, -1)
      this.setData({
        labelId: -1
      })
    } else {
      this.getTopics(1, currLabelId)
      this.setData({
        labelId: currLabelId
      })
    }
  },

  /**
   * 弹窗显影
   */
  switchPopup() {
    this.setData({
      show: !this.data.show
    })
  },

  onShow() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  onShareAppMessage() {

  }
})