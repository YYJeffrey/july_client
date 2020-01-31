// pages/follower/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    followerList: [],
    page: 1,
    followUserId: -1,
    loading: false,
    isEnd: false // 是否到底
  },

  onLoad(options) {
    const followUserId = options.userId
    this.setData({
      followUserId: followUserId
    })
    this.getFollowerList(followUserId)
  },

  /**
   * 获取我的关注列表
   */
  getFollowerList(followUserId, page = 1, size = pageSize) {
    const url = api.followingAPI + "follow_user/" + followUserId + "/"

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
        const followerList = res.data.data
        this.setData({
          page: (followerList.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: (followerList.length == 0 && page != 1) ? true : false,
          followerList: page == 1 ? followerList : this.data.followerList.concat(followerList)
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
    const followUserId = this.data.followUserId

    this.setData({
      loading: true
    })
    this.getFollowerList(followUserId, page + 1)
  },

  onShareAppMessage() {
    return {
      title: "关注我的",
      path: "/pages/follower/index"
    }
  }
})