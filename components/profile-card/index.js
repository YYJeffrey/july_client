// components/profile-card/index.js
Component({
  properties: {
    user: Object,
    // 默认封面
    defaultPoster: {
      type: String,
      value: "https://img.yejiefeng.com/poster/default.jpg"
    },
    // 默认头像
    defaultAvatar: {
      type: String,
      value: "https://img.yejiefeng.com/avatar/default.jpg"
    },
    // 默认昵称
    defaultNickname: {
      type: String,
      value: "微信用户"
    },
    // 默认个性签名
    defaultSignature: {
      type: String,
      value: "这家伙选择躺平，什么都没有留下"
    },
    // 是否为内容所有者
    isOwner: {
      type: Boolean,
      value: true
    }
  },
  data: {

  },
  methods: {
    /**
     * 点击封面事件
     */
    onPosterTap() {
      this.triggerEvent("posterTap")
    },

    /**
     * 点击头像事件
     */
    onAvatarTap() {
      this.triggerEvent("avatarTap")
    },

    /**
     * 点击关注或取消关注事件
     */
    onFollowTap() {
      this.triggerEvent("followTap")
    },

    /**
     * 跳转授权页
     */
    gotoAuth() {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    },

    /**
     * 跳转编辑资料页
     */
    gotoUserEdit() {
      wx.navigateTo({
        url: "/pages/user-edit/index"
      })
    },

    /**
     * 跳转关注Ta的页
     */
    gotoFollower() {
      const user = this.data.user
      if (user === null) {
        return
      }
      const title = this.data.isOwner ? "关注我的" : "关注" + this.getGenderText() + "的"
      wx.navigateTo({
        url: "/pages/follower/index?userId=" + user.id + "&title=" + title
      })
    },

    /**
     * 跳转Ta关注的页
     */
    gotoFollowing() {
      const user = this.data.user
      if (user === null) {
        return
      }
      const title = this.data.isOwner ? "我关注的" : this.getGenderText() + "关注的"
      wx.navigateTo({
        url: "/pages/following/index?userId=" + user.id + "&title=" + title
      })
    },

    /**
     * 获取性别文本
     */
    getGenderText() {
      const gender = this.data.user.gender
      if (gender === 1) {
        return "他"
      }
      else if (gender === 2) {
        return "她"
      }
      return "Ta"
    }
  }
})
