//app.js
const api = require("./config/api.js")
const wxutil = require("./utils/wxutil.js")

App({
  api: api,
  wxutil: wxutil,

  globalData: {
    appId: wx.getAccountInfoSync().miniProgram.appId
  },

  onLaunch() {
    wxutil.autoUpdate()
  },

  /**
   * 获取全局请求头
   */
  getHeader() {
    const userDetail = wxutil.getStorage("userDetail")
    let header = {}
    if (userDetail) {
      header["Authorization"] = "Token " + userDetail.token
    }
    return header
  }
})