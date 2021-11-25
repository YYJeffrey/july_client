// pages/chat-room/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
import io from "../../utils/socket.io"

let socket = null

Page({
  data: {
    roomId: null,
    content: null,
    userId: -1,
    scrollTop: 1800,
    timeDown: 0, // 大于5分钟消息间隔报时
    countDown: 0, // 倒计时秒数
    height: 1116, // 消息内容区高度
    msg: []
  },

  onLoad(options) {
    const roomId = options.roomId
    const countDown = options.countDown

    this.setData({
      roomId: roomId
    })

    this.getCountDown(countDown)
    this.getUserId()
    this.getScrollHeight()
    this.getChatList()
    this.connectSocket(roomId)
    this.onSocketMessage("status") // 监听状态信息
    this.onSocketMessage("message") // 监听文字消息
    this.onSocketMessage("images") // 监听图片消息
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
      success: function (res) {
        const windowHeight = res.windowHeight;
        const windowWidth = res.windowWidth;
        const ratio = 750 / windowWidth;
        that.setData({
          height: windowHeight * ratio - 88
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
      this.scrollToBottom()
      this.setData({
        msg: msg,
        timeDown: 0
      })
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
        scrollTop: listHeight - scorllHeight + 1000
      })
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
    this.setData({
      content: null
    })
    this.sendSocketMessage("send", content)
  },

  /**
   * 发送图片
   */
  sendImg(event) {
    wxutil.image.choose(1).then((res) => {
      if (res.errMsg == "chooseImage:ok") {
        const url = api.holeAPI + "images/"

        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: res.tempFilePaths[0]
        }).then((res) => {
          const data = JSON.parse(res.data);
          if (data.code == 200) {
            this.sendSocketMessage("images", data.data.url)
            this.setData({
              scrollTop: this.data.scrollTop + 1000
            })
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "图片上传失败！"
            })
          }
        })
      }
    })
  },

  /**
   * 获取聊天列表
   */
  getChatList() {
    let msg = this.data.msg
    let data = {
      room_id: this.data.roomId
    }
    if (msg.length > 0 && "create_time" in msg[0]) {
      data["create_time"] = msg[0]["create_time"]
    }

    wxutil.request.get(api.chatResAPI, data).then((res) => {
      if (res.code == 200) {
        let data = res.data
        data.reverse()
        this, this.setData({
          msg: data.concat(this.data.msg)
        })
      }
    })
  },

  /**
   * 图片预览
   */
  previewImage(event) {
    wx.previewImage({
      current: "",
      urls: [event.currentTarget.dataset.src]
    })
  },

  /**
   * 触顶加载
   */
  scrolltoupper() {
    this.getChatList()
  },
})