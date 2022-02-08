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
   * 获取小程序code
   */
  getCode() {
    wx.login({
      success: (res) => {
        this.setData({
          code: res.code
        })
      }
    })
  },

  /**
   * 授权登录
   */
  auth() {
    wx.getUserProfile({
      desc: '授权信息将用于绑定用户',
      lang: 'zh_CN',
      success: (res) => {
        const data = {
          encrypted_data: res.encryptedData,
          iv: res.iv,
          code: this.data.code,
          app_id: app.globalData.appId
        }

        wxutil.request.post(api.userAPI, data).then(res => {
          if (res.code === 200) {
            const userDetail = res.data
            wxutil.setStorage('userDetail', userDetail, app.globalData.tokenExpires)
            app.globalData.userDetail = userDetail

            wx.lin.showMessage({
              type: 'success',
              content: '授权成功',
              success: () => {
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
      complete: () => {
        this.getCode()
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