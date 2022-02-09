// pages/chat-room/index.js
import io from "../../utils/socket.io"
const app = getApp()
const api = app.api
const wxutil = app.wxutil
let socket = null

Page({
  data: {
    msg: [],
    roomId: null,
    content: null,
    userId: -1,
    height: 1000, // 消息内容区高度
    toIndex: 0, // 滚动至元素坐标
    timeDown: 0, // 消息间隔时间
    countDown: 0 // 聊天室关闭倒计时
  },

  onLoad(options) {
    const roomId = options.roomId
    const countDown = options.countDown

    this.setData({
      roomId: roomId,
      userId: app.globalData.userDetail.id
    })

    this.getChatList()
    this.getScrollHeight()
    this.getCountDown(countDown)

    this.connectSocket(roomId)
    this.onSocketMessage("status") // 监听状态信息
    this.onSocketMessage("message") // 监听文字消息
    this.onSocketMessage("images") // 监听图片消息
  },

  onUnload() {
    this.sendSocketMessage("leave")
  },

  /**
   * 获取聊天列表
   */
  getChatList() {
    const msg = this.data.msg
    let data = {
      room_id: this.data.roomId
    }
    if (msg.length > 0 && "create_time" in msg[0]) {
      data["create_time"] = msg[0]["create_time"]
    }

    wxutil.request.get(api.chatResAPI, data).then((res) => {
      if (res.code === 200) {
        let data = res.data
        data.reverse()
        this, this.setData({
          msg: data.concat(this.data.msg),
        })
      }
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
          content: "树洞将在5分钟后关闭！",
          duration: 3000
        })
      }
      else if (countDown <= 60 && countDown > 3) {
        wx.lin.showMessage({
          content: "距离树洞关闭还剩 " + countDown + " 秒！",
          duration: 1000
        })
      }
      else if (countDown === 3) {
        wx.lin.showMessage({
          type: "warning",
          content: "树洞即将关闭！",
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
   * 发送Socket信息
   */
  sendSocketMessage(path, msg = null) {
    this.socket.emit(path, msg)
  },

  /**
   * 连接Socket
   */
  connectSocket(roomId) {
    socket = this.socket = io(api.chatAPI)
    socket.on("connect", () => {
      const data = {
        room_id: roomId,
        token: app.globalData.userDetail.token
      }
      this.sendSocketMessage("join", data)
    })
  },

  /**
   * 监听Socket信息
   */
  onSocketMessage(path) {
    this.socket.on(path, (res) => {
      const msg = this.data.msg
      const timeDown = this.data.timeDown

      // 消息时间间隔超过5分钟输出当前时间
      if (timeDown >= 300) {
        msg.push({
          type: "time",
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
        type: "error",
        content: "内容不能为空！"
      })
      return
    }

    this.setData({
      content: null
    })
    this.sendSocketMessage("send", content)
  },

  /**
   * 发送图片
   */
  sendImg() {
    wxutil.image.choose(1).then((res) => {
      if (res.errMsg === "chooseImage:ok") {
        wxutil.file.upload({
          url: api.holeAPI + "images/",
          fileKey: "file",
          filePath: res.tempFilePaths[0]
        }).then((res) => {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            this.sendSocketMessage("images", data.data.url)
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "发送图片失败！"
            })
          }
        })
      }
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