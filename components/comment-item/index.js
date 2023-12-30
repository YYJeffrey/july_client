// components/comment-item/index.js
Component({
  properties: {
    comment: Object,
    // 是否存在边框
    hasBorder: {
      type: Boolean,
      value: true
    },
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
     * 点击评论事件
     */
    onCommentTap() {
      this.triggerEvent('commentTap', { commentId: this.data.comment.id, nickname: this.data.comment.user.nickname })
    },

    /**
     * 点击删除事件
     */
    onDeleteTap() {
      this.triggerEvent('deleteTap', { commentId: this.data.comment.id })
    }
  }
})
