const baseAPI = 'http://127.0.0.1:5000/v2'
const socketAPI = 'ws://127.0.0.1:5000/socket'
const ossDomain = 'https://img.yejiefeng.com'

export default {
  baseAPI, // 根接口
  socketAPI: socketAPI, // Socket接口
  ossDomain: ossDomain, // 对象存储域名
  authAPI: baseAPI + '/auth', // 授权接口
  chatResAPI: baseAPI + '/chat', // 聊天记录接口
  commentAPI: baseAPI + '/comment', // 评论接口
  followingAPI: baseAPI + '/following', // 关注接口
  holeAPI: baseAPI + '/hole', // 树洞接口
  labelAPI: baseAPI + '/label', // 标签接口
  messageAPI: baseAPI + '/message', // 消息接口
  ossAPI: baseAPI + '/oss', // 对象存储接口
  starAPI: baseAPI + '/star', // 收藏接口
  topicAPI: baseAPI + '/topic', // 话题接口
  userAPI: baseAPI + '/user', // 用户接口
  videoAPI: baseAPI + '/video', // 视频接口
  chatAPI: socketAPI + '/chat' // 聊天室接口
}
