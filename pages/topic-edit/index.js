// pages/topic-edit/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    labels: [],
    chooseCount: 0,
    canAnon: false
  },

  onLoad() {
    this.getLabels()
  },

  /**
   * 获取标签
   */
  getLabels() {
    const that = this
    const url = api.labelAPI
    const data = {
      app_id: app.globalData.appId
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          labels: res.data.data
        })
      }
    })
  },

  /**
   * 选择标签
   */
  chooseTag(event) {
    const labelId = event.currentTarget.dataset.label
    let chooseCount = this.data.chooseCount
    let labels = this.data.labels
    let canAnon = true

    for (let i = 0; i < labels.length; i++) {
      if (labelId == labels[i].id) {
        const active = labels[i].active
        if (active) {
          chooseCount--
          labels[i].active = !active
        } else {
          if (chooseCount == 3) {
            wx.lin.showMessage({
              type: "error",
              content: "最多选择3个标签！"
            })
          } else {
            chooseCount++
            labels[i].active = !active
          }
        }
      }
    }
    for (let i = 0; i < labels.length; i++) {
      if (labels[i].active && !labels[i].allowed_anon) {
        canAnon = false
        break
      }
    }

    this.setData({
      labels: labels,
      canAnon: canAnon,
      chooseCount: chooseCount
    })
  },

  onShareAppMessage() {

  }
})