// components/profile-comment/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Component({
  properties: {
    comments: Array,
    // 是否为内容所有者
    isOwner: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    /**
     * 跳转话题详情页
     */
    gotoTopicDetail(event) {
      const index = event.currentTarget.dataset.index
      const comments = this.data.comments

      wx.navigateTo({
        url: "/pages/topic-detail/index?topicId=" + comments[index].topic.id
      })
    },

    /**
     * 点击删除评论事件
     */
    onDeleteTap(event) {
      this.triggerEvent("deleteTap", { index: event.currentTarget.dataset.index })
    }
  }
})
