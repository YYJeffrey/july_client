// pages/topic/index.js
import wxutil from "../../miniprogram_npm/@yyjeffrey/wxutil/index"
import { Label } from "../../models/label"
import { Message } from "../../models/message"
import { Star } from "../../models/star"
import { Topic } from "../../models/topic"
const app = getApp()

Page({
  data: {
    labels: [],
    topics: [],
    labelId: -1,
    userId: -1,
    topicPaging: null,  // 话题分页器
    isAdmin: false, // 是否为平台管理员
    hasMore: true, // 是否还有更多数据
    loading: false, // 是否正在加载
  },

  onLoad() {
    this.getLabels()
    this.initTopics()
  },

  onShow() {
    this.getUserInfo()
    this.getMsgBrief()
    this.reInitTopics()
  },

  /**
   * 获取标签
   */
  async getLabels() {
    const data = await Label.getLabelList(app.globalData.appId)
    let labels = [{
      id: -1,
      name: "全部"
    }]
    this.setData({
      labels: labels.concat(data)
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
        userId: -1,
        isAdmin: false
      })
    }
  },

  /**
   * 获取消息概要并标红点
   */
  async getMsgBrief() {
    if (!app.globalData.userDetail) {
      return
    }

    const data = await Message.getMessageBrief()
    if (data.count > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: data.count.toString()
      })
    } else {
      wx.removeTabBarBadge({
        index: 2
      })
    }
  },

  /**
   * 初始化话题
   */
  async initTopics(labelId = -1) {
    const params = { app_id: app.globalData.appId }
    if (labelId !== -1) {
      params.label_id = labelId
    }
    const topicPaging = await Topic.getTopicPaging(params)
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
      hasMore: data.hasMore
    })
  },

  /**
   * 重新初始化话题
   */
  reInitTopics() {
    // 由于 wx.switchTab() 传参限制，只能使用缓存获取参数
    const refresh = wxutil.getStorage("refreshTopics")
    const labelId = wxutil.getStorage("labelId")

    if (refresh) {
      wx.removeStorageSync("refreshTopics")
      this.setData({
        labelId: -1
      })
      this.initTopics()
    }

    if (labelId) {
      wx.removeStorageSync("labelId")
      this.setData({
        labelId: labelId
      })
      this.initTopics(labelId)
    }
  },

  /**
   * 标签切换
   */
  onTagTap(event) {
    const labelId = event.detail.activeLabelId
    this.setData({
      labelId: labelId
    })
    this.initTopics(labelId)
  },

  /**
   * 显示操作菜单
   */
  showActions(event) {
    const index = event.currentTarget.dataset.index
    const topics = this.data.topics
    const topic = topics[index]
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
          this.deleteTopic(topic.id, index)
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
      success: async (res) => {
        if (res.confirm) {
          const res = await Topic.reportTopic(topicId)
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
        }
      }
    })
  },

  /**
   * 删除话题
   */
  deleteTopic(topicId, topicIndex) {
    const dialog = this.selectComponent('#dialog')
    const topics = this.data.topics

    dialog.linShow({
      type: "confirm",
      title: "提示",
      content: "确定要删除该话题？",
      success: async (res) => {
        if (res.confirm) {
          const res = await Topic.deleteTopic(topicId)
          if (res.code === 200) {
            topics.splice(topicIndex, 1)
            this.setData({
              topics: topics
            })
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
        }
      }
    })
  },

  /**
   * 跳转话题详情页
   */
  gotoTopicDetail(event) {
    const index = event.currentTarget.dataset.index
    const topics = this.data.topics
    const topic = topics[index]
    let url = "/pages/topic-detail/index?"

    if (event.type === "commentIconTap") {
      url += "focus=true&"
    }
    topic.click_count++
    this.setData({
      topics: topics
    })

    wx.navigateTo({
      url: url + "topicId=" + topic.id
    })
  },

  /**
   * 点击收藏
   */
  async onStarTap(event) {
    const index = event.currentTarget.dataset.index
    const topics = this.data.topics
    const topic = topics[index]

    const res = await Star.starOrCancel(topic.id)
    if (res.code === 200) {
      const hasStar = topic.has_star
      topic.has_star = !topic.has_star

      if (hasStar) {
        topic.star_count--
      } else {
        topic.star_count++
      }

      this.setData({
        topics: topics
      })
    }
  },

  /**
   * 跳转话题编辑页或授权页
   */
  onEditTap() {
    const url = "/pages/topic-edit/index"
    if (app.globalData.userDetail) {
      wx.navigateTo({
        url: url
      })
    } else {
      wx.navigateTo({
        url: `/pages/auth/index?goto=${encodeURIComponent(url)}`
      })
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.initTopics(this.data.labelId)
    wx.stopPullDownRefresh()
    // 振动交互
    wx.vibrateShort()
  },

  /**
   * 触底加载
   */
  async onReachBottom() {
    const topicPaging = this.data.topicPaging
    this.setData({
      loading: true
    })
    await this.getMoreTopics(topicPaging)
    this.setData({
      loading: false
    })
  },

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})
