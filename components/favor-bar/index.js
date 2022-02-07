// components/favor-bar/index.js
Component({
  properties: {
    commentCount: {
      type: Number,
      value: 0
    },
    starCount: {
      type: Number,
      value: 0
    },
    viewCount: {
      type: Number,
      value: 0
    },
    hasComment: {
      type: Boolean,
      value: false
    },
    hasStar: {
      type: Boolean,
      value: false
    },
    hasView: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    /**
     * 点击评论图标事件
     */
    onCommentIconTap() {
      this.triggerEvent("commentIconTap", {}, { bubbles: true, composed: true })
    },

    /**
     * 点击收藏图标事件
     */
    onStarIconTap() {
      this.triggerEvent("starIconTap", {}, { bubbles: true, composed: true })
    },

    /**
     * 点击浏览图标事件
     */
    onViewIconTap() {
      this.triggerEvent("viewIconTap", {}, { bubbles: true, composed: true })
    }
  }
})
