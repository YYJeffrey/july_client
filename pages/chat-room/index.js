// pages/chat-room/index.js
import io from '../../utils/socket.io'
import api from '../../config/api'
import wxutil from '../../miniprogram_npm/@yyjeffrey/wxutil/index'
import { init, upload } from '../../utils/qiniuUploader'
import { Chat } from '../../models/chat'
import { OSS } from '../../models/oss'
const app = getApp()
let socket = null

Page({
  data: {
    msg: [],
    holeId: null,
    roomId: null,
    userId: null,
    content: null,
    height: 1000, // 消息内容区高度
    toIndex: 0, // 滚动至元素坐标
    timeDown: 0, // 消息间隔时间
    countDown: 0 // 聊天室关闭倒计时
  },

  onLoad(options) {
    const roomId = options.roomId
    const holeId = options.holeId
    const countDown = options.countDown

    this.setData({
      roomId: roomId,
      holeId: holeId,
      userId: app.globalData.userDetail.id
    })

    this.getChatList()
    this.getScrollHeight()
    this.getCountDown(countDown)

    // 连接并加入房间
    this.connectSocket(roomId, holeId)

    this.onSocketMessage('status') // 监听状态信息
    this.onSocketMessage('message') // 监听内容消息
  },

  onUnload() {
    this.sendSocketMessage('leave')
  },

  /**
   * 连接 Socket 并加入房间
   */
  connectSocket(roomId, holeId) {
    socket = this.socket = io(api.chatAPI)

    socket.on('connect', () => {
      const data = {
        room_id: roomId,
        hole_id: holeId,
        token: app.globalData.userDetail.token
      }
      this.sendSocketMessage('join', data)
    })
  },

  /**
   * 发送 Socket 消息
   */
  sendSocketMessage(path, msg = null) {
    this.socket.emit(path, msg)
  },

  /**
   * 监听 Socket 消息
   */
  onSocketMessage(path) {
    this.socket.on(path, (res) => {
      const msg = this.data.msg
      const timeDown = this.data.timeDown

      // 消息时间间隔超过5分钟输出当前时间
      if (timeDown >= 300) {
        msg.push({
          message_type: 'TIME',
          data: wxutil.getDateTime().slice(-8, -3)
        })
      }

      msg.push(res)
      this.setData({
        msg: msg,
        timeDown: 0
      })
      this.scrollToBottom()
    })
  },

  /**
   * 获取聊天列表
   */
  async getChatList() {
    const msg = this.data.msg
    const params = {
      room_id: this.data.roomId,
    }

    if (msg.length > 0) {
      params.chat_id = msg[0].id
    }

    const chatList = await (await Chat.getChatPaging(params)).getMore()
    chatList.items.reverse()
    this.setData({
      msg: chatList.items.concat(this.data.msg),
    })
  },

  /**
   * 获取窗口高度
   */
  getScrollHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const windowHeight = systemInfo.windowHeight

    const query = wx.createSelectorQuery()
    query.select('.edit-item').boundingClientRect(rect => {
      const editHeight = rect.height
      this.setData({
        height: windowHeight - editHeight
      })
    }).exec()
  },

  /**
   * 获取倒计时
   */
  getCountDown(countDown) {
    const interval = setInterval(() => {
      let timeDown = this.data.timeDown
      this.setData({
        countDown: --countDown,
        timeDown: ++timeDown
      })
      if (countDown === 300) {
        wx.lin.showMessage({
          content: '树洞将在5分钟后关闭！',
          duration: 3000
        })
      }
      else if (countDown <= 60 && countDown > 3) {
        wx.lin.showMessage({
          content: '距离树洞关闭还剩 ' + countDown + ' 秒！',
          duration: 1000
        })
      }
      else if (countDown === 3) {
        wx.lin.showMessage({
          type: 'warning',
          content: '树洞即将关闭！',
          duration: 3000
        })
      }
      else if (countDown <= 0) {
        clearInterval(interval)
        wx.navigateBack()
      }
    }, 1000)
  },

  /**
   * 设置消息内容
   */
  setMessage(event) {
    this.setData({
      content: event.detail.value
    })
  },

  /**
   * 发送消息
   */
  onSendMessageTap() {
    const content = this.data.content

    if (!wxutil.isNotNull(content)) {
      wx.lin.showMessage({
        type: 'error',
        content: '内容不能为空！'
      })
      return
    }

    this.setData({
      content: null
    })

    const data = JSON.stringify({
      content: content,
      message_type: 'TEXT'
    })

    this.sendSocketMessage('send', data)
  },

  /**
   * 初始化七牛云配置
   */
  async initQiniu() {
    const uptoken = await OSS.getQiniu()
    const options = {
      region: 'ECN',
      uptoken: uptoken,
      domain: api.ossDomain,
      shouldUseQiniuFileName: false
    }
    init(options)
  },

  /**
   * 媒体文件上传至OSS
   */
  sendMedia(imageFile, path) {
    return new Promise((resolve, reject) => {
      upload(imageFile, (res) => {
        resolve(res.imageURL)
      }, (error) => {
        reject(error)
      }, {
        region: 'ECN',
        uptoken: null,
        domain: null,
        shouldUseQiniuFileName: false,
        key: path + '/' + wxutil.getUUID(false)
      })
    })
  },

  /**
   * 发送图片
   */
  async sendImg() {
    wxutil.image.choose(1).then(async (res) => {
      if (res.errMsg !== 'chooseImage:ok') {
        return
      }

      wxutil.showLoading('发送中...')
      await this.initQiniu()
      const image = await this.sendMedia(res.tempFilePaths[0], 'chat')
      wx.hideLoading()

      const data = JSON.stringify({
        content: image,
        message_type: 'IMAGE'
      })

      this.sendSocketMessage('send', data)
    })
  },

  /**
   * 自动滚动至底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.setData({
        toIndex: this.data.msg.length - 1
      })
    }, 1000)
  }
})
