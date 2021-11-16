// pages/topic-edit/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil
import { init, upload } from "../../utils/qiniuUploader";

Page({
  data: {
    labels: [],
    imageFiles: [], // 图片文件列表
    labelsActive: [], // 选中的标签
    chooseCount: 0,
    canAnon: false,
    isAnon: false,
    content: null,
    video: null,
    commentTemplateId: null
  },

  onLoad() {
    this.getLabels()
    this.getTemplateId()
    this.initQiniu()
  },

  /**
   * 初始化七牛云配置
   */
  initQiniu(domain = api.ossDomain) {
    wxutil.request.get(api.ossAPI).then((res) => {
      if (res.code == 200) {
        var options = {
          region: 'ECN',
          uptoken: res.data.uptoken,
          domain: domain,
          shouldUseQiniuFileName: false,
        }
        init(options)
      }
    })
  },

  /**
   * 获取标签
   */
  getLabels() {
    const url = api.labelAPI
    const data = {
      app_id: app.globalData.appId
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.code == 200) {
        this.setData({
          labels: res.data
        })
      }
    })
  },

  /**
   * 获取评论模板ID
   */
  getTemplateId(title = "评论模板") {
    const url = api.templateAPI
    const data = {
      title: title
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.code == 200) {
        this.setData({
          commentTemplateId: res.data.template_id
        })
      }
    })
  },

  /**
   * 设置内容
   */
  setContent(event) {
    this.setData({
      content: event.detail.value
    })
  },

  /**
   * 设置匿名
   */
  onAnonTap(event) {
    this.setData({
      isAnon: event.detail.checked
    })
  },

  /**
   * 选择图片
   */
  onChangeImage(event) {
    const files = event.detail.all
    let imageFiles = []
    for (let i = 0; i < files.length; i++) {
      imageFiles.push(files[i])
    }
    this.setData({
      imageFiles: imageFiles
    })
  },

  /**
   * 选择标签
   */
  onTagTap(event) {
    const labelId = event.currentTarget.dataset.label
    let chooseCount = this.data.chooseCount
    let labels = this.data.labels
    let canAnon = true
    let labelsActive = []

    // 标签状态设置
    for (let i = 0; i < labels.length; i++) {
      if (labelId == labels[i].id) {
        const active = labels[i].active
        if (active) {
          chooseCount--
          labels[i].active = !active
        } else {
          if (chooseCount == 3) {
            wx.lin.showMessage({
              type: "error",
              content: "最多选择3个标签！"
            })
          } else {
            chooseCount++
            labels[i].active = !active
          }
        }
      }
    }

    // 是否显示匿名开关
    for (let i = 0; i < labels.length; i++) {
      if (labels[i].active) {
        labelsActive.push(labels[i].id)
      }
      if (labels[i].active && !labels[i].allowed_anon) {
        canAnon = false
      }
    }
    if (chooseCount == 0) {
      canAnon = false
    }

    this.setData({
      labels: labels,
      canAnon: canAnon,
      labelsActive: labelsActive,
      chooseCount: chooseCount
    })
  },

  /**
   * 多图上传
   */
  sendImages(imageFiles) {
    return Promise.all(imageFiles.map((imageFile) => {
      return this.sendMedia(imageFile)
    }))
  },

  /**
   * 多媒体文件上传至OSS
   */
  sendMedia(imageFile, path = 'topic') {
    return new Promise(function (resolve, reject) {
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
   * 点击发布
   */
  onSubmitTap() {
    const content = this.data.content
    const isAnon = this.data.isAnon
    const labels = this.data.labelsActive
    const imageFiles = this.data.imageFiles
    let video = this.data.video

    if (!wxutil.isNotNull(content)) {
      wx.lin.showMessage({
        type: "error",
        content: "内容不能为空！"
      })
      return
    }

    // 授权模板消息
    const templateId = this.data.commentTemplateId
    const that = this

    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      complete() {
        // 发布话题
        wxutil.showLoading("发布中...")
        let data = {
          content: content,
          is_anon: isAnon,
          images: [],
          labels: labels
        }
        // 图文
        if (imageFiles.length > 0) {
          that.sendImages(imageFiles).then((res) => {
            data.images = res
            that.uploadTopic(data)
          })
        }
        // 视文
        else if (video) {
          that.sendMedia(video.src, 'video').then((src) => {
            that.sendMedia(video.cover, 'video-cover').then((cover) => {
              video.src = src
              video.cover = cover
              that.setData({
                video: video
              })
              data.video = video
              that.uploadTopic(data)
            })
          })
        }
        // 纯文
        else {
          that.uploadTopic(data)
        }
      }
    })
  },

  /**
   * 上传话题
   */
  uploadTopic(data) {
    const url = api.topicAPI

    wxutil.request.post(url, data).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        wx.lin.showMessage({
          type: "success",
          content: "发布成功！",
          success() {
            wxutil.setStorage("refreshTopics", true)
            wx.navigateBack()
          }
        })
      } else {
        wx.lin.showMessage({
          type: "error",
          content: "发布失败！"
        })
      }
    })
  },

  /**
   * 选择视频
   */
  onChangeVideo() {
    const that = this
    wx.chooseMedia({
      count: 9,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        const videoRes = res.tempFiles[0]
        that.setData({
          video: {
            src: videoRes.tempFilePath,
            cover: videoRes.thumbTempFilePath,
            duration: videoRes.duration,
            height: videoRes.height,
            width: videoRes.width,
            size: videoRes.size,
          }
        })
      }
    })
  },

  /**
   * 删除视频
   */
  onDelVideo() {
    this.setData({
      video: null
    })
  },

  onShareAppMessage() {
    return {
      title: "编辑资料",
      path: "/pages/topic-edit/index"
    }
  }
})