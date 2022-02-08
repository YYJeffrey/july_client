// components/profile-topic/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

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
        url: "/pages/topic-detail/index?topicId=" + topics[index].id
      })
    },

    /**
     * 删除话题
     */
    onDeleteTap(event) {
      const dialog = this.selectComponent('#dialog')

      dialog.linShow({
        type: "confirm",
        title: "提示",
        content: "确定要删除该话题？",
        success: (res) => {
          if (res.confirm) {
            const topics = this.data.topics
            const index = event.currentTarget.dataset.index

            wxutil.request.delete(api.topicAPI + topics[index].id + "/").then((res) => {
              if (res.code === 200) {
                topics.splice(index, 1)
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
            })
          }
        }
      })
    }
  }
})
