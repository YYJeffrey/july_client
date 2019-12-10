//app.js
const api = require("./config/api.js")
const wxutil = require("./utils/wxutil.js")

App({
  api: api,
  wxutil: wxutil,

  globalData: {
    appId: wx.getAccountInfoSync().miniProgram.appId
  },

  onLaunch: function() {
    wxutil.autoUpdate()
  }
})