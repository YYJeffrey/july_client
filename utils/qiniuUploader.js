/**
 * https://github.com/gpake/qiniu-wxapp-sdk
 */

(function () {
  var config = {
    qiniuRegion: '',
    qiniuBucketURLPrefix: '',
    qiniuUploadToken: '',
    qiniuUploadTokenURL: '',
    qiniuUploadTokenFunction: function () { },
    qiniuShouldUseQiniuFileName: false
  }

  function init(options) {
    updateConfigWithOptions(options)
  }

  function updateConfigWithOptions(options) {
    if (options.region) {
      config.qiniuRegion = options.region
    } else {
      console.error('qiniu uploader need your bucket region')
    }
    if (options.uptoken) {
      config.qiniuUploadToken = options.uptoken
    } else if (options.uptokenURL) {
      config.qiniuUploadTokenURL = options.uptokenURL
    } else if (options.uptokenFunc) {
      config.qiniuUploadTokenFunction = options.uptokenFunc
    }
    if (options.domain) {
      config.qiniuBucketURLPrefix = options.domain
    }
    config.qiniuShouldUseQiniuFileName = options.shouldUseQiniuFileName
  }

  function upload(filePath, success, fail, options, progress, cancelTask) {
    if (null == filePath) {
      console.error('qiniu uploader need filePath to upload')
      return
    }
    if (options) {
      updateConfigWithOptions(options)
    }
    if (config.qiniuUploadToken) {
      doUpload(filePath, success, fail, options, progress, cancelTask)
    } else if (config.qiniuUploadTokenURL) {
      getQiniuToken(function () {
        doUpload(filePath, success, fail, options, progress, cancelTask)
      })
    } else if (config.qiniuUploadTokenFunction) {
      config.qiniuUploadToken = config.qiniuUploadTokenFunction()
      if (null == config.qiniuUploadToken && config.qiniuUploadToken.length > 0) {
        console.error('qiniu UploadTokenFunction result is null, please check the return value')
        return
      }
      doUpload(filePath, success, fail, options, progress, cancelTask)
    } else {
      console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]')
      return
    }
  }

  function doUpload(filePath, success, fail, options, progress, cancelTask) {
    if (null == config.qiniuUploadToken && config.qiniuUploadToken.length > 0) {
      console.error('qiniu UploadToken is null, please check the init config or networking')
      return
    }
    var url = uploadURLFromRegionCode(config.qiniuRegion)
    var fileName = filePath.split('//')[1]
    if (options && options.key) {
      fileName = options.key
    }
    var formData = {
      'token': config.qiniuUploadToken
    }
    if (!config.qiniuShouldUseQiniuFileName) {
      formData['key'] = fileName
    }
    var uploadTask = wx.uploadFile({
      url: url,
      filePath: filePath,
      name: 'file',
      formData: formData,
      success: function (res) {
        var dataString = res.data
        try {
          var dataObject = JSON.parse(dataString)
          var fileURL = config.qiniuBucketURLPrefix + '/' + dataObject.key
          dataObject.fileURL = fileURL
          dataObject.imageURL = fileURL
          if (success) {
            success(dataObject)
          }
        } catch (e) {
          console.log('parse JSON failed, origin String is: ' + dataString)
          if (fail) {
            fail(e)
          }
        }
      },
      fail: function (error) {
        console.error(error)
        if (fail) {
          fail(error)
        }
      }
    })
    uploadTask.onProgressUpdate((res) => {
      progress && progress(res)
    })
    cancelTask && cancelTask(() => {
      uploadTask.abort()
    })
  }

  function getQiniuToken(callback) {
    wx.request({
      url: config.qiniuUploadTokenURL,
      success: function (res) {
        var token = res.data.uptoken
        if (token && token.length > 0) {
          config.qiniuUploadToken = token
          if (callback) {
            callback()
          }
        } else {
          console.error('qiniuUploader cannot get your token, please check the uptokenURL or server')
        }
      },
      fail: function (error) {
        console.error('qiniu UploadToken is null, please check the init config or networking: ' + error)
      }
    })
  }

  function uploadURLFromRegionCode(code) {
    var uploadURL = null
    switch (code) {
      case 'ECN': uploadURL = 'https://up.qiniup.com'; break
      case 'NCN': uploadURL = 'https://up-z1.qiniup.com'; break
      case 'SCN': uploadURL = 'https://up-z2.qiniup.com'; break
      case 'NA': uploadURL = 'https://up-na0.qiniup.com'; break
      case 'ASG': uploadURL = 'https://up-as0.qiniup.com'; break
      default: console.error('please make the region is with one of [ECN, SCN, NCN, NA, ASG]')
    }
    return uploadURL
  }

  module.exports = {
    init: init,
    upload: upload
  }
})()
