// pages/user-edit/index.js
import wxutil from '../../miniprogram_npm/@yyjeffrey/wxutil/index'
import { User } from '../../models/user'
const app = getApp()

Page({
  data: {
    gender: 'MAN',
    userId: null,
    nickname: null,
    signature: null,
    avatar: null,
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
      nickname: data.nickname,
      gender: data.gender,
      signature: data.signature,
      avatar: data.avatar
    })
  },

  /**
   * 设置昵称
   */
  setNickname(event) {
    this.setData({
      nickname: event.detail.value
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
    if (!wxutil.isNotNull(this.data.nickname)) {
      wx.lin.showMessage({
        type: 'error',
        content: '昵称不能为空！'
      })
      return
    }

    const data = {
      avatar: this.data.avatar,
      nickname: this.data.nickname,
      signature: this.data.signature,
      gender: this.data.gender
    }

    // 更新用户信息
    const res = await User.updateUser(data)
    if (res.code === 2) {
      wx.lin.showMessage({
        type: 'success',
        content: '更新成功！',
        success: () => {
          wx.navigateBack()
        }
      })
    } else {
      wx.lin.showMessage({
        type: 'error',
        content: '更新失败！'
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '主页',
      path: '/pages/topic/index'
    }
  }
})
