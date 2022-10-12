// components/profile-star/index.js
const app = getApp()

Component({
  properties: {
    stars: Array,
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
      const stars = this.data.stars

      wx.navigateTo({
        url: "/pages/topic-detail/index?topicId=" + stars[index].topic.id
      })
    },

    /**
     * 点击取消收藏事件
     */
    onDeleteTap(event) {
      this.triggerEvent("deleteTap", { index: event.currentTarget.dataset.index })
    }
  }
})
