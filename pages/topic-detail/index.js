// pages/topic-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    topic: {},
    comments: [],
    stars: [],
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
    loading: false,
    showAction: false, // 操作菜单
    isEnd: false // 是否到底
  },

  onLoad(options) {
    const topicId = options.topicId
    this.getTopicDetail(topicId)
    this.getComments(topicId)
    this.getStars(topicId)
  },

  /**
   * 获取动态详情
   */
  getTopicDetail(topicId) {
    const url = api.topicAPI + topicId + "/"
    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          topic: res.data.data
        })
      }
    })
  },

  /**
   * 获取评论
   */
  getComments(topicId, page = 1, size = pageSize) {
    const url = api.commentAPI + "topic/" + topicId + "/"

    let data = {
      size: size,
      page: page
    }

    if (this.data.isEnd && page != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const comments = res.data.data
        this.setData({
          page: (comments.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: ((comments.length < pageSize) || (comments.length == 0 && page != 1)) ? true : false,
          comments: page == 1 ? comments : this.data.comments.concat(comments)
        })
      }
    })
  },

  /**
   * 获取收藏
   */
  getStars(topicId) {
    const url = api.starAPI + "topic/" + topicId + "/"

    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          stars: res.data.data
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