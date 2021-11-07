//app.js
const api = require("./config/api")
const wxutil = require("./miniprogram_npm/@yyjeffrey/wxutil/index")

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
    wxutil.autoUpdate()
  },

  /**
   * 获取用户详情
   */
  getUserDetail() {
    const userDetail = wxutil.getStorage("userDetail")
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