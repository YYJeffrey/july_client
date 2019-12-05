// pages/topic/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    labels: [],
    topic: [],
    height: 1206,
    show: false,
    loading: false
  },

  onLoad() {
    this.getScrollHeight()
    this.getLabels()
    this.getTopics()
  },

  getLabels() {
    const that = this
    const url = api.labelAPI
    const data = {
      app_id: app.globalData.app_id
    }
    wxutil.request.get(url, data).then((res) => {
      this.setData({
        labels: res.data.data
      })
    })
  },

  getTopics(size = 10, page = 1) {
    const that = this
    const url = api.topicAPI
    const data = {
      app_id: app.globalData.app_id,
      size: size,
      page: page,
    }
    wx.showNavigationBarLoading()
    wxutil.request.get(url, data).then((res) => {
      this.setData({
        topics: res.data.data
      })
      wx.hideNavigationBarLoading()
    })
  },

  previewImage(event) {
    const index = event.currentTarget.dataset.index
    const current = event.currentTarget.dataset.src
    const urls = this.data.topics[index].images
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  scrollToUpper(event) {
    this.getTopics()
  },

  scrollToLower(event) {
    this.setData({
      loading: true
    })
  },

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

  onShow() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  onShareAppMessage() {

  },

  showPopup() {
    this.setData({
      show: !this.data.show
    })
  }
})