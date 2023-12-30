// components/avatar/index.js
const app = getApp()

Component({
  externalClasses: ['avatar-class'],
  properties: {
    src: {
      type: String,
      value: null
    },
    userId: {
      type: String,
      value: null
    },
    size: {
      type: Number,
      value: 60
    },
    // 是否可链接
    isLink: {
      type: Boolean,
      value: true
    }
  },
  data: {
    defaultAvatar: 'https://img.yejiefeng.com/avatar/default.jpg'
  },
  methods: {
    /**
     * 跳转名片页或授权页
     */
    onAvatarTap() {
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
