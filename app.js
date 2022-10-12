//app.js
import wxutil from "./miniprogram_npm/@yyjeffrey/wxutil/index"

App({
  globalData: {
    appId: wx.getAccountInfoSync().miniProgram.appId,
    githubURI: "YYJeffrey/july_client",
    githubURL: "https://github.com/YYJeffrey/july_client",
    likeAuthor: "https://img.yejiefeng.com/qr/qr_like.png", // 作者的赞赏码
    userDetail: null, // 用户信息详情
    tokenExpires: 86400 * 28 // Token过期时间
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
    if (res.message === "Token Is Invalid") {
      wx.removeStorageSync("userDetail")
      wx.navigateTo({
        url: "/pages/auth/index",
      })
    }
  }
})
