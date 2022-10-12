module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1665382673789, function(require, module, exports) {
/**
 * @author: Jeffrey
 */

// 兼容uni-app
if (typeof uni !== 'undefined') {
  wx = uni
}

/**
 * request用法：
 * 1.request.get(url).then(res => {}).catch(error => {})
 * 2.request.post(url, data = {}, header = {}).then(res => {}).catch(error => {})
 * 3.request.put(url, data = {}, header = {}).then(res => {}).catch(error => {})
 * 4.request.delete(url, data = {}, header = {}).then(res => {}).catch(error => {})
 * @param {String} url
 * @param {JSON Object} data
 * @param {JSON Object} header
 * @param {Boolean} showLoading
 */
const request = {
  get(url, data = {}, header = {}, showLoading = true) {
    const handler = { url, data, header }
    return this.Request('GET', handler, showLoading)
  },

  post(url, data = {}, header = {}, showLoading = true) {
    const handler = { url, data, header }
    return this.Request('POST', handler, showLoading)
  },

  put(url, data = {}, header = {}, showLoading = true) {
    const handler = { url, data, header }
    return this.Request('PUT', handler, showLoading)
  },

  delete(url, data = {}, header = {}, showLoading = true) {
    const handler = { url, data, header }
    return this.Request('DELETE', handler, showLoading)
  },

  // RequestHandler
  Request(method, handler, showLoading) {
    const { url, data, header } = handler
    let head = {
      'content-type': 'application/json'
    }
    if (getApp().getHeader) {
      const appHeader = getApp().getHeader()
      head = Object.assign(head, appHeader)
    }
    if (showLoading) {
      wx.showNavigationBarLoading()
    }
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        header: Object.assign(head, header),
        method:
          ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1
            ? method
            : 'GET',
        success: res => {
          if (getApp().gotoAuthPage) {
            getApp().gotoAuthPage(res.data)
          }
          resolve(res.data)
        },
        fail: error => {
          reject(error)
        },
        complete() {
          wx.hideNavigationBarLoading()
        }
      })
    })
  }
}

/**
 * file用法：
 * 1.file.download(url).then(res => {})
 * 2.file.upload({url: url, fileKey: fileKey, filePath: filePath, data: {}, header: {}}).then(res => {})
 * @param {JSON Object} handler
 */
const file = {
  download(handler) {
    if (typeof handler === 'string') {
      handler = {
        url: String(handler)
      }
    }
    const { url, filePath, header } = handler
    return new Promise((resolve, reject) => {
      let head = {}
      if (getApp().getHeader) {
        const appHeader = getApp().getHeader()
        head = Object.assign(head, appHeader)
      }
      wx.showNavigationBarLoading()
      wx.downloadFile({
        url: url,
        filePath: filePath,
        header: Object.assign(head, header),
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        },
        complete() {
          wx.hideNavigationBarLoading()
        }
      })
    })
  },

  upload(handler) {
    const { url, fileKey, filePath, data, header } = handler
    return new Promise((resolve, reject) => {
      let head = {}
      if (getApp().getHeader) {
        const appHeader = getApp().getHeader()
        head = Object.assign(head, appHeader)
      }
      wx.showNavigationBarLoading()
      wx.uploadFile({
        url: url,
        name: fileKey,
        filePath: filePath,
        formData: data,
        header: Object.assign(head, header),
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        },
        complete() {
          wx.hideNavigationBarLoading()
        }
      })
    })
  }
}

/**
 * socket用法：
 * let socketOpen = false
 * socket.connect(url)
 *
 * wx.onSocketMessage(res => {
 *  console.log(res)
 * }
 *
 * wx.onSocketOpen(res => {
 *  socketOpen = true
 *  if socketOpen: socket.send('hello').then((data) => {})
 *  socket.close(url) || wx.closeSocket()
 * })
 * @param {String} url
 * @param {JSON Object} handler
 * @param {JSON Object} data
 */
const socket = {
  connect(url, handler = {}) {
    const { header, protocols } = handler
    let head = {
      'content-type': 'application/json'
    }
    if (getApp().getHeader) {
      const appHeader = getApp().getHeader()
      head = Object.assign(head, appHeader)
    }
    return new Promise((resolve, reject) => {
      wx.connectSocket({
        url: url,
        header: Object.assign(head, header),
        protocols: typeof protocols === 'undefined' ? [] : protocols,
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        }
      })
    })
  },

  // 需在onSocketOpen回调内使用
  send(data) {
    return new Promise((resolve, reject) => {
      wx.sendSocketMessage({
        data: data,
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        }
      })
    })
  },

  close(url) {
    wx.connectSocket({
      url: url
    })
  }
}

