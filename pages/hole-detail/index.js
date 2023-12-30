// pages/hole-detail/index.js
import { Hole } from '../../models/hole'
const app = getApp()

Page({
  data: {
    hole: null,
  },

  onLoad(options) {
    this.getHoleDetail(options.holeId)
  },

  /**
   * 获取树洞详情
   */
  async getHoleDetail(holeId) {
    const data = await Hole.getHoleDetail(holeId)
    this.setData({
      hole: data
    })
  },

  /**
   * 进入树洞或预约树洞
   */
  onJoinTap() {
    if (!app.globalData.userDetail) {
      this.gotoAuth()
    }

    const hole = this.data.hole

    // 预约树洞
    if (hole.status === 'UN_ENABLED') {
      const dialog = this.selectComponent('#dialog')

      dialog.linShow({
        type: 'confirm',
        title: '提示',
        content: '树洞暂未开启，是否提前预约？',
        success: (res) => {
          if (res.confirm) {
            wx.requestSubscribeMessage({
              tmplIds: [this.data.reportTemplateId],
              success: () => {
                this.orderHole(hole.id)
              }
            })
          }
        }
      })
    }

    // 进入树洞
    else if (hole.status === 'ENABLED') {
      this.gotoChatRoom()
    }
  },

  /**
   * 预约树洞
   */
  async orderHole() {
    const res = await Hole.orderHole(this.data.hole.id)
    if (res.code === 0) {
      wx.lin.showMessage({
        type: 'success',
        content: '预约成功！'
      })
    } else {
      wx.lin.showMessage({
        type: 'error',
        content: res.msg
      })
    }
  },

  /**
   * 跳转聊天室页
   */
  gotoChatRoom() {
    const hole = this.data.hole
    const roomId = hole.room_id
    const holeId = hole.id

    const endTime = new Date(hole.end_time)
    const nowTime = new Date()
    const countDown = Math.floor(Math.abs((endTime - nowTime) / 1000))

    wx.navigateTo({
      url: `/pages/chat-room/index?roomId=${roomId}&holeId=${holeId}&countDown=${countDown}`
    })
  },

  /**
   * 跳转授权页
   */
  gotoAuth() {
    wx.navigateTo({
      url: '/pages/auth/index'
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getHoleDetail(this.data.hole.id)
    wx.stopPullDownRefresh()
    wx.vibrateShort()
  },

  onShareAppMessage() {
    const hole = this.data.hole
    return {
      title: hole.title,
      imageUrl: hole.poster,
      path: `/pages/hole-detail/index?holeId=${hole.id}`
    }
  },

  onShareTimeline() {
    const hole = this.data.hole
    return {
      title: hole.title,
      query: `holeId=${hole.id}`,
      imageUrl: hole.poster
    }
  }
})
