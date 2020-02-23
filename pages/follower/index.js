// pages/follower/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    followerList: [],
    page: 1,
    followUserId: -1,
    isEnd: false, // 是否到底
    loading: false
  },

  onLoad(options) {
    const followUserId = options.userId
    const genderText = options.genderText
    if (genderText) {
      // 设置标题
      wx.setNavigationBarTitle({
        title: "关注" + genderText + "的"
      })
    }
    this.setData({
      followUserId: followUserId
    })
    this.getFollowerList(followUserId)
  },

  /**
   * 获取我的关注列表
   */
  getFollowerList(followUserId, page = 1, size = pageSize) {
    const url = api.followingAPI + "follow_user/" + followUserId + "/"
    let data = {
      size: size,
      page: page
    }

    if (this.data.isEnd && page != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const followerList = res.data.data
        this.setData({
          page: (followerList.length == 0 && page != 1) ? page - 1 : page,
          loading: false,
          isEnd: (followerList.length == 0 && page != 1) ? true : false,
          followerList: page == 1 ? followerList : this.data.followerList.concat(followerList)
        })
      }
    })
  },

  /**
   * 触底加载
   */
  onReachBottom() {
    const page = this.data.page
    const followUserId = this.data.followUserId

    this.setData({
      loading: true
    })
    this.getFollowerList(followUserId, page + 1)
  },

  /**
   * 点击标签
   */
  onTagTap(event) {
    const index = event.currentTarget.dataset.followIndex
    const item = this.data.followerList[index]
    const followUser = item.user
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
      if (res.data.code == 200) {
        wx.lin.showMessage({
          type: "success",
          content: msg + "成功！",
        })

        let followerList = this.data.followerList
        followerList[index].has_follow = !followerList[index].has_follow

        this.setData({
          followerList: followerList
        })
      } else if (res.data.message == "Can Not Following Yourself") {
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
    const userId = event.target.dataset.userId
    wx.navigateTo({
      url: "/pages/visiting-card/index?userId=" + userId
    })
  },

  onShareAppMessage() {
    return {
      title: "关注我的",
      path: "/pages/follower/index"
    }
  }
})