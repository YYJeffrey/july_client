// const baseAPI = "http://192.168.123.200:5000/api/v1/"
// const socketAPI = "ws://192.168.123.200:5000/"

const baseAPI = "https://api.july.yejiefeng.com/api/v1/"
const socketAPI = "wss://api.july.yejiefeng.com/"
const ossDomain = "https://img.yejiefeng.com"

export default {
  baseAPI, // 根接口
  socketAPI: socketAPI, // Socket接口
  ossDomain: ossDomain, // OSS域名
  labelAPI: baseAPI + "label/", // 标签接口
  topicAPI: baseAPI + "topic/", // 话题接口
  holeAPI: baseAPI + "hole/", // 树洞接口
  chatResAPI: baseAPI + "chat/", // 聊天记录接口
  userAPI: baseAPI + "user/", // 用户接口
  followingAPI: baseAPI + "following/", // 关注接口
  commentAPI: baseAPI + "comment/", // 评论接口
  starAPI: baseAPI + "star/", // 收藏接口
  templateAPI: baseAPI + "template/", // 模板接口
  messageAPI: baseAPI + "message/", // 消息接口
  ossAPI: baseAPI + "oss/", // 存储接口
  chatAPI: socketAPI + "chat" // 聊天接口
}