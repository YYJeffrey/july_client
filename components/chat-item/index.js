// components/chat-item/index.js
Component({
  properties: {
    chat: Object,
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
     * 图片预览
     */
    previewImage() {
      wx.previewImage({
        urls: [this.data.chat.data]
      })
    }
  }
})
