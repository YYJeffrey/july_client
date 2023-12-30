// components/nickname/index.js
const app = getApp()

Component({
  externalClasses: ['nickname-class'],
  properties: {
    nickname: {
      type: String,
      value: null
    },
    size: {
      type: Number,
      value: 28
    },
    userId: {
      type: String,
      value: null
    },
    // 是否可链接
    isLink: {
      type: Boolean,
      value: true
    }
  },
  data: {
    defaultNickname: '微信用户'
  },
  methods: {
    /**
     * 跳转名片页或授权页
     */
    onNicknameTap() {
      const url = `/pages/visiting-card/index?userId=${this.data.userId}`

      if (app.globalData.userDetail) {
        wx.navigateTo({
          url: url
        })
      } else {
        wx.navigateTo({
          url: `/pages/auth/index?goto=${encodeURIComponent(url)}`
        })
      }
    }
  }
})
