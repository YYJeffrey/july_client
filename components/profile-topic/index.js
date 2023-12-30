// components/profile-topic/index.js
const app = getApp()

Component({
  properties: {
    topics: Array,
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
      const topics = this.data.topics
      const index = event.currentTarget.dataset.index

      wx.navigateTo({
        url: `/pages/topic-detail/index?topicId=${topics[index].id}`
      })
    },

    /**
     * 点击删除话题事件
     */
    onDeleteTap(event) {
      this.triggerEvent('deleteTap', { index: event.currentTarget.dataset.index })
    }
  }
})
