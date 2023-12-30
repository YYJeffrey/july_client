// pages/auth/index.js
import wxutil from '../../miniprogram_npm/@yyjeffrey/wxutil/index'
import { Auth } from '../../models/auth'
const app = getApp()

Page({
  data: {
    code: null,
    goto: null
  },

  onLoad(options) {
    if (options.goto) {
      this.setData({
        goto: decodeURIComponent(options.goto)
      })
    }
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
   * 主动授权登录
   */
  auth() {
    app.globalData.userDetail = null

    wx.getUserProfile({
      desc: '授权信息将用于绑定用户',
      lang: 'zh_CN',
      success: async (res) => {
        const data = {
          encrypted_data: res.encryptedData,
          iv: res.iv,
          code: this.data.code,
          app_id: app.globalData.appId
        }

        const info = await Auth.initiative(data)
        if (info.code === 0) {
          const userDetail = info.data
          wxutil.setStorage('userDetail', userDetail, app.globalData.tokenExpires)
          app.globalData.userDetail = userDetail

          wx.lin.showMessage({
            type: 'success',
            content: '授权成功',
            success: () => {
              if (this.data.goto) {
                wx.redirectTo({
                  url: this.data.goto
                })
              } else {
                wx.navigateBack()
              }
            }
          })
        } else {
          wx.lin.showMessage({
            type: 'error',
            content: info.msg
          })
        }
      },
      complete: () => {
        this.getCode()
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '授权',
      path: '/pages/auth/index'
    }
  }
})
