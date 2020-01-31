// pages/following/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    followingList: [],
    page: 1,
    userId: -1,
    loading: false,
    isEnd: false // 是否到底
  },

  onLoad(options) {
    const userId = options.userId
    this.setData({
      userId: userId
    })
    this.getFollowingList(userId)
  },

  /**
   * 获取我的关注列表
   */
  getFollowingList(userId, page = 1, size = pageSize) {
    const url = api.followingAPI + "user/" + userId + "/"

    let data = {
      size: size,
      page: page
    }

    if (this.data.isEnd && page != 1) {
      return
    }

    wx.showNavigationBarLoading()
    wxutil.request.get(url, data).then((res) => {
      if (res.data.code === 200) {
        const followingList = res.data.data
        this.setData({
          page: (followingList.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: (followingList.length == 0 && page != 1) ? true : false,
          followingList: page == 1 ? followingList : this.data.followingList.concat(followingList)
        })
      }
      wx.hideNavigationBarLoading()
    })
  },

  /**
   * 触底加载
   */
  onReachBottom() {
    const page = this.data.page
    const userId = this.data.userId

    this.setData({
      loading: true
    })
    this.getFollowingList(userId, page + 1)
  },

  onShareAppMessage() {
    return {
      title: "我的关注",
      path: "/pages/following/index"
    }
  }
})