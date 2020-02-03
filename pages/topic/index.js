// pages/topic/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    labels: [],
    topics: [],
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
    page: 1,
    labelId: -1,
    height: 1206, // 话题区高度
    showPopup: false, // 下拉区
    showAction: false, // 操作菜单
    loading: false,
    isEnd: false // 是否到底
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

    if (this.data.isEnd && page != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const topics = res.data.data
        this.setData({
          page: (topics.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: (topics.length == 0 && page != 1) ? true : false,
          topics: page == 1 ? topics : this.data.topics.concat(topics)
        })
      }
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
   * 点击显示或隐藏全文
   */
  clickFlod(event) {
    const index = event.target.dataset.index
    let topics = this.data.topics

    if (topics[index].flod) {
      topics[index].flod = false
    } else {
      topics[index].flod = true
    }
    this.setData({
      topics: topics
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

  /**
   * 下拉切换
   */
  togglePopup() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },

  onShareAppMessage() {
    return {
      title: "七月",
      path: "/pages/topic/index"
    }
  }
})