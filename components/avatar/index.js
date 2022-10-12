// components/avatar/index.js
const app = getApp()

Component({
  externalClasses: ["avatar-class"],
  properties: {
    src: {
      type: String,
      value: "https://img.yejiefeng.com/poster/default.jpg"
    },
    size: {
      type: Number,
      value: 60
    },
    userId: {
      type: Number,
      value: -1
    },
    // 是否可链接
    isLink: {
      type: Boolean,
      value: true
    }
  },
  data: {

  },
  methods: {
    /**
     * 跳转名片页或授权页
     */
    onAvatarTap() {
      const url = "/pages/visiting-card/index?userId=" + this.data.userId
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
