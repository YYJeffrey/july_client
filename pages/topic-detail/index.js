// pages/topic-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const pageSize = 16 // 每页显示条数

Page({
  data: {
    topic: {},
    comments: [],
    stars: [],
    actionList: [{
      name: "分享",
      color: "#666",
      openType: "share"
    }, {
      name: "举报",
      color: "#666"
    }],
    placeholder: "评论点什么吧...",
    page: 1,
    comment: null,
    commentId: null,
    commentTemplateId: null, // 评论模板ID
    focus: false, // 获取焦点
    showAction: false, // 操作菜单
    isEnd: false // 是否到底
  },

  onLoad(options) {
    const topicId = options.topicId
    const focus = options.focus

    // 评论获取焦点展开键盘
    if (focus) {
      this.setData({
        focus: true
      })
    }

    this.getTopicDetail(topicId)
  },

  /**
   * 获取动态详情
   */
  getTopicDetail(topicId) {
    const url = api.topicAPI + topicId + "/"
    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        const topic = res.data.data
        this.setData({
          topic: topic
        })
        if ("id" in topic) {
          this.getComments(topicId)
          this.getStars(topicId)
          this.getTemplateId()
        }
      }
    })
  },

  /**
   * 获取评论
   */
  getComments(topicId, page = 1, size = pageSize) {
    const url = api.commentAPI + "topic/" + topicId + "/"
    let data = {
      size: size,
      page: page
    }

    if (this.data.isEnd && page != 1) {
      return
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        const comments = res.data.data
        this.setData({
          page: (comments.length == 0 && page != 1) ? page - 1 : page,
          isEnd: ((comments.length < pageSize) || (comments.length == 0 && page != 1)) ? true : false,
          comments: page == 1 ? comments : this.data.comments.concat(comments)
        })
      }
    })
  },

  /**
   * 加载更多评论
   */
  getMoreComments() {
    const page = this.data.page
    const topicId = this.data.topic.id
    this.getComments(topicId, page + 1)
  },

  /**
   * 获取收藏
   */
  getStars(topicId) {
    const url = api.starAPI + "topic/" + topicId + "/"

    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          stars: res.data.data
        })
      }
    })
  },

  /**
   * 获取评论模板ID
   */
  getTemplateId(title = "评论模板") {
    const url = api.templateAPI

    const data = {
      title: title
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          commentTemplateId: res.data.data.template_id
        })
      }
    })
  },

  /**
   * 图片预览
   */
  previewImage(event) {
    const current = event.currentTarget.dataset.src
    const urls = this.data.topic.images

    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  /**
   * 点击更多
   */
  onMoreTap() {
    this.setData({
      showAction: true
    })
  },

  /**
   * 关闭操作菜单
   */
  onCancelSheetTap() {
    this.setData({
      showAction: false
    })
  },

  /**
   * 跳转话题页面
   */
  gotoTopic(event) {
    const labelId = event.currentTarget.dataset.label
    wxutil.setStorage("labelId", labelId)
    wx.switchTab({
      url: "/pages/topic/index"
    })
  },

  /**
   * 点赞或取消点赞
   */
  onStarTap(event) {
    let topic = this.data.topic
    const url = api.starAPI

    const data = {
      topic_id: topic.id
    }

    wxutil.request.post(url, data).then((res) => {
      if (res.data.code == 200) {
        // 重新获取收藏列表
        this.getStars(topic.id)

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
   * 点击评论列表
   */
  onCommentItemTap(event) {
    const index = event.currentTarget.dataset.index
    this.setData({
      focus: true,
      commentId: this.data.comments[index].id,
      placeholder: "@" + this.data.comments[index].user.nick_name
    })
  },

  /**
   * 点击评论
   */
  onCommentTap(event) {
    this.setData({
      focus: true,
      commentId: null,
      placeholder: "评论点什么吧..."
    })
  },

  /**
   * 设置评论
   */
  inputComment(event) {
    this.setData({
      comment: event.detail.value
    })
  },

  /**
   * 发送评论
   */
  onCommntBtnTap() {
    const comment = this.data.comment
    if (!wxutil.isNotNull(comment)) {
      wx.lin.showMessage({
        type: "error",
        content: "评论不能为空！"
      })
      return
    }

    // 授权模板消息
    const templateId = this.data.commentTemplateId
    const that = this

    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      complete() {
        // 发送评论
        const url = api.commentAPI
        let topic = that.data.topic
        const topicId = topic.id
        let data = {
          content: comment,
          topic_id: topicId
        }

        if (that.data.commentId) {
          data["comment_id"] = that.data.commentId
        }

        wxutil.request.post(url, data).then((res) => {
          if (res.data.code == 200) {
            wx.lin.showMessage({
              type: "success",
              content: "评论成功！"
            })
            // 重新获取评论列表
            that.getComments(topicId)
            setTimeout(function() {
              wx.pageScrollTo({
                scrollTop: 1000
              })
            }, 1000)

            topic.has_comment = true
            topic.comment_count++

              that.setData({
                topic: topic,
                comment: null,
                commentId: null,
                placeholder: "评论点什么吧..."
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

  onShareAppMessage() {
    return {
      title: this.data.topic.content,
      imageUrl: this.data.topic.images ? this.data.topic.images[0] : '',
      path: "/pages/topic-detail/index?topicId=" + this.data.topic.id
    }
  }
})