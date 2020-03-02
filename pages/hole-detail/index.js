// pages/hole-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    reportTemplateId: null,
    hole: {}
  },

  onLoad(options) {
    const holeId = options.holeId
    this.getHoleDetail(holeId)
    this.getTemplateId()
  },

  /**
   * 获取树洞详情
   */
  getHoleDetail(holeId) {
    const url = api.holeAPI + holeId + "/"
    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          hole: res.data.data
        })
      }
    })
  },

  /**
   * 获取预约模板ID
   */
  getTemplateId(title = "预约模板") {
    const url = api.templateAPI
    const data = {
      title: title
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          reportTemplateId: res.data.data.template_id
        })
      }
    })
  },

  /**
   * 点击参加
   */
  onJoinTap() {
    const that = this
    let now = wxutil.getDateTime()
    now = now.replace(/-/g, "/");
    const nowTime = new Date(now)
    const startTime = new Date(now.substr(0, 11) + this.data.hole.start_time)
    const endTime = new Date(now.substr(0, 11) + this.data.hole.end_time)

    if (nowTime < startTime || nowTime > endTime) {
      wx.lin.showDialog({
        type: "confirm",
        title: "提示",
        content: "当前树洞暂未开启，是否提前预约？",
        success: (res) => {
          if (res.confirm) {
            const templateId = this.data.reportTemplateId
            wx.requestSubscribeMessage({
              tmplIds: [templateId],
              complete() {
                // 预约树洞
                that.orderHole(that.data.hole.id)
              }
            })
          }
        }
      })
    } else {
      // 进入树洞
      if (app.globalData.userDetail) {
        this.gotoChatRoom(this.data.hole.room_id)
      } else {
        this.gotoAuth()
      }
    }
  },

  /**
   * 预约树洞
   */
  orderHole(holeId) {
    const url = api.holeAPI + "order/"
    const data = {
      hole_id: holeId
    }

    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        wx.lin.showMessage({
          type: "success",
          content: "预约成功！"
        })
      } else if (res.data.message == "Can Not Repeated Report") {
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
    })
  },

  /**
   * 跳转聊天室页面
   */
  gotoChatRoom(roomId) {
    wx.navigateTo({
      url: "/pages/chat-room/index?roomId=" + roomId,
    })
  },

  /**
   * 跳转到授权页面
   */
  gotoAuth() {
    wx.navigateTo({
      url: "/pages/auth/index"
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.hole.title,
      imageUrl: this.data.hole.poster,
      path: "/pages/hole-detail/index?holeId=" + this.data.hole.id
    }
  }
})