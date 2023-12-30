// pages/topic-detail/index.js
import template from '../../config/template'
import wxutil from '../../miniprogram_npm/@yyjeffrey/wxutil/index'
import { Topic } from '../../models/topic'
import { Label } from '../../models/label'
import { Comment } from '../../models/comment'
import { Star } from '../../models/star'
const app = getApp()

Page({
  data: {
    stars: [],
    comments: [],
    labels: [],
    topic: null,
    comment: null,
    commentId: null,
    commentPaging: null,  // 评论分页器
    focus: false, // 获取焦点
    isAdmin: false, // 是否为平台管理员
    hasMore: false, // 是否还有更多数据
    height: 1000, // 内容区高度
    toIndex: 0, // 滚动至元素坐标
    userId: null,
    placeholder: '说说你的想法'
  },

  onLoad(options) {
    const focus = options.focus
    // 获取焦点拉起键盘
    if (focus) {
      this.setData({
        focus: true
      })
    }
    this.getTopicDetail(options.topicId)
  },

  onShow() {
    this.getUserInfo()
  },

  /**
   * 获取窗口高度
   */
  getScrollHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const windowHeight = systemInfo.windowHeight

    const query = wx.createSelectorQuery()
    query.select('.edit-item').boundingClientRect(rect => {
      const editHeight = rect.height
      this.setData({
        height: windowHeight - editHeight
      })
    }).exec()
  },

  /**
   * 获取标签
   */
  async getLabels(topicId) {
    const labels = await Label.getLabelList({ topic_id: topicId })
    this.setData({
      labels: labels
    })
  },

  /**
   * 获取动态详情
   */
  async getTopicDetail(topicId) {
    const topic = await Topic.getTopicDetail(topicId)

    this.setData({
      topic: topic
    })
    this.getLabels(topic.id)
    this.initComments(topic.id)
    this.getStars(topic.id)
    this.getScrollHeight()
  },

  /**
   * 初始化评论
   */
  async initComments(topicId) {
    const commentPaging = await Comment.getCommentPaging({ topic_id: topicId })

    this.setData({
      commentPaging: commentPaging,
    })
    await this.getMoreComments(commentPaging)
  },

  /**
   * 加载更多评论
   */
  async getMoreComments() {
    const data = await this.data.commentPaging.getMore()
    if (!data) {
      return
    }

    this.setData({
      hasMore: data.hasMore,
      comments: data.accumulator
    })
  },

  /**
   * 获取收藏
   */
  async getStars(topicId) {
    // 满载所有收藏
    const starCount = this.data.topic.star_count
    if (starCount === 0) {
      return
    }

    const res = await (await Star.getStarPaging({ topic_id: topicId }, 1, starCount)).getMore()
    this.setData({
      stars: res.items
    })
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    if (app.globalData.userDetail) {
      this.setData({
        userId: app.globalData.userDetail.id,
        isAdmin: app.globalData.userDetail.is_admin
      })
    } else {
      this.setData({
        userId: null,
        isAdmin: false
      })
    }
  },

  /**
   * 跳转话题页
   */
  onTagTap(event) {
    wxutil.setStorage('labelId', event.detail.labelId)
    wx.switchTab({
      url: '/pages/topic/index'
    })
  },

  /**
   * 点击评论列表
   */
  onCommentItemTap(event) {
    this.setData({
      focus: true,
      commentId: event.detail.commentId,
      placeholder: '@' + event.detail.nickname,
    })
  },

  /**
   * 点击收藏
   */
  async onStarTap() {
    const topic = this.data.topic
    const res = await Star.starOrCancel(topic.id)

    if (res.code === 0) {
      const hasStar = topic.starred
      topic.starred = !topic.starred

      if (hasStar) {
        topic.star_count--
      } else {
        topic.star_count++
      }

      this.setData({
        topic: topic
      })
    }
  },

  /**
   * 显示操作菜单
   */
  showActions() {
    const topic = this.data.topic

    let itemList = [{
      icon: '',
      name: '分享',
      color: '#666',
      openType: 'share'
    }, {
      icon: '',
      openType: '',
      name: '举报',
      color: '#666'
    }]

    if (this.data.userId === topic.user.id || this.data.isAdmin) {
      itemList.push({
        icon: '',
        openType: '',
        name: '删除',
        color: '#d81e06'
      })
    }

    wx.lin.showActionSheet({
      itemList: itemList,
      showCancel: true,
      success: (res) => {
        if (res.index === 1) {
          this.reportTopic(topic.id)
        } else if (res.index === 2) {
          this.deleteTopic(topic.id)
        }
      }
    })
  },

  /**
   * 举报话题
   */
  reportTopic(topicId) {
    const dialog = this.selectComponent('#dialog')

    dialog.linShow({
      type: 'confirm',
      title: '提示',
      content: '确定要举报该话题？',
      success: async (res) => {
        if (res.confirm) {
          const res = await Topic.reportTopic(topicId)
          if (res.code === 0) {
            wx.lin.showMessage({
              type: 'success',
              content: '举报成功！'
            })
          } else {
            wx.lin.showMessage({
              type: 'error',
              content: '举报失败！'
            })
          }
        }
      }
    })
  },

  /**
   * 删除话题
   */
  deleteTopic(topicId) {
    const dialog = this.selectComponent('#dialog')

    dialog.linShow({
      type: 'confirm',
      title: '提示',
      content: '确定要删除该话题？',
      success: async (res) => {
        if (res.confirm) {
          const res = await Topic.deleteTopic(topicId)
          if (res.code === 3) {
            wx.lin.showMessage({
              type: 'success',
              content: '删除成功！',
              success: () => {
                wxutil.setStorage('refreshTopics', true)
                wx.navigateBack()
              }
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
   * 点击评论图标
   */
  onCommentIconTap() {
    this.setData({
      focus: true,
      commentId: null,
      placeholder: '说说你的想法'
    })
  },

  /**
   * 设置评论
   */
  setComment(event) {
    this.setData({
      comment: event.detail.value
    })
  },

  /**
   * 发送评论
   */
  onCommntBtnTap() {
    if (!app.globalData.userDetail) {
      wx.navigateTo({
        url: '/pages/auth/index'
      })
    }

    const content = this.data.comment
    if (!wxutil.isNotNull(content)) {
      wx.lin.showMessage({
        type: 'error',
        content: '内容不能为空！'
      })
      return
    }

    // 授权订阅消息
    wx.requestSubscribeMessage({
      tmplIds: [template.messageTemplateId],
      complete: async () => {
        // 发送评论
        const topic = this.data.topic
        const data = {
          content: content,
          topic_id: topic.id
        }

        if (this.data.commentId) {
          data.comment_id = this.data.commentId
        }

        const res = await Comment.sendComment(data)
        if (res.code === 1) {
          wx.lin.showMessage({
            type: 'success',
            content: '评论成功！'
          })

          this.initComments(topic.id)
          this.scrollToBottom()

          topic.commented = true
          topic.comment_count++

          this.setData({
            topic: topic,
            comment: null,
            commentId: null,
            placeholder: '说说你的想法'
          })
        } else {
          wx.lin.showMessage({
            type: 'error',
            content: '评论失败！'
          })
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
          const commentId = event.detail.commentId
          const res = await Comment.deleteComment(commentId)
          if (res.code == 3) {
            this.getTopicDetail(this.data.topic.id)

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
   * 自动滚动至底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.setData({
        toIndex: this.data.comments.length - 1
      })
    }, 1000)
  },

  onShareAppMessage() {
    const topic = this.data.topic
    return {
      title: topic.content,
      imageUrl: topic.images.length > 0 ? topic.images[0] : (topic.video ? topic.video.cover : ''),
      path: '/pages/topic-detail/index?topicId=' + topic.id
    }
  },

  onShareTimeline() {
    const topic = this.data.topic
    return {
      title: topic.content,
      query: 'topicId=' + topic.id,
      imageUrl: topic.images.length > 0 ? topic.images[0] : (topic.video ? topic.video.cover : '')
    }
  }
})
