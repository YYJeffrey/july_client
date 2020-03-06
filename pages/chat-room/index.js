// pages/chat-room/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
const io = require("../../utils/socket.io")
let socket = null

Page({
  data: {
    content: null,
    focus: false,
    userId: -1,
    scrollTop: 1000,
    height: 1116,
    msg: []
  },

  onLoad(options) {
    this.getUserId()
    this.getScrollHeight()
    this.connectSocket(options.roomId)
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
      msg.push(res)
      this.setData({
        msg: msg
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
      focus: true
    })
  },

  onShareAppMessage() {
    return {
      title: "树洞深处",
      path: "/pages/chat-room/index"
    }
  }
})