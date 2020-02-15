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
    }, {
      name: "举报",
      color: "#666"
    }],
    page: 1,
    labelId: -1,
    shareIndex: 0, // 分享话题的下标
    height: 1206, // 话题区高度
    showPopup: false, // 下拉区
    showAction: false, // 操作菜单
    isEnd: false, // 是否到底
    loading: false
  },

  onLoad() {
    this.getScrollHeight()
    this.getLabels()
  },

  onShow() {
    const labelId = wxutil.getStorage("labelId")
    if (labelId) {
      // 因wx.switchTab()无法传递参数，故使用缓存获取参数
      this.getTopics(1, labelId)
      this.setData({
        labelId: labelId
      })
      wx.removeStorageSync("labelId")
    } else {
      this.setData({
        labelId: -1
      })
      this.getTopics()
    }
  },

  /**
   * 获取窗口高度
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
    const url = api.labelAPI
    const data = {
      app_id: app.globalData.appId
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          labels: res.data.data
        })
      }
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
      if (res.data.code == 200) {
        const topics = res.data.data
        this.setData({
          page: (topics.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: ((topics.length < pageSize) || (topics.length == 0 && page != 1)) ? true : false,
          topics: page == 1 ? topics : this.data.topics.concat(topics)
        })
      }
    })
  },

  /**
   * 图片预览
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
    // 振动交互
    wx.vibrateShort()
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
  onTagTap(event) {
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
  onFlodTap(event) {
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
  onMoreTap(event) {
    const shareIndex = event.currentTarget.dataset.index
    this.setData({
      showAction: true,
      shareIndex: shareIndex
    })
  },

  /**
   * 关闭操作菜单
   */
  onCancelSheetTap(e) {
    this.setData({
      showAction: false
    })
  },

  /**
   * 下拉层显示或影藏
   */
  togglePopup() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },

  /**
   * 跳转话题详情页
   */
  gotoDetail(event) {
    const topicId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/topic-detail/index?topicId=" + topicId
    })
  },

  /**
   * 点击编辑
   */
  onEditTap() {
    const userDetail = wxutil.getStorage("userDetail")
    if (userDetail) {
      wx.navigateTo({
        url: "/pages/topic-edit/index"
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },

  onShareAppMessage(res) {
    if (res.from == "button") {
      const shareIndex = this.data.shareIndex
      const topics = this.data.topics
      return {
        title: topics[shareIndex].content,
        imageUrl: topics[shareIndex].images ? topics[shareIndex].images[0] : '',
        path: "/pages/topic-detail/index?topicId=" + topics[shareIndex].id
      }
    }
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})