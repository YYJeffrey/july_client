// pages/visiting-card/index.js
import { User } from '../../models/user'
import { Following } from '../../models/following'
import { Topic } from '../../models/topic'
import { Comment } from '../../models/comment'
import { Star } from '../../models/star'
const app = getApp()

Page({
  data: {
    user: null,
    topics: [],
    comments: [],
    stars: [],
    tabIndex: 0,  // Tabs选中的栏目
    tabsTop: 300, // Tabs距离顶部的高度
    genderText: 'Ta', // 性别文本
    topicPaging: null,  // 话题分页器
    commentPaging: null,  // 评论分页器
    starPaging: null, // 收藏分页器
    hasMoreTopic: true, // 是否还有更多话题
    hasMoreComment: true, // 是否还有更多评论
    hasMoreStar: true, // 是否还有更多收藏
    tabsFixed: false, // Tabs是否吸顶
    loading: false
  },

  onLoad(options) {
    if (options.userId !== '') {
      this.getUserInfo(options.userId)
    }
  },

  onShow() {
    if (!this.data.user) {
      return
    }
    this.getUserInfo(this.data.user.id, false)
  },

  /**
   * 计算Tabs距离顶部的高度
   */
  getTabsTop() {
    const query = wx.createSelectorQuery()
    query.select('#tabs').boundingClientRect((res) => {
      this.setData({
        tabsTop: res.top
      })
    }).exec()
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(userId, loadPage = true) {
    const user = await User.getUserInfo(userId)
    if (!user) {
      return
    }

    this.setData({
      user: user
    })

    if (loadPage) {
      this.getTabsTop()
      wx.setNavigationBarTitle({
        title: user.nickname
      })
    }

    this.initTopics(user.id)
    this.initComments(user.id)
    this.initStars(user.id)
  },

  /**
   * 初始化话题
   */
  async initTopics(userId) {
    const topicPaging = await Topic.getTopicPaging({ user_id: userId })

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
    const commentPaging = await Comment.getCommentPaging({ user_id: userId })

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
    const starPaging = await Star.getStarPaging({ user_id: userId })

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
    if (app.globalData.userDetail && app.globalData.userDetail.id === user.id) {
      wx.lin.showMessage({
        type: 'error',
        content: '不可以关注自己哦！'
      })
      return
    }

    if (user.followed) {
      wx.lin.showActionSheet({
        title: '确定要取消关注' + user.nickname + '吗？',
        showCancel: true,
        cancelText: '放弃',
        itemList: [{
          name: '取消关注',
          color: '#666'
        }],
        success: () => {
          this.followOrCancel(user.id, '取消关注')
        }
      })
    } else {
      this.followOrCancel(user.id, '关注')
    }
  },

  /**
   * 关注或取关
   */
  async followOrCancel(userId, msg) {
    const res = await Following.followOrCancel(userId)
    if (res.code === 0) {
      wx.lin.showMessage({
        type: 'success',
        content: msg + '成功！'
      })

      const user = this.data.user
      user.followed = !user.followed

      this.setData({
        user: user
      })
    } else if (res.message === 'Can Not Following Yourself') {
      wx.lin.showMessage({
        type: 'error',
        content: '不能关注自己！'
      })
    } else {
      wx.lin.showMessage({
        type: 'error',
        content: msg + '失败！'
      })
    }
  },

  /**
   * Tab切换
   */
  changeTabs(event) {
    const tabIndex = event.detail.currentIndex

    this.setData({
      tabIndex: tabIndex
    })
    if (this.data.tabsFixed) {
      wx.pageScrollTo({
        scrollTop: this.data.tabsTop
      })
    }
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
      title: user.nickname,
      imageUrl: user.avatar,
      path: `/pages/visiting-card/index?userId=${user.id}`
    }
  }
})
