// pages/visiting-card/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    user: {},
    topics: [],
    comments: [],
    stars: [],
    pageTopic: 1,
    pageComment: 1,
    pageStar: 1,
    tabIndex: 0,
    genderText: "Ta",
    isEndTopic: false, // 话题是否到底
    isEndStar: false, // 收藏是否到底
    isEndComment: false, // 评论是否到底
    loading: false
  },

  onLoad(options) {
    const userId = options.userId
    this.getUser(userId)
  },

  /**
   * 获取用户信息
   */
  getUser(userId) {
    const url = api.userAPI + userId + "/"

    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        const user = res.data.data
        let genderText = "Ta"
        if (user.gender == 1) {
          genderText = "他"
        }
        if (user.gender == 2) {
          genderText = "她"
        }

        this.setData({
          user: user,
          genderText: genderText
        })

        // 设置标题
        wx.setNavigationBarTitle({
          title: user.nick_name
        })

        // 标签页切换
        const tabIndex = this.data.tabIndex
        if (tabIndex == 0) {
          this.getTopics(userId)
        }
        if (tabIndex == 1) {
          this.getComments(userId)
        }
        if (tabIndex == 2) {
          this.getStars(userId)
        }
      }
    })
  },

  /**
   * 获取用户话题
   */
  getTopics(userId, pageTopic = 1, size = pageSize) {
    const url = api.topicAPI + "user/" + userId + "/"
    let data = {
      size: size,
      page: pageTopic
    }

    if (this.data.isEndTopic && pageTopic != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const topics = res.data.data
        this.setData({
          pageTopic: (topics.length == 0 && pageTopic != 1) ? pageTopic - 1 : pageTopic,
          loading: false,
          isEndTopic: ((topics.length < pageSize) || (topics.length == 0 && pageTopic != 1)) ? true : false,
          topics: pageTopic == 1 ? topics : this.data.topics.concat(topics)
        })
      }
    })
  },

  /**
   * 获取用户收藏
   */
  getStars(userId, pageStar = 1, size = pageSize) {
    const url = api.starAPI + "user/" + userId + "/"
    let data = {
      size: size,
      page: pageStar
    }

    if (this.data.isEndStar && pageStar != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const stars = res.data.data
        this.setData({
          pageStar: (stars.length == 0 && pageStar != 1) ? pageStar - 1 : pageStar,
          loading: false,
          isEndStar: ((stars.length < pageSize) || (stars.length == 0 && pageStar != 1)) ? true : false,
          stars: pageStar == 1 ? stars : this.data.stars.concat(stars)
        })
      }
    })
  },

  /**
   * 获取用户评论
   */
  getComments(userId, pageComment = 1, size = pageSize) {
    const url = api.commentAPI + "user/" + userId + "/"
    let data = {
      size: size,
      page: pageComment
    }

    if (this.data.isEndComment && pageComment != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const comments = res.data.data
        this.setData({
          pageComment: (comments.length == 0 && pageComment != 1) ? pageComment - 1 : pageComment,
          loading: false,
          isEndComment: ((comments.length < pageSize) || (comments.length == 0 && pageComment != 1)) ? true : false,
          comments: pageComment == 1 ? comments : this.data.comments.concat(comments)
        })
      }
    })
  },

  /**
   * 点击关注或取消关注按钮
   */
  onFollowTap() {
    const that = this
    const user = this.data.user
    if (this.data.user.has_follow) {
      wx.lin.showActionSheet({
        title: "确定要取消关注" + user.nick_name + "吗？",
        showCancel: true,
        cancelText: "放弃",
        itemList: [{
          name: "取消关注",
          color: "#666",
        }],
        success() {
          that.followOrCancel(user.id, "取消关注")
        }
      })
    } else {
      this.followOrCancel(user.id, "关注")
    }
  },

  /**
   * 关注或取关
   */
  followOrCancel(userId, msg) {
    const url = api.followingAPI
    const data = {
      "follow_user_id": userId
    }

    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        wx.lin.showMessage({
          type: "success",
          content: msg + "成功！",
        })
        let user = this.data.user
        user.has_follow = !user.has_follow
        this.setData({
          user: user
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
   * Tab切换
   */
  changeTabs(event) {
    const tabIndex = event.detail.currentIndex
    const userId = this.data.user.id
    this.setData({
      tabIndex: tabIndex
    })
    if (tabIndex == 0) {
      this.getTopics(userId)
    }
    if (tabIndex == 1) {
      this.getComments(userId)
    }
    if (tabIndex == 2) {
      this.getStars(userId)
    }
  },

  /**
   * 跳转到关注Ta的页面
   */
  gotoFollower() {
    wx.navigateTo({
      url: "/pages/follower/index?userId=" + this.data.user.id + "&genderText=" + this.data.genderText
    })
  },

  /**
   * 跳转到Ta关注的页面
   */
  gotoFollowing() {
    wx.navigateTo({
      url: "/pages/following/index?userId=" + this.data.user.id + "&genderText=" + this.data.genderText
    })
  },

  /**
   * 跳转话题详情页
   */
  gotoTopicDetail(event) {
    const topicId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/topic-detail/index?topicId=" + topicId
    })
  },

  /**
   * 触底加载
   */
  onReachBottom() {
    const tabIndex = this.data.tabIndex
    const userId = this.data.user.id

    this.setData({
      loading: true
    })
    if (tabIndex == 0) {
      const page = this.data.pageTopic
      this.getTopics(userId, page + 1)
    }
    if (tabIndex == 1) {
      const page = this.data.pageComment
      this.getComments(userId, page + 1)
    }
    if (tabIndex == 2) {
      const page = this.data.pageStar
      this.getStars(userId, page + 1)
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.user.nick_name,
      imageUrl: this.data.user.avatar,
      path: "/pages/visiting-card/index?userId=" + this.data.user.id
    }
  }
})