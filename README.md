# july_client
![build](https://img.shields.io/badge/build-passing-brightgreen)
![build](https://img.shields.io/badge/license-Apache%202-blue)

七月微信小程序——客户端

一款集成Lin UI开发的SaaS社交平台微信小程序。海内存知己，天涯若比邻，期待大家的交流互动！

技术交流（闲聊吹水）群：592832957

<img src="./images/logo/qrcode.jpg" width="180px" />


## 技术栈
- Lin UI（一款优秀的微信小程序UI框架）：https://github.com/TaleLin/lin-ui
- wxutil（一款好用的微信小程序工具库）：https://github.com/YYJeffrey/wxutil


## 快速开始
1. **下载源码**  
    ```
    git clone git@github.com:YYJeffrey/july_api.git
    ```

2. **安装依赖（可选）**  
    项目源码中已安装好依赖，只需确保文件`miniprogram_npm`存在，故该步骤可以跳过。如需安装其他依赖，请自行使用`npm install`安装。

3. **注册APP_ID**  
    该项目是SaaS平台，可以使用自己的微信小程序APP ID注册加入七月联盟，通过[API文档](https://api.july.yejiefeng.com/api/doc)的“注册平台接口”填写相关信息注册。（完成了该步后第4步可不做）

    <img src="https://img.yejiefeng.com/screenshots/%E4%BF%AE%E6%94%B9APP_ID.png" width="650px" />

    注册时请确保`app_id`和`app_secret`的正确性，否则将无法完成注册。完成注册后小程序负责人可以通过登录[七月后台管理平台](https://admin.july.yejiefeng.com/)来管理自己的小程序，账号密码分别为`app_id`和`app_secret`。

    <img src="https://img.yejiefeng.com/screenshots/%E4%B8%83%E6%9C%88%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0.png" width="650px" />

4. **修改APP_ID（可选）**  
    若已完成上一步骤，则可跳过该步骤。若不便平台注册的，可以通过修改**app.js**中globalData下的appId，将其改成`wx0be6c8fa6d9cb4bf`即可，这一方案，用户授权、发布内容、通知接口等存在受限，仅少许接口可用，适用于测试显示内容等。

    ```
    globalData: {
      appId: "wx0be6c8fa6d9cb4bf",
      ...
    },
    ```

5. **订阅消息配置**  
    请确保第3步已经完成，配置订阅消息需要先在微信小程序平台内选择订阅的模板，七月使用了编号为`4652`的模板作为评论模板，编号为`372`的模板作为预约模板，建议使用相同编号的模板。  
    选择完模板后，需要登录[七月后台管理平台](https://admin.july.yejiefeng.com/)，进入模板管理，添加两个模板，其中模板名称必须为`评论模板`和`预约模板`，否则配置不会生效，模板键名需要用英文的逗号分隔，建议与七月保持一致。
    <img src="https://img.yejiefeng.com/screenshots/%E6%A8%A1%E6%9D%BF%E7%AE%A1%E7%90%86%E9%85%8D%E7%BD%AE.png" width="650px" />


## API文档
七月接口遵循RESTful开发风格，接口内容参阅下方链接。  
[API文档地址](https://api.july.yejiefeng.com/api/doc)

**功能模块**

<img src="https://img.yejiefeng.com/screenshots/%E6%8E%A5%E5%8F%A3%E5%8A%9F%E8%83%BD%E5%9B%BE.png" width="450px" />


## 产品展示
<img src="https://img.yejiefeng.com/screenshots/1-%E8%AF%9D%E9%A2%98%E5%88%97%E8%A1%A8.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/2-%E8%AF%9D%E9%A2%98%E5%88%97%E8%A1%A8.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/3-%E8%AF%9D%E9%A2%98%E5%88%97%E8%A1%A8.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/4-%E8%AF%9D%E9%A2%98%E8%AF%A6%E6%83%85.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/5-%E8%AF%9D%E9%A2%98%E8%AF%A6%E6%83%85.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/6-%E6%A0%91%E6%B4%9E%E5%88%97%E8%A1%A8.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/7-%E6%A0%91%E6%B4%9E%E8%AF%A6%E6%83%85.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/8-%E6%A0%91%E6%B4%9E%E6%B7%B1%E5%A4%84.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/9-%E7%94%A8%E6%88%B7%E6%8E%88%E6%9D%83.jpeg" width="280px" /><br/>

<img src="https://img.yejiefeng.com/screenshots/10-%E4%B8%AA%E4%BA%BA%E4%B8%AD%E5%BF%83.jpeg" width="280px" /><br/>


## 版本说明
* **v1.2.1** - 升级组件库版本，新增视频上传功能，树洞记录持久化
* **v1.1.4** - 完成用户信息接口适配，修改登录授权接口逻辑
* **v1.1.1** - 完成内容发布及图片显示等优化，开放SaaS平台管理系统
* **v0.0.1** - 小程序已达到生产使用标准，功能完善，上线数个月运行正常
