// pages/setting/index.js
import wxutil from "../../miniprogram_npm/@yyjeffrey/wxutil/index"
const app = getApp()

Page({
  data: {
    githubURI: app.globalData.githubURI,
    likeAuthor: app.globalData.likeAuthor,
    showPopup: false
  },

  onLoad() { },

  /**
   * 打开权限页面
   */
  openSetting() {
    wx.openSetting({})
  },

  /**
   * 清除缓存
   */
  clearStorage() {
    const dialog = this.selectComponent('#dialog')

    dialog.linShow({
      type: "confirm",
      title: "提示",
      content: "确定要清除所有缓存？",
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage()
          app.globalData.userDetail = null
        }
      }
    })
  },

  /**
   * 展开或收起弹出层
   */
  togglePopup() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },

  /**
   * 图片预览
   */
  previewImage() {
    wx.previewImage({
      urls: [this.data.likeAuthor]
    })
  },

  /**
   * 复制仓库地址
   */
  copyLink() {
    wx.setClipboardData({
      data: app.globalData.githubURL,
      success: () => {
        wx.getClipboardData({
          success: () => {
            wxutil.showToast("GitHub地址已复制")
          }
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})
