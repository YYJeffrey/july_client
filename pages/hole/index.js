// pages/hole/index.js
import { Hole } from "../../models/hole"
const app = getApp()

Page({
  data: {
    holes: [],
    holePaging: null  // 树洞分页器
  },

  onLoad() {
    this.initHoles()
  },

  /**
   * 初始化树洞
   */
  async initHoles() {
    const holePaging = await Hole.getHolePaging(app.globalData.appId)
    this.setData({
      holePaging: holePaging
    })
    await this.getMoreHoles(holePaging)
  },

  /**
   * 获取更多树洞
   */
  async getMoreHoles(holePaging) {
    const data = await holePaging.getMore()
    if (!data) {
      return
    }
    this.setData({
      holes: data.accumulator
    })
  },

  /**
   * 触底加载
   */
  async onReachBottom() {
    await this.getMoreHoles(this.data.holePaging)
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.initHoles()
    wx.stopPullDownRefresh()
    wx.vibrateShort()
  },

  onShareAppMessage() {
    return {
      title: "树洞",
      path: "/pages/hole/index"
    }
  }
})
