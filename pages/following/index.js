// pages/following/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    followingList: [],
    page: 1,
    userId: -1,
    isEnd: false, // 是否到底
    loading: false
  },

  onLoad(options) {
    const userId = options.userId
    const genderText = options.genderText
    if (genderText) {
      // 设置标题
      wx.setNavigationBarTitle({
        title: genderText + "关注的"
      })
    }
    this.setData({
      userId: userId
    })
    this.getFollowingList(userId)
  },

  /**
   * 获取我的关注列表
   */
  getFollowingList(userId, page = 1, size = pageSize) {
    const url = api.followingAPI + "user/" + userId + "/"
    let data = {
      size: size,
      page: page
    }

    if (this.data.isEnd && page != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.code == 200) {
        const followingList = res.data
        this.setData({
          page: (followingList.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: (followingList.length == 0 && page != 1) ? true : false,
          followingList: page == 1 ? followingList : this.data.followingList.concat(followingList)
        })
      }
    })
  },

  /**
   * 触底加载
   */
  onReachBottom() {
    const page = this.data.page
    const userId = this.data.userId

    this.setData({
      loading: true
    })
    this.getFollowingList(userId, page + 1)
  },

  /**
   * 点击标签
   */
  onTagTap(event) {
    const index = event.currentTarget.dataset.followIndex
    const item = this.data.followingList[index]
    const followUser = item.follow_user
    const hasFollow = item.has_follow
    const that = this

    if (hasFollow) {
      wx.lin.showActionSheet({
        title: "确定要取消关注" + followUser.nick_name + "吗？",
        showCancel: true,
        cancelText: "放弃",
        itemList: [{
          name: "取消关注",
          color: "#666",
        }],
        success() {
          that.followOrCancel(followUser.id, "取消关注", index)
        }
      })
    } else {
      this.followOrCancel(followUser.id, "关注", index)
    }
  },

  /**
   * 关注或取关
   */
  followOrCancel(followUserId, msg, index) {
    const url = api.followingAPI
    const data = {
      "follow_user_id": followUserId
    }

    wxutil.request.post(url, data).then((res) => {
      if (res.code == 200) {
        wx.lin.showMessage({
          type: "success",
          content: msg + "成功！",
        })

        let followingList = this.data.followingList
        followingList[index].has_follow = !followingList[index].has_follow

        this.setData({
          followingList: followingList
        })
      } else if (res.message == "Can Not Following Yourself") {
        wx.lin.showMessage({
          type: "error",
          content: "不能关注自己",
        })
      } else {
        wx.lin.showMessage({
          type: "error",
          content: msg + "失败！",
        })
      }
    })
  },

  /**
   * 跳转到用户名片页
   */
  gotoVisitingCard(event) {
    if (app.globalData.userDetail) {
      const userId = event.target.dataset.userId
      wx.navigateTo({
        url: "/pages/visiting-card/index?userId=" + userId
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/index"
      })
    }
  },

  onShareAppMessage() {
    return {
      title: "我的关注",
      path: "/pages/following/index"
    }
  }
})