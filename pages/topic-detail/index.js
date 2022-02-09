// pages/topic-detail/index.js
import { Paging } from "../../utils/paging"
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    stars: [],
    comments: [],
    topic: null,
    comment: null,
    commentId: null,
    commentTemplateId: null, // 评论订阅消息ID
    commentPaging: null,  // 评论分页器
    focus: false, // 获取焦点
    isAdmin: false, // 是否为平台管理员
    hasMore: false, // 是否还有更多数据
    height: 1000, // 内容区高度
    toIndex: 0, // 滚动至元素坐标
    userId: -1,
    placeholder: "说说你的想法"
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
    query.select(".edit-item").boundingClientRect(rect => {
      const editHeight = rect.height
      this.setData({
        height: windowHeight - editHeight
      })
    }).exec()
  },

  /**
   * 获取动态详情
   */
  getTopicDetail(topicId) {
    wxutil.request.get(api.topicAPI + topicId + "/").then((res) => {
      if (res.code === 200) {
        const topic = res.data
        this.setData({
          topic: topic
        })
        this.initComments(topicId)
        this.getStars(topicId)
        this.getTemplateId()
        this.getScrollHeight()
      }
    })
  },

  /**
   * 初始化评论
   */
  async initComments(topicId) {
    const commentPaging = new Paging(api.commentAPI + "topic/" + topicId + "/")
    this.setData({
      commentPaging: commentPaging,
    })
    this.getMoreComments(commentPaging)
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
  getStars(topicId) {
    wxutil.request.get(api.starAPI + "topic/" + topicId + "/").then((res) => {
      if (res.code === 200) {
        this.setData({
          stars: res.data
        })
      }
    })
  },

  /**
   * 获取评论订阅消息ID
   */
  getTemplateId(title = "评论模板") {
    if (app.globalData.userDetail) {
      wxutil.request.get(api.templateAPI, { title: title }).then((res) => {
        if (res.code === 200) {
          this.setData({
            commentTemplateId: res.data.template_id
          })
        }
      })
    }
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
        userId: -1,
        isAdmin: false
      })
    }
  },

  /**
   * 跳转话题页
   */
  onTagTap(event) {
    wxutil.setStorage("labelId", event.detail.labelId)
    wx.switchTab({
      url: "/pages/topic/index"
    })
  },

  /**
   * 点击评论列表
   */
  onCommentItemTap(event) {
    this.setData({
      focus: true,
      commentId: event.detail.commentId,
      placeholder: "@" + event.detail.nickname,
    })
  },

  /**
   * 点击收藏
   */
  onStarTap() {
    const topic = this.data.topic

    wxutil.request.post(api.starAPI, { topic_id: topic.id }).then((res) => {
      if (res.code === 200) {
        const hasStar = topic.has_star
        topic.has_star = !topic.has_star

        if (hasStar) {
          topic.star_count--
        } else {
          topic.star_count++
        }

        this.setData({
          topic: topic
        })
      }
    })
  },

  /**
   * 显示操作菜单
   */
  showActions() {
    const topic = this.data.topic
    let itemList = [{
      name: "举报",
      color: "#666"
    }]

    if (this.data.userId === topic.user.id || this.data.isAdmin) {
      itemList.push({
        name: "删除",
        color: "#d81e06"
      })
    }

    wx.lin.showActionSheet({
      itemList: itemList,
      showCancel: true,
      success: (res) => {
        if (res.index === 0) {
          this.reportTopic(topic.id)
        } else if (res.index === 1) {
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
      type: "confirm",
      title: "提示",
      content: "确定要举报该话题？",
      success: (res) => {
        if (res.confirm) {
          wxutil.request.post(api.topicAPI + "report/", { topic_id: topicId }).then((res) => {
            if (res.code === 200) {
              wx.lin.showMessage({
                type: "success",
                content: "举报成功！"
              })
            } else {
              wx.lin.showMessage({
                type: "error",
                content: "举报失败！"
              })
            }
          })
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
      type: "confirm",
      title: "提示",
      content: "确定要删除该话题？",
      success: (res) => {
        if (res.confirm) {
          wxutil.request.delete(api.topicAPI + topicId + "/").then((res) => {
            if (res.code === 200) {
              wx.lin.showMessage({
                type: "success",
                content: "删除成功！",
                success: () => {
                  wxutil.setStorage("refreshTopics", true)
                  wx.navigateBack()
                }
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
   * 点击评论图标
   */
  onCommentIconTap() {
    this.setData({
      focus: true,
      commentId: null,
      placeholder: "说说你的想法"
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
    const content = this.data.comment
    if (!wxutil.isNotNull(content)) {
      wx.lin.showMessage({
        type: "error",
        content: "内容不能为空！"
      })
      return
    }

    // 授权订阅消息
    const templateId = this.data.commentTemplateId
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      complete: () => {
        // 发送评论
        const topic = this.data.topic
        const data = {
          content: content,
          topic_id: topic.id
        }

        if (this.data.commentId) {
          data.comment_id = this.data.commentId
        }

        wxutil.request.post(api.commentAPI, data).then((res) => {
          if (res.code === 200) {
            wx.lin.showMessage({
              type: "success",
              content: "评论成功！"
            })

            this.initComments(topic.id)
            this.scrollToBottom()

            topic.has_comment = true
            topic.comment_count++

            this.setData({
              topic: topic,
              comment: null,
              commentId: null,
              placeholder: "说说你的想法"
            })
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "评论失败！"
            })
          }
        })
      }
    })
  },

  /**
   * 删除评论
   */
  deleteComment(event) {
    const dialog = this.selectComponent('#dialog')

    dialog.linShow({
      type: "confirm",
      title: "提示",
      content: "确定要删除该评论？",
      success: (res) => {
        if (res.confirm) {
          const commentId = event.detail.commentId

          wxutil.request.delete(api.commentAPI + commentId + "/").then((res) => {
            if (res.code == 200) {
              this.getTopicDetail(this.data.topic.id)

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
   * 自动滚动至底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.setData({
        toIndex: this.data.comments.length - 1
      })
    }, 1000)
  },

  onShareTimeline() {
    const topic = this.data.topic
    return {
      title: topic.content,
      query: "topicId=" + topic.id,
      imageUrl: topic.images.length > 0 ? topic.images[0] : (topic.video ? topic.video.cover : '')
    }
  },

  onShareAppMessage() {
    const topic = this.data.topic
    return {
      title: topic.content,
      imageUrl: topic.images.length > 0 ? topic.images[0] : (topic.video ? topic.video.cover : ''),
      path: "/pages/topic-detail/index?topicId=" + topic.id
    }
  }
})