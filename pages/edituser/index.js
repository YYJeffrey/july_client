// pages/edituser/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    userDetail: []
  },

  onLoad() {
    this.getUserDetail()
  },

  /**
   * 获取用户详情
   */
  getUserDetail() {
    const userId = wxutil.getStorage("userDetail").id
    const url = api.userAPI + userId + "/"

    wxutil.request.get(url).then((res) => {
      if (res.data.code === 200) {
        this.setData({
          userDetail: res.data.data
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "编辑资料",
      path: "/pages/edituser/index"
    }
  }
})