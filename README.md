# july_client
![build](https://img.shields.io/badge/build-passing-brightgreen)
![build](https://img.shields.io/badge/license-Apache%202-blue)

七月微信小程序——客户端

一款集成 Lin UI 开发而成的 SaaS 社交微信小程序。海内存知己，天涯若比邻，期待大家的交流互动！

技术交流（闲聊吹水）群：592832957

<img src="https://img.yejiefeng.com/qr/july_qr_code.jpg" width="180px" />


## 技术栈
- Lin UI（一款优秀的微信小程序UI框架）：https://github.com/TaleLin/lin-ui
- wxutil（一款好用的微信小程序工具库）：https://github.com/YYJeffrey/wxutil


## 快速开始
1. **下载源码**  
    ```
    git clone git@github.com:YYJeffrey/july_api.git
    ```

2. **安装依赖（可选）**  
    源码中已安装好依赖，确保 `miniprogram_npm` 存在即可。如需安装其他依赖，请自行使用 `npm install` 安装。

3. **注册APP_ID**  
    该项目为 SaaS 平台，可使用自己微信小程序的 APP ID 注册加入七月联盟，仅可通过 [API文档](https://api.july.yejiefeng.com/api/doc) 的 “注册平台接口” 填写相关信息注册。

    <img src="https://img.yejiefeng.com/screenshots/%E4%BF%AE%E6%94%B9APP_ID.png" width="650px" />

    填写时需确保 `app_id` 和 `app_secret` 的正确性。
    
    完成注册后，负责人可通过 [七月后台管理平台](https://admin.july.yejiefeng.com/) 登录管理自己平台内容，账号密码分别为 `app_id` 和 `app_secret` 。

    <img src="https://img.yejiefeng.com/screenshots/%E4%B8%83%E6%9C%88%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0.png" width="650px" />

4. **修改APP_ID（可选）**  
    若已完成上一步骤，则该步骤可跳过。如不便注册平台，可通过修改 **app.js** 中`globalData` 下的 `appId`，将其改成 `wx0be6c8fa6d9cb4bf` 。
    
    但该方案用户授权、发布内容、关注收藏等接口受限。

    ```
    globalData: {
      appId: "wx0be6c8fa6d9cb4bf",
      ...
    },
    ```

5. **订阅消息配置**  
    请确保步骤3已完成，首先在微信小程序平台内选择订阅消息模板，七月使用了如下图所示的两个模板，用于评论和预约，建议使用与之类似的模板。

    <div style="display:flex;">
        <img src="https://img.yejiefeng.com/screenshots/%E8%AF%84%E8%AE%BA%E6%A8%A1%E6%9D%BF.png" width="265px" />
        <img src="https://img.yejiefeng.com/screenshots/%E9%A2%84%E7%BA%A6%E6%A8%A1%E6%9D%BF.png" width="265px" />
    </div>

    登录 [七月后台管理平台](https://admin.july.yejiefeng.com/) ，进入模板管理，添加两个模板，名称必须填写为 `评论模板` 和 `预约模板` 。
    
    模板键名为微信小程序平台内订阅消息详细内容部分的属性名，使用英文的逗号分隔，如下图所示。

    <img src="https://img.yejiefeng.com/screenshots/%E6%A8%A1%E6%9D%BF%E7%AE%A1%E7%90%86%E9%85%8D%E7%BD%AE.png" width="650px" />

6. **域名配置**  
    发布小程序，需进入[微信小程序后台](https://mp.weixin.qq.com/)的开发管理中配置如下域名：

    **request 域名**
    ```
    https://api.july.yejiefeng.com
    ```

    **socket 域名**
    ```
    wss://api.july.yejiefeng.com
    ```

    **uploadFile 域名**
    ```
    https://api.july.yejiefeng.com
    https://up.qiniup.com
    ```

    **downloadFile 域名**
    ```
    https://img.yejiefeng.com
    ```


## API文档
七月接口遵循 RESTful 开发风格，接口内容参阅下方链接。

[API文档地址](https://api.july.yejiefeng.com/api/doc)

**功能模块**

<img src="https://img.yejiefeng.com/screenshots/%E6%8E%A5%E5%8F%A3%E5%8A%9F%E8%83%BD%E5%9B%BE.png" width="450px" />


## 产品展示
<img src="https://img.yejiefeng.com/screenshots/1.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/2.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/3.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/4.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/5.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/6.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/7.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/8.PNG" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/9.jpeg" width="280px" /><br/>


## 版本说明
* **v1.4.1** - 适配头像昵称填写
* **v1.4.0** - 抽离模型层代码，重构代码，优化细节，升级组件库版本
* **v1.3.1** - 优化了包括我的页面在内的代码细节
* **v1.3.0** - 重构所有的页面，抽离必要的组件，升级组件库版本，优化代码细节
* **v1.2.1** - 升级组件库版本，新增视频上传功能，树洞记录持久化
* **v1.1.4** - 完成用户信息接口适配，修改登录授权接口逻辑
* **v1.1.1** - 完成内容发布，优化图片显示，开放SaaS平台管理系统
* **v0.0.1** - 完善小程序功能，发布上线


## 捐赠
如果觉得还不错，就支持一下作者吧 😊

<img src="https://img.yejiefeng.com/qr/qr_like.png" width="280px" />
