// pages/profile/index.js
import api from '../../config/api'
import wxutil from '../../miniprogram_npm/@yyjeffrey/wxutil/index'
import { init, upload } from '../../utils/qiniuUploader'
import { User } from '../../models/user'
import { Topic } from '../../models/topic'
import { Comment } from '../../models/comment'
import { Star } from '../../models/star'
import { Message } from '../../models/message'
import { OSS } from '../../models/oss'
const app = getApp()

Page({
  data: {
    user: null,
    topics: [],
    comments: [],
    stars: [],
    tabIndex: 0,  // Tabs选中的栏目
    tabsTop: 300, // Tabs距离顶部的高度
    showImageClipper: false, // 是否显示图片裁剪器
    tmpAvatar: '', // 头像临时文件
    messageBrief: null, // 动态消息概要
    topicPaging: null,  // 话题分页器
    commentPaging: null,  // 评论分页器
    starPaging: null, // 收藏分页器
    hasMoreTopic: true, // 是否还有更多话题
    hasMoreComment: true, // 是否还有更多评论
    hasMoreStar: true, // 是否还有更多收藏
    tabsFixed: false, // Tabs是否吸顶
    loading: false
  },

  onLoad() {
    this.getUserInfo()
  },

  onShow() {
    this.getUserInfo(false)
    this.getMessages()
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
  async getUserInfo(loadPage = true) {
    let userDetail = app.globalData.userDetail
    if (!userDetail) {
      this.setData({
        user: null,
        topics: [],
        comments: [],
        stars: []
      })
      return
    }

    const userId = userDetail.id
    const user = await User.getUserInfo(userId)
    // 更新缓存
    userDetail = Object.assign(userDetail, user)
    const deadtime = wxutil.getStorage('userDetail_deadtime')
    wxutil.setStorage('userDetail', userDetail)
    wxutil.setStorage('userDetail_deadtime', deadtime)

    app.globalData.userDetail = userDetail
    this.setData({
      user: userDetail
    })

    if (loadPage) {
      this.getTabsTop()
      wx.setNavigationBarTitle({
        title: userDetail.nickname
      })
    }

    this.initTopics(userId)
    this.initComments(userId)
    this.initStars(userId)
  },

  /**
   * 初始化七牛云配置
   */
  async initQiniu() {
    const uptoken = await OSS.getQiniu()
    const options = {
      region: 'ECN',
      uptoken: uptoken,
      domain: api.ossDomain,
      shouldUseQiniuFileName: false
    }
    init(options)
  },

  /**
   * 媒体文件上传至OSS
   */
  sendMedia(imageFile, path) {
    return new Promise((resolve, reject) => {
      upload(imageFile, (res) => {
        resolve(res.imageURL)
      }, (error) => {
        reject(error)
      }, {
        region: 'ECN',
        uptoken: null,
        domain: null,
        shouldUseQiniuFileName: false,
        key: path + '/' + wxutil.getUUID(false)
      })
    })
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
   * 获取消息并标红点
   */
  async getMessages() {
    if (!app.globalData.userDetail) {
      return
    }

    const data = await Message.getMessages()
    if (data && data.length > 0) {
      this.setData({
        messageBrief: data
      })
      wx.setTabBarBadge({
        index: 2,
        text: data.length.toString()
      })
    } else {
      this.setData({
        messageBrief: null
      })
      wx.removeTabBarBadge({
        index: 2
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
   * 跳转消息页
   */
  gotoMessage() {
    wx.navigateTo({
      url: '/pages/message/index'
    })
  },

  /**
   * 修改封面
   */
  async changePoster() {
    if (!this.data.user) {
      return
    }
    wx.lin.showMessage({
      content: '设置封面图片'
    })

    // 上传封面
    wxutil.image.choose(1).then(async res => {
      if (res.errMsg !== 'chooseImage:ok') {
        return
      }

      wxutil.showLoading('上传中...')
      await this.initQiniu()
      const poster = await this.sendMedia(res.tempFilePaths[0], 'poster')

      const data = {
        avatar: this.data.user.avatar,
        nickname: this.data.user.nickname,
        signature: this.data.user.signature,
        gender: this.data.user.gender,
        poster: poster
      }
      const info = await User.updateUser(data)
      if (info.code === 2) {
        this.getUserInfo(false)

        wx.lin.showMessage({
          type: 'success',
          content: '封面修改成功！',
        })
      } else {
        wx.lin.showMessage({
          type: 'error',
          content: '封面修改失败！'
        })
      }
      wx.hideLoading()
    })
  },

  /**
   * 修改头像
   */
  changeAvatar(event) {
    if (!this.data.user) {
      return
    }
    wx.lin.showMessage({
      content: '设置头像图片'
    })
    this.setData({
      tmpAvatar: event.detail.detail.avatarUrl,
      showImageClipper: true
    })
  },

  /**
   * 头像裁剪上传
   */
  async onClipTap(event) {
    wxutil.showLoading('上传中...')
    await this.initQiniu()
    const avatar = await this.sendMedia(event.detail.url, 'avatar')

    // 更新用户信息
    const data = {
      avatar: avatar,
      nickname: this.data.user.nickname,
      signature: this.data.user.signature,
      gender: this.data.user.gender
    }
    const res = await User.updateUser(data)
    if (res.code === 2) {
      this.getUserInfo(false)

      wx.lin.showMessage({
        type: 'success',
        content: '头像修改成功！',
      })
    } else {
      wx.lin.showMessage({
        type: 'error',
        content: '头像修改失败！'
      })
    }
    wx.hideLoading()

    this.setData({
      showImageClipper: false,
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

  /**
   * 删除话题
   */
  deleteTopic(event) {
    const dialog = this.selectComponent('#dialog')

    dialog.linShow({
      type: 'confirm',
      title: '提示',
      content: '确定要删除该话题？',
      success: async (res) => {
        if (res.confirm) {
          const topics = this.data.topics
          const index = event.detail.index

          const res = await Topic.deleteTopic(topics[index].id)
          if (res.code === 3) {
            topics.splice(index, 1)
            this.setData({
              topics: topics
            })

            wx.lin.showMessage({
              type: 'success',
              content: '删除成功！'
            })
          } else {
            wx.lin.showMessage({
              type: 'error',
              content: '删除失败！'
            })
          }
        }
      }
    })
  },

  /**
   * 删除评论
   */
  deleteComment(event) {
    const dialog = this.selectComponent('#dialog')

    dialog.linShow({
      type: 'confirm',
      title: '提示',
      content: '确定要删除该评论？',
      success: async (res) => {
        if (res.confirm) {
          const comments = this.data.comments
          const index = event.detail.index

          const res = await Comment.deleteComment(comments[index].id)
          if (res.code === 3) {
            comments.splice(index, 1)
            this.setData({
              comments: comments
            })

            wx.lin.showMessage({
              type: 'success',
              content: '删除成功！'
            })
          } else {
            wx.lin.showMessage({
              type: 'error',
              content: '删除失败！'
            })
          }
        }
      }
    })
  },

  /**
   * 取消收藏
   */
  deleteStar(event) {
    const dialog = this.selectComponent('#dialog')

    dialog.linShow({
      type: 'confirm',
      title: '提示',
      content: '确定要取消收藏该话题？',
      success: async (res) => {
        if (res.confirm) {
          const stars = this.data.stars
          const index = event.detail.index

          const res = await Star.starOrCancel(stars[index].topic.id)
          if (res.code === 0) {
            stars.splice(index, 1)
            this.setData({
              stars: stars
            })

            wx.lin.showMessage({
              type: 'success',
              content: '取消成功！'
            })
          } else {
            wx.lin.showMessage({
              type: 'error',
              content: '取消失败！'
            })
          }
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

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getUserInfo(false)
    this.getMessages()
    wx.stopPullDownRefresh()
    wx.vibrateShort()
  },

  onShareAppMessage() {
    return {
      title: '个人中心',
      path: '/pages/profile/index'
    }
  }
})
