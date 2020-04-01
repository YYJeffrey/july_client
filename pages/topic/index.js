// pages/topic/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    labels: [],
    topics: [],
    actionList: [],
    page: 1,
    labelId: -1,
    userId: -1,
    topicIndex: -1, // 点击的话题的下标
    height: 1206, // 话题区高度
    showPopup: false, // 是否显示下拉区
    showAction: false, // 是否显示操作菜单
    isEnd: false, // 是否到底
    loading: false
  },

  onLoad() {
    this.getScrollHeight()
    this.getLabels()
    this.getUserId()
    this.getTopics()
  },

  onShow() {
    const labelId = wxutil.getStorage("labelId")
    // 由于wx.switchTab()的传参限制，故用缓存获取标签参数

    if (!wxutil.getStorage("refreshTopics")) {
      if (labelId) {
        wx.removeStorageSync("labelId")
        this.setData({
          labelId: labelId
        })
        this.getTopics(1, labelId)
      }
    } else {
      wx.removeStorageSync("refreshTopics")
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
      success: function (res) {
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
        let labels = [{
          id: -1,
          name: "全部"
        }]
        this.setData({
          labels: labels.concat(res.data.data)
        })
      }
    })
  },

  /**
   * 获取用户ID
   */
  getUserId() {
    if (app.globalData.userDetail) {
      this.setData({
        userId: app.globalData.userDetail.id
      })
    }
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
   * 展开操作菜单
   */
  onMoreTap(event) {
    const topicIndex = event.currentTarget.dataset.index
    let actionList = [{
      name: "分享",
      color: "#666",
      openType: "share"
    }, {
      name: "举报",
      color: "#666"
    }]

    if (this.data.userId == this.data.topics[topicIndex].user.id) {
      actionList.push({
        name: "删除",
        color: "#d81e05"
      })
    }

    this.setData({
      actionList: actionList,
      showAction: true,
      topicIndex: topicIndex
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
   * 点击操作菜单按钮
   */
  onActionItemtap(event) {
    const index = event.detail.index

    if (index == 1) {
      // 举报话题
      this.reportTopic()
    }
    if (index == 2) {
      // 删除话题
      this.deleteTopic()
    }
  },

  /**
   * 删除话题
   */
  deleteTopic() {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要删除该条话题？",
      success: (res) => {
        if (res.confirm) {
          const topicId = this.data.topics[this.data.topicIndex].id
          const url = api.topicAPI + topicId + "/"

          wxutil.request.delete(url).then((res) => {
            if (res.data.code == 200) {
              this.getTopics(this.data.page, this.data.labelId)

              wx.lin.showMessage({
                type: "success",
                content: "删除成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "删除失败！"
              })
            }
          })
        }
      }
    })
  },

  /**
   * 举报话题
   */
  reportTopic() {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要举报该条话题？",
      success: (res) => {
        if (res.confirm) {
          const topicId = this.data.topics[this.data.topicIndex].id
          const url = api.topicAPI + "report/"
          const data = {
            topic_id: topicId
          }

          wxutil.request.post(url, data).then((res) => {
            if (res.data.code == 200) {
              wx.lin.showMessage({
                type: "success",
                content: "举报成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "举报失败！"
              })
            }
          })
        }
      }
    })
  },

  /**
   * 展开或收起弹出层
   */
  togglePopup() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },

  /**
   * 点击编辑
   */
  onEditTap() {
    if (app.globalData.userDetail) {
      wx.navigateTo({
        url: "/pages/topic-edit/index"
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },

  /**
   * 点赞或取消点赞
   */
  onStarTap(event) {
    const index = event.currentTarget.dataset.index
    let topics = this.data.topics

    const url = api.starAPI
    const data = {
      topic_id: topics[index].id
    }

    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        const hasStar = topics[index].has_star
        topics[index].has_star = !topics[index].has_star

        if (hasStar) {
          topics[index].star_count--
        } else {
          topics[index].star_count++
        }

        this.setData({
          topics: topics
        })
      }
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
   * 点击评论跳转话题详情页
   */
  onCommentTap(event) {
    const topicId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/topic-detail/index?focus=true&topicId=" + topicId
    })
  },

  /**
   * 跳转到用户名片页
   */
  gotoVisitingCard(event) {
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

  onShareAppMessage(res) {
    if (res.from == "button") {
      const topicIndex = this.data.topicIndex
      const topics = this.data.topics
      return {
        title: topics[topicIndex].content,
        imageUrl: topics[topicIndex].images ? topics[topicIndex].images[0] : '',
        path: "/pages/topic-detail/index?topicId=" + topics[topicIndex].id
      }
    }
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})