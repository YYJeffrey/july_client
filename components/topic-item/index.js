// components/topic-item/index.js
Component({
  externalClasses: ['topic-item-class'],
  properties: {
    topic: Object,
    labels: Array,
    // 最大内容显示字数
    maxContentLen: {
      type: Number,
      value: 180
    },
    // 是否为内容所有者
    isOwner: {
      type: Boolean,
      value: false
    },
    // 是否可跳转详情页
    isLink: {
      type: Boolean,
      value: true
    },
    // 是否显示全部内容
    showDetail: {
      type: Boolean,
      value: false
    },
    // 是否显示标签栏
    showTags: {
      type: Boolean,
      value: false
    },
    // 是否自动播放视频
    autoplay: {
      type: Boolean,
      value: false
    },
    // 是否静音播放视频
    muted: {
      type: Boolean,
      value: false
    }
  },
  data: {
    expand: false,  // 是否展开内容
  },
  methods: {
    /**
     * 点击更多图标事件
     */
    onMoreIconTap() {
      this.triggerEvent('moreIconTap')
    },

    /**
     * 点击标签事件
     */
    onTagTap(event) {
      this.triggerEvent('tagTap', { labelId: event.target.dataset.labelId })
    },

    /**
     * 切换内容展开状态
     */
    onExpandTap() {
      const topic = this.data.topic
      topic.expand = !topic.expand

      this.setData({
        topic: topic
      })
    },

    /**
     * 跳转话题详情页
     */
    gotoTopicDetail() {
      if (!this.data.isLink) {
        return
      }

      const topic = this.data.topic
      topic.click_count++
      this.setData({
        topic: topic
      })

      wx.navigateTo({
        url: `/pages/topic-detail/index?topicId=${topic.id}`
      })
    },

    /**
     * 图片预览
     */
    previewImage(event) {
      wx.previewImage({
        current: event.currentTarget.dataset.src,
        urls: this.data.topic.images
      })
    },

    /**
     * 无操作事件
     */
    doNothing() { }
  }
})
