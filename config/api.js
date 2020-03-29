const baseAPI = "https://api.july.yejiefeng.com/api/v1/"
const socketAPI = "wss://api.july.yejiefeng.com/"

module.exports = {
  baseAPI, // 根接口
  socketAPI: socketAPI, // Socket接口
  labelAPI: baseAPI + "label/", // 标签接口
  topicAPI: baseAPI + "topic/", // 话题接口
  holeAPI: baseAPI + "hole/", // 树洞接口
  userAPI: baseAPI + "user/", // 用户接口
  followingAPI: baseAPI + "following/", // 关注接口
  commentAPI: baseAPI + "comment/", // 评论接口
  starAPI: baseAPI + "star/", // 收藏接口
  templateAPI: baseAPI + "template/", // 模板接口
  messageAPI: baseAPI + "message/", // 消息接口
  chatAPI: socketAPI + "chat" // 聊天接口
}