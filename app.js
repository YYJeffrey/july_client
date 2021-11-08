//app.js
import api from "./config/api"
import wxutil, { autoUpdate, getStorage } from "./miniprogram_npm/@yyjeffrey/wxutil/index"

App({
  api: api,
  wxutil: wxutil,

  globalData: {
    appId: wx.getAccountInfoSync().miniProgram.appId,
    githubURL: "https://github.com/YYJeffrey/july_client",
    userDetail: null
  },

  onLaunch() {
    this.getUserDetail()
    autoUpdate()
  },

  /**
   * 获取用户详情
   */
  getUserDetail() {
    const userDetail = getStorage("userDetail")
    if (userDetail) {
      this.globalData.userDetail = userDetail
    } else {
      this.globalData.userDetail = null
    }
  },

  /**
   * 获取请求头
   */
  getHeader() {
    let header = {}
    if (this.globalData.userDetail) {
      header["Authorization"] = "Token " + this.globalData.userDetail.token
    }
    return header
  },

  /**
   * Token无效跳转授权页
   */
  gotoAuthPage(res) {
    if (res.message == "Token Is Invalid") {
      wx.navigateTo({
        url: "/pages/auth/index",
      })
    }
  }
})