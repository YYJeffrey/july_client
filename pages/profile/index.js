// pages/profile/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    avatar: null,
    nickName: null,
    gender: null,
    follower: 0,
    following: 0,
    signature: "这个家伙很懒，什么都没有留下"
  },

  onShow() {
    this.getUser()
  },

  onLoad() {

  },

  /**
   * 获取用户信息
   */
  getUser() {
    const userInfo = wxutil.getStorage("userInfo")
    const userDetail = wxutil.getStorage("userDetail")

    // 使用userInfo的信息
    if (userInfo && !userDetail) {
      this.setData({
        avatar: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        gender: userInfo.gender
      })
    }

    // 授权用户使用userDetail的信息
    if (userDetail) {
      this.setData({
        avatar: userDetail.avatar,
        nickName: userDetail.nick_name,
        gender: userDetail.gender,
        follower: userDetail.follower,
        following: userDetail.following
      })
      if (userDetail.signature) {
        this.setData({
          signature: userDetail.signature
        })
      }
    }
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
      title: "个人中心",
      path: "/pages/profile/index"
    }
  }
})