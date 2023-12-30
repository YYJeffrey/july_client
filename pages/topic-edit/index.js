// pages/topic-edit/index.js
import api from '../../config/api'
import template from '../../config/template'
import wxutil from '../../miniprogram_npm/@yyjeffrey/wxutil/index'
import { init, upload } from '../../utils/qiniuUploader'
import { Label } from '../../models/label'
import { OSS } from '../../models/oss'
import { Topic } from '../../models/topic'
import { Video } from '../../models/video'

Page({
  data: {
    labels: [],
    imageFiles: [],
    labelsActive: [], // 选中的标签
    height: 1000,  // 内容区高度
    canAnon: false, // 是否可匿名
    isAnon: false,  // 是否为匿名话题
    content: null,
    video: null
  },

  onLoad() {
    this.getLabels()
    this.getScrollHeight()
  },

  /**
   * 获取窗口高度
   */
  getScrollHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const windowHeight = systemInfo.windowHeight

    const query = wx.createSelectorQuery()
    query.select('.btn-send').boundingClientRect(rect => {
      const btnHeight = rect.height
      this.setData({
        height: windowHeight - btnHeight
      })
    }).exec()
  },

  /**
   * 获取标签
   */
  async getLabels() {
    const data = await Label.getLabelList()
    this.setData({
      labels: data
    })
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
    this.setData({
      imageFiles: event.detail.all
    })
  },

  /**
   * 选择标签
   */
  onTagTap(event) {
    const labelId = event.currentTarget.dataset.label
    const labels = this.data.labels
    let labelsActive = this.data.labelsActive
    let canAnon = true

    // 当前标签
    const label = labels.find(item => {
      return item.id === labelId
    })

    if (!label.active && labelsActive.length >= 3) {
      wx.lin.showMessage({
        type: 'error',
        content: '最多选择3个标签！'
      })
      return
    }
    label.active = !label.active

    // 激活的标签
    labelsActive = []
    labels.forEach(item => {
      if (item.active) {
        labelsActive.push(item.id)
        if (!item.allowed_anon) {
          canAnon = false
        }
      }
    })

    if (labelsActive.length === 0) {
      canAnon = false
    }

    this.setData({
      labels: labels,
      labelsActive: labelsActive,
      canAnon: canAnon
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
   * 媒体文件上传至OSS
   */
  sendMedia(imageFile, path = 'topic') {
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
   * 选择视频
   */
  onChangeVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        const videoRes = res.tempFiles[0]
        this.setData({
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

  /**
   * 点击发布
   */
  sumitTopic() {
    const content = this.data.content

    if (!wxutil.isNotNull(content)) {
      wx.lin.showMessage({
        type: 'error',
        content: '内容不能为空！'
      })
      return
    }

    const imageFiles = this.data.imageFiles
    let video = this.data.video

    // 授权订阅消息
    wx.requestSubscribeMessage({
      tmplIds: [template.messageTemplateId],
      complete: async () => {
        wxutil.showLoading('发布中...')
        const data = {
          content: content,
          is_anon: this.data.isAnon,
          images: [],
          labels: this.data.labelsActive
        }

        // 发布图文
        if (imageFiles.length > 0) {
          await this.initQiniu()
          this.sendImages(imageFiles).then((res) => {
            data.images = res
            this.uploadTopic(data)
          })
        }
        // 发布视文
        else if (video) {
          await this.initQiniu()
          this.sendMedia(video.src, 'video').then(src => {
            this.sendMedia(video.cover, 'video-cover').then(async cover => {
              video.src = src
              video.cover = cover
              this.setData({
                video: video
              })
              const res = await Video.uploadVideo(video)
              if (res.code === 1) {
                data.video_id = res.data.video_id
                this.uploadTopic(data)
              }
            })
          })
        }
        // 发布纯文
        else {
          this.uploadTopic(data)
        }
      }
    })
  },

  /**
   * 上传话题
   */
  async uploadTopic(data) {
    const res = await Topic.sendTopic(data)
    wx.hideLoading()
    if (res.code === 1) {
      wx.lin.showMessage({
        type: 'success',
        content: '发布成功！',
        success: () => {
          wxutil.setStorage('refreshTopics', true)
          wx.navigateBack()
        }
      })
    } else {
      wx.lin.showMessage({
        type: 'error',
        content: '发布失败！'
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '主页',
      path: '/pages/topic/index'
    }
  }
})
