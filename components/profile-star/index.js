// components/profile-star/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

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
     * 取消收藏
     */
    onDeleteTap(event) {
      const dialog = this.selectComponent('#dialog')

      dialog.linShow({
        type: "confirm",
        title: "提示",
        content: "确定要取消收藏该话题？",
        success: (res) => {
          if (res.confirm) {
            const stars = this.data.stars
            const index = event.currentTarget.dataset.index

            wxutil.request.post(api.starAPI, { topic_id: stars[index].topic.id }).then((res) => {
              if (res.code === 200) {
                stars.splice(index, 1)
                this.setData({
                  stars: stars
                })

                wx.lin.showMessage({
                  type: "success",
                  content: "取消成功！"
                })
              } else {
                wx.lin.showMessage({
                  type: "error",
                  content: "取消失败！"
                })
              }
            })
          }
        }
      })
    }
  }
})
