//app.js
import wxutil from './miniprogram_npm/@yyjeffrey/wxutil/index'
import { Auth } from './models/auth'

App({
  globalData: {
    appId: wx.getAccountInfoSync().miniProgram.appId,
    githubURI: 'YYJeffrey/july_client',
    githubURL: 'https://github.com/YYJeffrey/july_client',
    likeAuthor: 'https://img.yejiefeng.com/qr/qr_like.png', // 作者的赞赏码
    userDetail: null, // 用户信息详情
    tokenExpires: 86400 * 27 // Token过期时间
  },

  onLaunch() {
    this.getUserDetail()
    wxutil.autoUpdate()
  },

  /**
   * 获取用户详情
   */
  getUserDetail() {
    const deadtime = wxutil.getStorage('userDetail_deadtime')

    if (deadtime) {
      const remainTime = parseInt(deadtime) - Date.parse(new Date()) / 1000
      // 令牌剩余 25% 自动续期
      if (remainTime <= this.globalData.tokenExpires * 0.25) {
        this.passiveAuth()
      }
    }

    const userDetail = wxutil.getStorage('userDetail')
    if (userDetail) {
      this.globalData.userDetail = userDetail
    } else {
      this.globalData.userDetail = null
    }
  },

  /**
   * 被动授权
   */
  passiveAuth() {
    wx.login({
      success: async (res) => {
        const info = await Auth.passive(res.code)
        if (info.code === 0) {
          const userDetail = info.data
          wxutil.setStorage('userDetail', userDetail, this.globalData.tokenExpires)
          this.globalData.userDetail = userDetail
        }
      }
    })
  },

  /**
   * 获取请求头
   */
  getHeader() {
    let header = {}
    if (this.globalData.userDetail) {
      header['Authorization'] = 'Token ' + this.globalData.userDetail.token
    }
    return header
  },

  /**
   * Token无效跳转授权页
   */
  gotoAuthPage(res) {
    if (res.code == 10120 || res.code == 10121) {
      wx.removeStorageSync('userDetail')
      wx.navigateTo({
        url: '/pages/auth/index'
      })
    }
  }
})
