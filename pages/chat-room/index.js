// pages/chat-room/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const io = require("../../utils/socket.io")
let socket = null

Page({
  data: {
    content: null,
    userId: -1,
    scrollTop: 1000,
    timeDown: 0, // 大于5分钟消息间隔报时
    countDown: 0, // 倒计时秒数
    height: 1116, // 消息内容区高度
    msg: []
  },

  onLoad(options) {
    const roomId = options.roomId
    const countDown = options.countDown

    this.getCountDown(countDown)
    this.getUserId()
    this.getScrollHeight()
    this.connectSocket(roomId)
    this.onSocketMessage("status")
    this.onSocketMessage("message")
  },

  onUnload() {
    this.sendSocketMessage("leave")
  },

  /**
   * 获取窗口高度
   */
  getScrollHeight() {
    const that = this;
    wx.getSystemInfo({
      success: function(res) {
        const windowHeight = res.windowHeight;
        const windowWidth = res.windowWidth;
        const ratio = 750 / windowWidth;
        const height = windowHeight * ratio;
        that.setData({
          height: height - 88
        })
      }
    })
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
      if (countDown == 300) {
        wx.lin.showMessage({
          content: "树洞将在5分钟后关闭！",
          duration: 3000
        })
      }
      if (countDown <= 60 && countDown > 3) {
        wx.lin.showMessage({
          content: "距离树洞关闭还剩 " + countDown + " 秒！",
          duration: 1000
        })
      }
      if (countDown == 3) {
        wx.lin.showMessage({
          type: "warning",
          content: "树洞即将关闭！",
          duration: 3000
        })
      }
      if (countDown <= 0) {
        clearInterval(interval)
        wx.navigateBack()
      }
    }, 1000);
  },

  /**
   * 获取用户ID
   */
  getUserId() {
    this.setData({
      userId: app.globalData.userDetail.id
    })
  },

  /**
   * 连接Socket
   */
  connectSocket(roomId) {
    socket = this.socket = io(api.chatAPI)
    socket.on("connect", (res) => {
      const data = {
        room_id: roomId,
        token: app.globalData.userDetail.token
      }
      this.sendSocketMessage("join", data)
    })
  },

  /**
   * 发送Socket信息
   */
  sendSocketMessage(path, msg = null) {
    this.socket.emit(path, msg)
  },

  /**
   * 监听Socket信息
   */
  onSocketMessage(path) {
    this.socket.on(path, (res) => {
      let msg = this.data.msg
      let timeDown = this.data.timeDown

      // 间隔时间大于5分钟输出时分秒
      if (timeDown >= 300) {
        msg.push({
          type: "time",
          content: wxutil.getDateTime().slice(-8, -3)
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
   * 滚动至底部
   */
  scrollToBottom() {
    const query = wx.createSelectorQuery();
    query.select(".msg-scroll").boundingClientRect();
    query.select(".msg-list").boundingClientRect();
    query.exec((res) => {
      const scorllHeight = res[0].height;
      const listHeight = res[1].height;
      this.setData({
        scrollTop: listHeight - scorllHeight
      });
    });
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
    this.sendSocketMessage("send", content)
    this.setData({
      content: null,
    })
  },

  onShareAppMessage() {
    return {
      title: "树洞深处",
      path: "/pages/chat-room/index"
    }
  }
})