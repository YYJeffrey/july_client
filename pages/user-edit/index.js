// pages/user-edit/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    nickName: null,
    signature: null,
    gender: 0,
    userId: -1
  },

  onLoad() {
    this.getUserDetail()
  },

  /**
   * 获取用户详情
   */
  getUserDetail() {
    const userDetail = wxutil.getStorage("userDetail")
    const userId = userDetail.id
    const url = api.userAPI + userId + "/"

    wxutil.request.get(url).then((res) => {
      if (res.data.code == 200) {
        const user = res.data.data
        this.setData({
          userId: user.id,
          nickName: user.nick_name,
          gender: user.gender,
          signature: user.signature
        })
      }
    })
  },

  /**
   * 设置昵称
   */
  setNickName(event) {
    const nickName = event.detail.value
    this.setData({
      nickName: nickName
    })
  },

  /**
   * 设置性别
   */
  onChangeGenderTap(event) {
    const gender = event.detail.key
    this.setData({
      gender: gender
    })
  },

  /**
   * 设置个性签名
   */
  setSignature(event) {
    const signature = event.detail.value
    this.setData({
      signature: signature
    })
  },

  /**
   * 保存用户信息
   */
  saveInfo() {
    // 获取表单数据
    const nickName = this.data.nickName
    const gender = this.data.gender
    const signature = this.data.signature

    if (!wxutil.isNotNull(nickName)) {
      wx.lin.showMessage({
        type: "error",
        content: "昵称不能为空！"
      })
      return
    }

    // 请求体数据
    const url = api.userAPI
    const data = [{
      op: "replace",
      path: "/nick_name",
      value: nickName
    }, {
      op: "replace",
      path: "/gender",
      value: gender
    }, {
      op: "replace",
      path: "/signature",
      value: signature
    }]

    // 更新用户信息
    wxutil.request.put(url, data).then((res) => {
      if (res.data.code == 200) {
        let userDetail = wxutil.getStorage("userDetail")
        // 更新缓存
        const user = res.data.data
        userDetail = Object.assign(userDetail, user)
        wxutil.setStorage("userDetail", userDetail)

        wx.lin.showMessage({
          type: "success",
          content: "资料修改成功！",
          success() {
            wx.navigateBack()
          }
        })
      } else {
        wx.lin.showMessage({
          type: "error",
          content: "资料修改失败！"
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: "编辑资料",
      path: "/pages/user-edit/index"
    }
  }
})