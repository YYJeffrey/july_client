// pages/profile/index.js
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
    tabsTop: 255,
    isAuth: false,
    tabsFixed: false, // Tabs是否吸顶
    isEndTopic: false, // 话题是否到底
    isEndStar: false, // 收藏是否到底
    isEndComment: false, // 评论是否到底
    loading: false
  },

  onLoad() {
    this.getTabsTop()
  },

  onShow() {
    this.getUser()

    const userId = this.data.user.id
    if (!userId) {
      // 数据初始化
      this.setData({
        topics: [],
        comments: [],
        stars: [],
        pageTopic: 1,
        pageComment: 1,
        pageStar: 1,
        isEndTopic: false,
        isEndStar: false,
        isEndComment: false
      })
    }
  },

  /**
   * 获取Tabs的高度
   */
  getTabsTop() {
    const navigateHeight = 56
    const query = wx.createSelectorQuery();
    query.select("#tabs").boundingClientRect((res) => {
      this.setData({
        tabsTop: res.top - navigateHeight
      })
    }).exec();
  },

  /**
   * 获取用户信息
   */
  getUser() {
    const userInfo = wxutil.getStorage("userInfo")
    let userDetail = app.globalData.userDetail

    // 使用userInfo作为用户信息
    if (userInfo && !userDetail) {
      this.setData({
        user: userInfo,
        isAuth: false
      })
    }

    // 授权用户使用userDetail作为用户信息
    if (userDetail) {
      const userId = userDetail.id
      const url = api.userAPI + userId + "/"

      wxutil.request.get(url).then((res) => {
        if (res.data.code == 200) {
          // 更新缓存
          const user = res.data.data
          userDetail = Object.assign(userDetail, user)
          wxutil.setStorage("userDetail", userDetail)
          app.globalData.userDetail = userDetail

          this.setData({
            isAuth: true,
            user: userDetail
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
    }

    // 两种用户信息都没有
    if (!userInfo && !userDetail) {
      this.setData({
        user: {},
        isAuth: false
      })
    }
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
  gotoUserEdit() {
    wx.navigateTo({
      url: "/pages/user-edit/index"
    })
  },

  /**
   * 跳转到关注我的页面
   */
  gotoFollower() {
    wx.navigateTo({
      url: "/pages/follower/index?userId=" + this.data.user.id
    })
  },

  /**
   * 跳转到我关注的页面
   */
  gotoFollowing() {
    wx.navigateTo({
      url: "/pages/following/index?userId=" + this.data.user.id
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
   * 跳转到用户名片页
   */
  gotoVisitingCard(event) {
    const userId = event.target.dataset.userId
    wx.navigateTo({
      url: "/pages/visiting-card/index?userId=" + userId
    })
  },

  /**
   * 修改头像或封面
   */
  changeImg(event) {
    const imgType = event.currentTarget.dataset.imgType
    let imgText = null;

    if (imgType == "avatar") {
      imgText = "头像"
    } else if (imgType == "poster") {
      imgText = "封面"
    }

    // 提示
    wx.lin.showMessage({
      content: "设置" + imgText + "图片"
    })

    // 上传图片
    wxutil.image.choose(1).then((res) => {
      if (res.errMsg == "chooseImage:ok") {
        const url = api.userAPI + imgType + "/"

        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: res.tempFilePaths[0]
        }).then((res) => {
          const data = JSON.parse(res.data);
          if (data.code == 200) {
            // 更新缓存
            const user = data.data
            let userDetail = app.globalData.userDetail
            userDetail = Object.assign(userDetail, user)
            wxutil.setStorage("userDetail", userDetail)
            app.globalData.userDetail = userDetail

            if (imgType == "avatar") {
              this.setData({
                avatar: userDetail.avatar
              })
            } else if (imgType == "poster") {
              this.setData({
                poster: userDetail.poster
              })
            }

            wx.lin.showMessage({
              type: "success",
              content: imgText + "修改成功！"
            })
          } else {
            wx.lin.showMessage({
              type: "error",
              content: imgText + "修改成功！"
            })
          }
        })
      }
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

  /**
   * 删除话题
   */
  deleteTopic(event) {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要删除该条话题？",
      success: (res) => {
        if (res.confirm) {
          const topicId = event.currentTarget.dataset.id
          const url = api.topicAPI + topicId + "/"

          wxutil.request.delete(url).then((res) => {
            if (res.data.code == 200) {
              this.getTopics(this.data.user.id)

              wx.lin.showMessage({
                type: "success",
                content: "删除成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "删除失败！"
              })
            }
          })
        }
      }
    })
  },

  /**
   * 删除评论
   */
  deleteComment(event) {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要删除该条评论？",
      success: (res) => {
        if (res.confirm) {
          const commentId = event.currentTarget.dataset.id
          const url = api.commentAPI + commentId + "/"

          wxutil.request.delete(url).then((res) => {
            if (res.data.code == 200) {
              this.getComments(this.data.user.id)

              wx.lin.showMessage({
                type: "success",
                content: "删除成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "删除失败！"
              })
            }
          })
        }
      }
    })
  },

  /**
   * 取消收藏
   */
  deleteStar(event) {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      content: "确定要取消收藏该话题？",
      success: (res) => {
        if (res.confirm) {
          const topicId = event.currentTarget.dataset.id
          const url = api.starAPI

          const data = {
            topic_id: topicId
          }

          wxutil.request.post(url, data).then((res) => {
            if (res.data.code == 200) {
              this.getStars(this.data.user.id)

              wx.lin.showMessage({
                type: "success",
                content: "取消成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "取消失败！"
              })
            }
          })
        }
      }
    })
  },

  onPageScroll(event) {
    if (event.scrollTop >= this.data.tabsTop) {
      this.setData({
        tabsFixed: true
      })
    } else {
      this.setData({
        tabsFixed: false
      })
    }
  },

  onShareAppMessage() {
    return {
      title: "个人中心",
      path: "/pages/profile/index"
    }
  }
})