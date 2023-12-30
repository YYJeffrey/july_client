// pages/following/index.js
import { Following } from '../../models/following'

Page({
  data: {
    followingList: [],
    followingPaging: null,  // Ta关注的分页器
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
    this.initFollowingList(userId)
  },

  /**
   * 初始化Ta关注的列表
   */
  async initFollowingList(userId) {
    const followingPaging = await Following.getFollowingPaging({ user_id: userId })
    this.setData({
      followingPaging: followingPaging
    })
    await this.getMoreFollowing(followingPaging)
  },

  /**
   * 获取更多Ta关注的
   */
  async getMoreFollowing(followingPaging) {
    const data = await followingPaging.getMore()
    if (!data) {
      return
    }
    this.setData({
      followingList: data.accumulator
    })
  },

  /**
   * 点击标签
   */
  onTagTap(event) {
    const index = event.currentTarget.dataset.index
    const item = this.data.followingList[index]
    const user = item.follow_user
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

      let followingList = this.data.followingList
      followingList[index].followed = !followingList[index].followed

      this.setData({
        followingList: followingList
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
    await this.getMoreFollowing(this.data.followingPaging)
  },

  onShareAppMessage() {
    return {
      title: '主页',
      path: '/pages/topic/index'
    }
  }
})
