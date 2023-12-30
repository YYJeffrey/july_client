// pages/follower/index.js
import { Following } from '../../models/following'

Page({
  data: {
    followerList: [],
    followerPaging: null, // 关注Ta的分页器
    title: null // 导航栏标题
  },

  onLoad(options) {
    const userId = options.userId
    const title = options.title

    wx.setNavigationBarTitle({
      title: title
    })
    this.setData({
      title: title
    })
    this.initFollowerList(userId)
  },

  /**
   * 初始化关注Ta的列表
   */
  async initFollowerList(followUserId) {
    const followerPaging = await Following.getFollowingPaging({ follow_user_id: followUserId })
    this.setData({
      followerPaging: followerPaging,
    })
    await this.getMoreFollower(followerPaging)
  },

  /**
   * 获取更多关注Ta的
   */
  async getMoreFollower(followerPaging) {
    const data = await followerPaging.getMore()
    if (!data) {
      return
    }
    this.setData({
      followerList: data.accumulator
    })
  },

  /**
   * 点击标签
   */
  onTagTap(event) {
    const index = event.currentTarget.dataset.index
    const item = this.data.followerList[index]
    const user = item.user
    const hasFollow = item.followed

    if (hasFollow) {
      wx.lin.showActionSheet({
        title: '确定要取消关注' + user.nickname + '吗？',
        showCancel: true,
        cancelText: '放弃',
        itemList: [{
          name: '取消关注',
          color: '#666'
        }],
        success: () => {
          this.followOrCancel(user.id, '取消关注', index)
        }
      })
    } else {
      this.followOrCancel(user.id, '关注', index)
    }
  },

  /**
   * 关注或取关
   */
  async followOrCancel(userId, msg, index) {
    const res = await Following.followOrCancel(userId)
    if (res.code === 0) {
      wx.lin.showMessage({
        type: 'success',
        content: msg + '成功！'
      })

      let followerList = this.data.followerList
      followerList[index].followed = !followerList[index].followed

      this.setData({
        followerList: followerList
      })
    } else {
      wx.lin.showMessage({
        type: 'error',
        content: msg + '失败！'
      })
    }
  },

  /**
   * 触底加载
   */
  async onReachBottom() {
    await this.getMoreFollower(this.data.followerPaging)
  },

  onShareAppMessage() {
    return {
      title: '主页',
      path: '/pages/topic/index'
    }
  }
})
