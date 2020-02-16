// pages/topic-edit/index.js
const app = getApp()
const api = app.api
const wxutil = app.wxutil

Page({
  data: {
    labels: [],
    imageFiles: [], //  图片文件列表
    labelsActive: [], // 选中的标签
    chooseCount: 0,
    canAnon: false,
    isAnon: false,
    content: null,
    commentTemplateId: null
  },

  onLoad() {
    this.getLabels()
    this.getTemplateId()
  },

  /**
   * 获取标签
   */
  getLabels() {
    const that = this
    const url = api.labelAPI
    const data = {
      app_id: app.globalData.appId
    }

    wxutil.request.get(url, data).then((res) => {
      if (res.data.code == 200) {
        this.setData({
          labels: res.data.data
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
      if (res.data.code == 200) {
        this.setData({
          commentTemplateId: res.data.data.template_id
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
   * 选择图片
   */
  onChangeImage(event) {
    const files = event.detail.all
    let imageFiles = []
    for (let i = 0; i < files.length; i++) {
      imageFiles.push(files[i].url)
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
  sendImages(imageFiles, i = 0) {
    let images = []
    let complete = 0

    return new Promise((resolve, reject) => {
      function upload(imageFiles, i) {
        const url = api.topicAPI + "images/"
        const index = i

        wxutil.file.upload({
          url: url,
          fileKey: "file",
          filePath: imageFiles[i]
        }).then((res) => {
          const data = JSON.parse(res.data);
          if (data.code == 200) {
            let image = {}
            image["url"] = data.data.url
            image["index"] = index
            images.push(image)

            complete++
            if (complete == imageFiles.length) {
              resolve(images)
            }
          }
        }).catch((error) => {
          reject(error)
        })

        // 递归上传图片
        if (i < imageFiles.length - 1) {
          upload(imageFiles, ++i)
        }
      }
      // 首次调用
      upload(imageFiles, i)
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
   * 点击发布
   */
  onSubmitTap() {
    const content = this.data.content
    const isAnon = this.data.isAnon
    const labels = this.data.labelsActive
    const imageFiles = this.data.imageFiles
    let images = []

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

        if (imageFiles.length > 0) {
          that.sendImages(imageFiles).then((res) => {
            // 图片顺序可能打乱，首先排序
            let imageList = res
            imageList = imageList.sort(that.compare("index"))

            for (let i = 0; i < imageList.length; i++) {
              images.push(imageList[i].url)
            }
            that.uploadTopic(content, isAnon, images, labels)
          })
        } else {
          that.uploadTopic(content, isAnon, images, labels)
        }
      }
    })
  },

  /**
   * 上传话题
   */
  uploadTopic(content, isAnon, images, labels) {
    const url = api.topicAPI

    const data = {
      content: content,
      is_anon: isAnon,
      images: images,
      labels: labels
    }

    wxutil.request.post(url, data).then((res) => {
      wx.hideLoading()
      if (res.data.code == 200) {
        wx.lin.showMessage({
          type: "success",
          content: "发布成功！",
          success() {
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
   * 属性值排序法
   */
  compare(property) {
    return function(a, b) {
      var valueA = a[property];
      var valueB = b[property];
      return valueA - valueB;
    }
  },

  onShareAppMessage() {
    return {
      title: "编辑资料",
      path: "/pages/topic-edit/index"
    }
  }
})