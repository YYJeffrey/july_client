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
     * 删除评论
     */
    onDeleteTap(event) {
      const dialog = this.selectComponent('#dialog')

      dialog.linShow({
        type: "confirm",
        title: "提示",
        content: "确定要删除该评论？",
        success: (res) => {
          if (res.confirm) {
            const comments = this.data.comments
            const index = event.currentTarget.dataset.index

            wxutil.request.delete(api.commentAPI + comments[index].id + "/").then((res) => {
              if (res.code === 200) {
                comments.splice(index, 1)
                this.setData({
                  comments: comments
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
            })
          }
        }
      })
    }
  }
})
