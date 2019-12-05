const baseAPI = 'http://192.168.123.200:5000/api/v1/'

module.exports = {
  baseAPI, // 根接口
  labelAPI: baseAPI + "label/", // 标签接口
  topicAPI: baseAPI + "topic/", // 话题接口
}