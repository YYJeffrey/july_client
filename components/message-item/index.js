// components/message-item/index.js
Component({
  properties: {
    message: Object
  },
  data: {

  },
  methods: {
    /**
     * 点击消息事件
     */
    onMessageTap() {
      this.triggerEvent("messageTap", { category: this.data.message.category, topicId: this.data.message.topic.id })
    },

    /**
     * 跳转话题详情页
     */
    gotoTopicDetail() {
      wx.navigateTo({
        url: "/pages/topic-detail/index?topicId=" + this.data.message.topic.id
      })
    }
  }
})
