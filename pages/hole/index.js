// pages/hole/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    holes: [],
    page: 1,
    loading: false,
    isEnd: false // 是否到底
  },

  onLoad() {
    this.getHoles()
  },

  /**
   * 获取树洞
   */
  getHoles(page = 1, size = pageSize) {
    const url = api.holeAPI
    let data = {
      app_id: app.globalData.appId,
      size: size,
      page: page
    }

    if (this.data.isEnd && page != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const holes = res.data.data
        this.setData({
          page: (holes.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: ((holes.length < pageSize) || (holes.length == 0 && page != 1)) ? true : false,
          holes: page == 1 ? holes : this.data.holes.concat(holes)
        })
      }
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getHoles()
    wx.stopPullDownRefresh()
    wx.vibrateShort()
  },

  /**
   * 触底加载
   */
  onReachBottom() {
    const page = this.data.page

    this.setData({
      loading: true
    })
    this.getHoles(page + 1)
  },

  /**
   * 跳转树洞详情页
   */
  gotoDetail(event) {
    const holeId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/hole-detail/index?holeId=" + holeId
    })
  },

  onShareAppMessage() {
    return {
      title: "树洞",
      path: "/pages/hole/index"
    }
  }
})