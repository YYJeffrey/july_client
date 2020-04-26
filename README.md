# july_client
![](https://img.shields.io/badge/build-passing-brightgreen)

七月微信小程序——客户端

这是一款集成了Lin UI开发而成的SaaS社交平台微信小程序。

该项目发起于2019年七月份，故名为“七月”，断断续续开发了快一年，打算由私仓转为开源，开发之时这是“一个人的社交平台”，自己发动态，自己评论自己，自己和自己聊天，孤独但不失情怀，平台最初的数据会带着个人的情感在内，又不舍得删掉，请大家不要介意。

整个系统由多个项目构成，其中后端API服务由Flask开发而成，暂时还未开源，可以通过下方API文档查看具体的接口说明。


## 技术栈
- Lin UI（一款微信小程序的UI框架）：https://github.com/TaleLin/lin-ui
- wxutil（一款非常好用的工具库）：https://github.com/YYJeffrey/wxutil


## 快速开始
1. 下载源码  
```
git clone git@github.com:YYJeffrey/july_api.git
```

2. 安装依赖  
该项目源码中已经存在miniprogram_npm文件夹，故该步骤可以跳过，若需要安装其他扩展，请确保您已经安装了npm，并使用`npm install`安装所需依赖。

3. 修改AppID  
该项目是一个SaaS平台，您使用的测试号或者其他或者其他未注册到该平台的AppID时是没有任何数据的，可以通过修改**app.js**中globalData下的appId，将其改成本小程序的AppID即可`wx0611fd1ba2b0bcd6`即可，具体代码见下。

```
globalData: {
  appId: "wx0611fd1ba2b0bcd6",
  ...
},
```


## API文档
这是一套RESTful API，每一个功能模块对应着一种资源，简洁明了，清晰直观。
[API文档地址](https://api.july.yejiefeng.com/api/doc)

**功能模块**
- 平台模块
  - 获取平台详情
- 用户模块
  - 新增用户及授权
  - 更新用户信息
  - 上传用户头像
  - 上传用户封面
  - 获取用户详情
- 关注模块
  - 新增关注或取关
  - 获取被关注用户列表
  - 获取关注用户列表
  - 获取关注用户详情
- 标签模块
  - 获取标签列表
  - 获取标签详情
- 话题模块
  - 新增话题
  - 获取话题列表
  - 上传话题图片
  - 举报话题
  - 获取用户话题列表
  - 删除话题
  - 获取话题详情
- 收藏模块
  - 新增收藏或取消收藏
  - 获取话题收藏列表
  - 获取用户收藏列表
  - 获取收藏详情
- 评论模块
  - 新增评论
  - 获取评论列表
  - 获取用户评论
  - 删除评论
  - 获取评论详情
- 树洞模块
  - 获取树洞列表
  - 树洞图片上传
  - 预约树洞
  - 获取树洞详情
- 消息模块
  - 获取消息列表
  - 获取消息概要
  - 获取消息详情
- 模板模块
  - 获取模板详情


## 效果展示
<img src="https://img.yejiefeng.com/screenshots/1-%E8%AF%9D%E9%A2%98%E5%88%97%E8%A1%A8.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/2-%E8%AF%9D%E9%A2%98%E5%88%97%E8%A1%A8.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/3-%E8%AF%9D%E9%A2%98%E5%88%97%E8%A1%A8.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/4-%E8%AF%9D%E9%A2%98%E8%AF%A6%E6%83%85.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/5-%E8%AF%9D%E9%A2%98%E8%AF%A6%E6%83%85.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/6-%E6%A0%91%E6%B4%9E%E5%88%97%E8%A1%A8.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/7-%E6%A0%91%E6%B4%9E%E8%AF%A6%E6%83%85.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/8-%E6%A0%91%E6%B4%9E%E6%B7%B1%E5%A4%84.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/9-%E7%94%A8%E6%88%B7%E6%8E%88%E6%9D%83.jpeg-clipping" width="30%" /></br></br>

<img src="https://img.yejiefeng.com/screenshots/10-%E4%B8%AA%E4%BA%BA%E4%B8%AD%E5%BF%83.jpeg-clipping" width="30%" />