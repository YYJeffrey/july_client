// pages/hole-detail/index.js
import wxutil from "../../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Hole } from "../../models/hole"
import { Template } from "../../models/template"
const app = getApp()

Page({
  data: {
    hole: null,
    reportTemplateId: null  // 预约订阅消息ID
  },

  onLoad(options) {
    this.getHoleDetail(options.holeId)
  },

  onShow() {
    this.getTemplateId()
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
   * 获取预约订阅消息ID
   */
  async getTemplateId(title = "预约模板") {
    if (!app.globalData.userDetail) {
      return
    }
    const data = await Template.getTemplateId(title)
    this.setData({
      reportTemplateId: data.template_id
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
    let now = wxutil.getDateTime()
    now = now.replace(/-/g, "/");
    const nowTime = new Date(now)
    const startTime = new Date(now.substr(0, 11) + hole.start_time)
    const endTime = new Date(now.substr(0, 11) + hole.end_time)

    // 预约树洞
    if (nowTime < startTime || nowTime > endTime) {
      const dialog = this.selectComponent('#dialog')

      dialog.linShow({
        type: "confirm",
        title: "提示",
        content: "树洞暂未开启，是否提前预约？",
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
    else {
      const roomId = this.data.hole.room_id
      const countDown = (endTime - nowTime) / 1000
      this.gotoChatRoom(roomId, countDown)
    }
  },

  /**
   * 预约树洞
   */
  async orderHole(holeId) {
    const res = await Hole.orderHole(holeId)
    if (res.code === 200) {
      wx.lin.showMessage({
        type: "success",
        content: "预约成功！"
      })
    } else if (res.message === "Can Not Repeated Report") {
      wx.lin.showMessage({
        type: "error",
        content: "请勿重复预约！"
      })
    } else {
      wx.lin.showMessage({
        type: "error",
        content: "预约失败！"
      })
    }
  },

  /**
   * 跳转聊天室页
   */
  gotoChatRoom(roomId, countDown) {
    wx.navigateTo({
      url: "/pages/chat-room/index?roomId=" + roomId + "&countDown=" + countDown,
    })
  },

  /**
   * 跳转授权页
   */
  gotoAuth() {
    wx.navigateTo({
      url: "/pages/auth/index"
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
      path: "/pages/hole-detail/index?holeId=" + hole.id
    }
  },

  onShareTimeline() {
    const hole = this.data.hole
    return {
      title: hole.title,
      query: "holeId=" + hole.id,
      imageUrl: hole.poster
    }
  }
})
