// pages/visiting-card/index.js
import { Paging } from "../../utils/paging"
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    user: null,
    topics: [],
    comments: [],
    stars: [],
    tabIndex: 0,  // Tabs选中的栏目
    tabsTop: 300, // Tabs距离顶部的高度
    genderText: "Ta", // 性别文本
    topicPaging: null,  // 话题分页器
    commentPaging: null,  // 评论分页器
    starPaging: null, // 收藏分页器
    tabsFixed: false, // Tabs是否吸顶
    hasMoreTopic: true, // 是否还有更多话题
    hasMoreComment: true, // 是否还有更多评论
    hasMoreStar: true, // 是否还有更多收藏
    loading: false
  },

  onLoad(options) {
    this.getUser(options.userId)
  },

  /**
   * 计算Tabs距离顶部的高度
   */
  getTabsTop() {
    const query = wx.createSelectorQuery()
    query.select("#tabs").boundingClientRect((res) => {
      this.setData({
        tabsTop: res.top
      })
    }).exec()
  },

  /**
   * 获取用户信息
   */
  getUser(userId) {
    wxutil.request.get(api.userAPI + userId + "/").then((res) => {
      if (res.code === 200) {
        const user = res.data
        this.setData({
          user: user
        })

        this.getTabsTop()
        wx.setNavigationBarTitle({
          title: user.nick_name
        })

        this.initTopics(userId)
        this.initComments(userId)
        this.initStars(userId)
      }
    })
  },

  /**
   * 初始化话题
   */
  async initTopics(userId) {
    const topicPaging = new Paging(api.topicAPI + "user/" + userId + "/")
    this.setData({
      topicPaging: topicPaging
    })
    await this.getMoreTopics(topicPaging)
  },

  /**
   * 获取更多话题
   */
  async getMoreTopics(topicPaging) {
    const data = await topicPaging.getMore()
    if (!data) {
      return
    }
    this.setData({
      topics: data.accumulator,
      hasMoreTopic: data.hasMore
    })
  },

  /**
   * 初始化评论
   */
  async initComments(userId) {
    const commentPaging = new Paging(api.commentAPI + "user/" + userId + "/")
    this.setData({
      commentPaging: commentPaging
    })
    await this.getMoreComments(commentPaging)
  },

  /**
   * 获取更多评论
   */
  async getMoreComments(commentPaging) {
    const data = await commentPaging.getMore()
    if (!data) {
      return
    }
    this.setData({
      comments: data.accumulator,
      hasMoreComment: data.hasMore
    })
  },

  /**
   * 初始化用户收藏
   */
  async initStars(userId) {
    const starPaging = new Paging(api.starAPI + "user/" + userId + "/")
    this.setData({
      starPaging: starPaging
    })
    await this.getMoreStars(starPaging)
  },

  /**
   * 获取更多收藏
   */
  async getMoreStars(starPaging) {
    const data = await starPaging.getMore()
    if (!data) {
      return
    }
    this.setData({
      stars: data.accumulator,
      hasMoreStar: data.hasMore
    })
  },

  /**
   * 点击关注或取消关注事件
   */
  onFollowTap() {
    const user = this.data.user

    if (user.has_follow) {
      wx.lin.showActionSheet({
        title: "确定要取消关注" + user.nick_name + "吗？",
        showCancel: true,
        cancelText: "放弃",
        itemList: [{
          name: "取消关注",
          color: "#666"
        }],
        success: () => {
          this.followOrCancel(user.id, "取消关注")
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
    wxutil.request.post(api.followingAPI, { "follow_user_id": userId }).then((res) => {
      if (res.code === 200) {
        wx.lin.showMessage({
          type: "success",
          content: msg + "成功！"
        })

        let user = this.data.user
        user.has_follow = !user.has_follow

        this.setData({
          user: user
        })
      } else if (res.message === "Can Not Following Yourself") {
        wx.lin.showMessage({
          type: "error",
          content: "不能关注自己！"
        })
      } else {
        wx.lin.showMessage({
          type: "error",
          content: msg + "失败！"
        })
      }
    })
  },

  /**
   * Tab切换
   */
  changeTabs(event) {
    const tabIndex = event.detail.currentIndex
    this.setData({
      tabIndex: tabIndex
    })
  },

  /**
   * 触底加载
   */
  async onReachBottom() {
    const tabIndex = this.data.tabIndex
    this.setData({
      loading: true
    })
    if (tabIndex === 0) {
      await this.getMoreTopics(this.data.topicPaging)
    }
    else if (tabIndex === 1) {
      await this.getMoreComments(this.data.commentPaging)
    }
    else if (tabIndex === 2) {
      await this.getMoreStars(this.data.starPaging)
    }
    this.setData({
      loading: false
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
    const user = this.data.user
    return {
      title: user.nick_name,
      imageUrl: user.avatar,
      path: "/pages/visiting-card/index?userId=" + user.id
    }
  }
})