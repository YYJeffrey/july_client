// pages/auth/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    code: null
  },
  onLoad() {
    this.getCode()
  },

  /**
   * 获取微信小程序code
   */
  getCode() {
    const that = this
    wx.login({
      success(res) {
        that.setData({
          code: res.code
        })
      }
    })
  },

  /**
   * 授权登录
   */
  auth() {
    const that = this
    wx.getUserProfile({
      desc: '授权用户信息将用于绑定用户',
      lang: 'zh_CN',
      success(res) {
        const encrypted_data = res.encryptedData
        const iv = res.iv
        const code = that.data.code
        const app_id = app.globalData.appId

        const data = {
          encrypted_data,
          iv,
          code,
          app_id
        }

        wxutil.request.post(api.userAPI, data).then(res => {
          if (res.data.code === 200) {
            const userDetail = res.data.data
            wxutil.setStorage('userDetail', userDetail, 86400 * 28)
            app.globalData.userDetail = userDetail

            wx.lin.showMessage({
              type: 'success',
              content: '授权成功',
              success() {
                wx.navigateBack()
              }
            })
          } else {
            wx.lin.showMessage({
              type: 'error',
              content: res.msg
            })
          }
        })
      },
      complete() {
        that.getCode()
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "授权",
      path: "/pages/auth/index"
    }
  }
})