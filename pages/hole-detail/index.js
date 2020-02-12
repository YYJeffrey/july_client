// pages/hole-detail/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    hole: {}
  },

  onLoad(options) {
    const holeId = options.holeId
    this.getHoleDetail(holeId)
  },

  /**
   * 获取树洞详情
   */
  getHoleDetail(holeId) {
    const url = api.holeAPI + holeId + "/"
    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          hole: res.data.data
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.hole.title,
      imageUrl: this.data.hole.poster,
      path: "/pages/hole-detail/index?holeId=" + this.data.hole.id
    }
  }
})