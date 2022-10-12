// pages/user-edit/index.js
import wxutil from "../../miniprogram_npm/@yyjeffrey/wxutil/index"
import { User } from "../../models/user"
const app = getApp()

Page({
  data: {
    userId: -1,
    gender: 0,
    nickName: null,
    signature: null
  },

  onLoad() {
    this.getUserDetail()
  },

  /**
   * 获取用户详情
   */
  async getUserDetail() {
    const userId = app.globalData.userDetail.id
    const data = await User.getUserInfo(userId)
    this.setData({
      userId: data.id,
      nickName: data.nick_name,
      gender: data.gender,
      signature: data.signature
    })
  },

  /**
   * 设置昵称
   */
  setNickName(event) {
    this.setData({
      nickName: event.detail.value
    })
  },

  /**
   * 设置性别
   */
  onChangeGenderTap(event) {
    this.setData({
      gender: event.detail.key
    })
  },

  /**
   * 设置个性签名
   */
  setSignature(event) {
    this.setData({
      signature: event.detail.value
    })
  },

  /**
   * 保存用户信息
   */
  async saveInfo() {
    const nickName = this.data.nickName
    const signature = this.data.signature
    const gender = this.data.gender

    if (!wxutil.isNotNull(nickName)) {
      wx.lin.showMessage({
        type: "error",
        content: "昵称不能为空！"
      })
      return
    }

    // 构造请求参数
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
    const res = await User.updateUser(data)
    if (res.code === 200) {
      let userDetail = app.globalData.userDetail
      // 更新缓存
      userDetail = Object.assign(userDetail, res.data)
      wxutil.setStorage("userDetail", userDetail)
      app.globalData.userDetail = userDetail

      wx.lin.showMessage({
        type: "success",
        content: "更新成功！",
        success: () => {
          wx.navigateBack()
        }
      })
    } else {
      wx.lin.showMessage({
        type: "error",
        content: "更新失败！"
      })
    }
  },

  onShareAppMessage() {
    return {
      title: "主页",
      path: "/pages/topic/index"
    }
  }
})
