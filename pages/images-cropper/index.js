// pages/images-cropper/index.js
import WeCropper from "../../templates/we-cropper/we-cropper.js"

const app = getApp()
const api = app.api
const wxutil = app.wxutil

const device = wx.getSystemInfoSync() // 设备信息
const width = device.windowWidth
const height = device.windowHeight - 50

Page({
  data: {
    cropperOpt: {
      id: "cropper", // 手势操作的canvas组件
      targetId: "targetCropper", // 生成截图的canvas组件
      pixelRatio: device.pixelRatio, // 设备像素比
      width: width, // 画布宽度
      height: height, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - 225) / 2,
        y: (height - 225) / 2,
        width: 225, // 裁剪框宽度
        height: 225 // 裁剪框高度
      }
    }
  },

  onLoad(option) {
    let {
      cropperOpt
    } = this.data

    if (option.src) {
      cropperOpt.src = option.src
    }

    // 实例化WeCropper
    this.cropper = new WeCropper(cropperOpt)
      .on("beforeImageLoad", (ctx) => {
        wx.showToast({
          title: "上传中",
          icon: "loading"
        })
      })
      .on("imageLoad", (ctx) => {
        wx.hideToast()
      })
  },

  /**
   * 开始触碰
   */
  touchStart(e) {
    this.cropper.touchStart(e)
  },

  /**
   * 拖动图片
   */
  touchMove(e) {
    this.cropper.touchMove(e)
  },

  /**
   * 结束触碰
   */
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },

  /**
   * 重新上传
   */
  uploadTap() {
    const that = this

    wxutil.image.choose(1).then((res) => {
      if (res.errMsg == "chooseImage:ok") {
        const src = res.tempFilePaths[0]
        that.cropper.pushOrign(src)
      }
    })
  },

  /**
   * 确认上传
   */
  comfireTap() {
    this.cropper.getCropperImage(function(path, err) {
      if (err) {
        wxutil.showModal("提示", err.message)
      } else {
        const url = api.userAPI + "avatar/"

        // 上传头像
        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: path
        }).then((res) => {
          const data = JSON.parse(res.data);
          if (data.code == 200) {
            // 更新缓存
            const user = data.data
            let userDetail = app.globalData.userDetail
            userDetail = Object.assign(userDetail, user)
            wxutil.setStorage("userDetail", userDetail)
            app.globalData.userDetail = userDetail

            wx.lin.showMessage({
              type: "success",
              content: "头像修改成功！",
              success() {
                wx.navigateBack()
              }
            })
          } else {
            wx.lin.showMessage({
              type: "error",
              content: "头像修改失败！"
            })
          }
        })
      }
    })
  }
})