/**
 * image用法：
 * 1.image.save(path).then(res => {})
 * 2.image.preview([url])
 * 3.image.choose(1).then(res => {})
 * @param {String} path
 * @param {JSON Object} urls
 */
const image = {
  save(path) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        }
      })
    })
  },

  preview(urls, current = urls[0], showmenu = true) {
    return new Promise((resolve, reject) => {
      wx.previewImage({
        current,
        urls,
        showmenu,
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        }
      })
    })
  },

  choose(count = 9, sourceType = ['album', 'camera']) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: count,
        sourceType: sourceType,
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        }
      })
    })
  }
}

/**
 * showToast用法：
 * showToast('成功')
 * @param {String} title
 * @param {JSON Object} handler
 */
const showToast = (title, handler = {}) => {
  const { icon, image, duration, mask } = handler
  return new Promise((resolve, reject) => {
    wx.showToast({
      title: title,
      image: image,
      icon: typeof icon === 'undefined' ? 'none' : icon,
      duration: typeof duration === 'undefined' ? 1000 : duration,
      mask: typeof mask === 'undefined' ? true : mask,
      success: res => {
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * showModal用法：
 * showModal('提示', '这是一个模态弹窗')
 * @param {String} title
 * @param {String} content
 * @param {JSON Object} handler
 */
const showModal = (title, content, handler = {}) => {
  const { showCancel, cancelText, confirmText, cancelColor, confirmColor } =
    handler
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: content,
      showCancel: typeof showCancel === 'undefined' ? true : showCancel,
      cancelText: typeof cancelText === 'undefined' ? '取消' : cancelText,
      confirmText: typeof confirmText === 'undefined' ? '确定' : confirmText,
      cancelColor: typeof cancelColor === 'undefined' ? '#000000' : cancelColor,
      confirmColor:
        typeof confirmColor === 'undefined' ? '#576B95' : confirmColor,
      success: res => {
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * showLoading用法：
 * showLoading('加载中')
 * @param {String} title
 * @param {Boolean} mask
 */
const showLoading = (title = '加载中...', mask = true) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: title,
      mask: mask,
      success: res => {
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * showActionSheet用法：
 * showActionSheet(['A', 'B', 'C']).then(res => {})
 * @param {Array.<String>} itemList
 * @param {String} itemColor
 */
const showActionSheet = (itemList, itemColor = '#000000') => {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: itemList,
      itemColor: itemColor,
      success: res => {
        resolve(res.tapIndex)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * setStorage用法：
 * 1.setStorage('userInfo', userInfo)
 * 2.setStorage('userInfo', userInfo, 86400)
 * @param {String} key
 * @param {Object} value
 * @param {Int} time 过期时间，可选参数
 */
const setStorage = (key, value, time) => {
  const dtime = '_deadtime'
  wx.setStorageSync(key, value)
  const seconds = parseInt(time)
  if (seconds > 0) {
    let timestamp = Date.parse(new Date()) / 1000 + seconds
    wx.setStorageSync(key + dtime, timestamp + '')
  } else {
    wx.removeStorageSync(key + dtime)
  }
}

/**
 * getStorage用法：
 * getStorage('userInfo')
 * @param {String} key
 */
const getStorage = key => {
  const dtime = '_deadtime'
  const deadtime = parseInt(wx.getStorageSync(key + dtime))
  if (deadtime && Date.parse(new Date()) / 1000 > parseInt(deadtime)) {
    wx.removeStorageSync(key)
    wx.removeStorageSync(key + dtime)
    return null
  }
  const res = wx.getStorageSync(key)
  if (typeof res === 'boolean') {
    return res
  }
  return res ? res : null
}

/**
 * getUserProfile用法：
 * getUserProfile().then(res => {})
 * @param {String} lang
 */
const getUserProfile = (lang = 'zh_CN', desc = '授权用于获取个人公开信息') => {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      lang: lang,
      desc: desc,
      success: res => {
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 微信支付 - requestPayment用法:
 * requestPayment({timeStamp: timeStamp, nonceStr: nonceStr, packageValue: packageValue, paySign: paySign}).then(res => {})
 * @param {JSON Object} handler
 */
const requestPayment = handler => {
  const { timeStamp, nonceStr, packageValue, paySign, signType } = handler
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      packageValue: packageValue,
      paySign: paySign,
      signType: typeof signType === 'undefined' ? 'MD5' : signType,
      success: res => {
        resolve(res)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 小程序自动更新 - autoUpdate用法:
 * autoUpdate()
 */
const autoUpdate = () => {
  const updateManager = wx.getUpdateManager()
  updateManager.onCheckForUpdate(res => {
    if (res.hasUpdate) {
      updateManager.onUpdateReady(() => {
        showModal('更新提示', '新版本已经准备好，是否重启应用？').then(res => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        })
      })
      updateManager.onUpdateFailed(() => {
        showModal(
          '更新提示',
          '新版本已经准备好，请删除当前小程序，重新搜索打开'
        )
      })
    }
  })
}

/**
 * 判断字符串是否不为空 - isNotNull用法：
 * isNotNull('text')
 * @param {String} text 字符串
 * @return {Boolean} 字符串合法返回真否则返回假
 */
const isNotNull = text => {
  if (text === null) {
    return false
  }
  if (text.match(/^\s+$/)) {
    return false
  }
  if (text.match(/^\s*$/)) {
    return false
  }
  if (text.match(/^[ ]+$/)) {
    return false
  }
  if (text.match(/^[ ]*$/)) {
    return false
  }
  return true
}

/**
 * 获取日期时间 - getDateTime用法：
 * getDateTime()
 * @param {Date} date 'yy-mm-dd hh:MM:ss'
 */
const getDateTime = (date = new Date()) => {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (day >= 0 && day <= 9) {
    day = '0' + day
  }
  if (hour >= 0 && hour <= 9) {
    hour = '0' + hour
  }
  if (minute >= 0 && minute <= 9) {
    minute = '0' + minute
  }
  if (second >= 0 && second <= 9) {
    second = '0' + second
  }
  return (
    year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  )
}

/**
 * 获取时间戳 - getTimestamp用法：
 * getTimestamp()
 * @param {Date} date
 */
const getTimestamp = (date = new Date()) => {
  return date.getTime()
}

/**
 * 精度计算 - calculate用法
 * 1.calculate.add(0.1, 0.2)
 * 2.calculate.sub(1, 0.8)
 * 3.calculate.mul(6, 0.7)
 * 4.calculate.div(1.2, 0.2)
 */
const calculate = {
  add(num1, num2) {
    let r1, r2, m
    try {
      r1 = num1.toString().split('.')[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = num2.toString().split('.')[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return (num1 * m + num2 * m) / m
  },

  sub(num1, num2) {
    let r1, r2, m, n
    try {
      r1 = num1.toString().split('.')[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = num2.toString().split('.')[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    n = r1 >= r2 ? r1 : r2
    return ((num1 * m - num2 * m) / m).toFixed(n)
  },

  mul(num1, num2) {
    let m = 0,
      s1 = num1.toString(),
      s2 = num2.toString()
    try {
      m += s1.split('.')[1].length
    } catch (e) {}
    try {
      m += s2.split('.')[1].length
    } catch (e) {}
    return (
      (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) /
      Math.pow(10, m)
    )
  },

  div(num1, num2) {
    var t1 = 0,
      t2 = 0,
      r1,
      r2
    try {
      t1 = num1.toString().split('.')[1].length
    } catch (e) {}
    try {
      t2 = num2.toString().split('.')[1].length
    } catch (e) {}
    r1 = Number(num1.toString().replace('.', ''))
    r2 = Number(num2.toString().replace('.', ''))
    return (r1 / r2) * Math.pow(10, t2 - t1)
  }
}

/**
 * 获取UUID - getUUID用法
 * getUUID()
 */
const getUUID = (hasOnline = true) => {
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = hasOnline ? '-' : ''
  return s.join('')
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  request,
  file,
  socket,
  image,
  showToast,
  showModal,
  showLoading,
  showActionSheet,
  setStorage,
  getStorage,
  getUserProfile,
  requestPayment,
  autoUpdate,
  isNotNull,
  getDateTime,
  getTimestamp,
  calculate,
  getUUID
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1665382673789);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map