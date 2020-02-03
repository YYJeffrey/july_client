// pages/profile/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    avatar: null,
    nickName: null,
    isAuth: false,
    gender: 0,
    follower: 0,
    following: 0,
    userId: -1,
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
    let userDetail = wxutil.getStorage("userDetail")

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
      const userId = userDetail.id
      const url = api.userAPI + userId + "/"

      this.setData({
        userId: userId,
        isAuth: true
      })

      wxutil.request.get(url).then((res) => {
        if (res.data.code === 200) {
          // 更新缓存
          const user = res.data.data
          userDetail = Object.assign(userDetail, user)
          wxutil.setStorage("userDetail", userDetail)

          this.setData({
            avatar: userDetail.avatar,
            nickName: userDetail.nick_name,
            gender: userDetail.gender,
            follower: userDetail.follower,
            following: userDetail.following,
          })

          if (userDetail.signature) {
            this.setData({
              signature: userDetail.signature
            })
          }
        }
      })
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

  /**
   * 跳转到编辑资料页面
   */
  editInfo() {
    wx.navigateTo({
      url: "/pages/edituser/index"
    })
  },

  /**
   * 跳转到关注我的页面
   */
  gotoFollower() {
    wx.navigateTo({
      url: "/pages/follower/index?userId=" + this.data.userId
    })
  },

  /**
   * 跳转到我关注的页面
   */
  gotoFollowing() {
    wx.navigateTo({
      url: "/pages/following/index?userId=" + this.data.userId
    })
  },

  /**
   * 修改头像
   */
  changeAvatar() {
    wxutil.image.choose(1).then((res) => {
      if (res.errMsg === "chooseImage:ok") {
        const url = api.userAPI + "upload/"

        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: res.tempFilePaths[0]
        }).then((res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            // 更新缓存
            const user = data.data
            let userDetail = wxutil.getStorage("userDetail")
            userDetail = Object.assign(userDetail, user)
            wxutil.setStorage("userDetail", userDetail)

            this.setData({
              avatar: userDetail.avatar
            })
            wx.lin.showMessage({
              type: "success",
              content: "头像修改成功！"
            })
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "头像修改失败F！"
            })
          }
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "个人中心",
      path: "/pages/profile/index"
    }
  }
})