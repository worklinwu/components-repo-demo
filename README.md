#components-repo-demo

## 目录

- [目录](#%e7%9b%ae%e5%bd%95)
- [背景](#%e8%83%8c%e6%99%af)
- [Codeing](#codeing)
- [Lerna 的相关操作](#lerna-%e7%9a%84%e7%9b%b8%e5%85%b3%e6%93%8d%e4%bd%9c)
- [组件仓库项目](#%e7%bb%84%e4%bb%b6%e4%bb%93%e5%ba%93%e9%a1%b9%e7%9b%ae)
- [使用 npm link 在项目中调试](#%e4%bd%bf%e7%94%a8-npm-link-%e5%9c%a8%e9%a1%b9%e7%9b%ae%e4%b8%ad%e8%b0%83%e8%af%95)

## 背景

我们公司目前开发的项目是使用 Vue 搭建的后台管理应用.  
随着同质的项目慢慢的变多, 原先维护在一个项目里的组件在其他项目也会用到, 而组件会随着业务的要求, 进行相应的升级和修改. 这就导致修改一个组件需要同步代码到其他项目. 所以非常需要一个`组件仓库`的存在, 将自己的通用组件和通用的业务组件统一放在一个地方, 在各个项目通过 `npm` 的方式去进行版本管理.  

搜寻了一些解决方案, 我们团队把方案定在了使用 `Coding.net 提供的服务` + `Lerna` 来实现我们的组件仓库的搭建.

## Coding

先说 Coding.  

为什么我们不选择租用服务器, 搭建私有的 npm 仓库呢. 主要因为(~~界面好看~~)集成了我们需要的所有服务, 包括(但不限于)代码托管/制品库/方便权限管理/比较好的交互体验/私有库/免费?.  

关于付费问题, 官网的价格策略是说 5 人以下团队免费, 我想可以满足很多小团队的需求了. 但是免费用户只能创建 20 个项目, 对于有很多组件的项目, 如果代码都要托管, 那肯定不够, 所以就有了 `Lerna` 的登场, 把所有组件整合在一个项目里面, 还能独立发布组件.

- 注册 codeing 账号 并建立对应的项目
  - 省略
- 创建项目
  - 省略
- 创建 Coding 的制品库
  - 项目设置->功能开关->制品库 启用
  - 制品库->新建
  - 打开制品库的指引选项卡, **按教程配置**
- 创建好制品库后, 要配置本地的 npm 与我们的制品库关联
  - `npm config get registry`  => <https://registry.npmjs.org/>
  - `yarn config get registry`  => <https://registry.yarnpkg.com>
  - `npm config set registry=(你的制品库地址)`
  - 项目设置->开发者选项->项目令牌, 创建新的代码仓库的账户;
    - 查看当前登录的用户 `npm whoami`
    - 在控制台, 使用 `npm login` 登录刚刚创建的用户
  - 或者使用 `使用访问令牌生成配置` (推荐使用)

## Lerna 的相关操作

这里就省略了`Lerna`的介绍了, 网络上可以查的到  

Lerna 的常用命令:  

```sh
lerna init #初始化
lerna bootstrap #下载依赖包或者生成本地软连接
lerna add axios #所有包都添加axios
lerna add packageB --scope=packageA # 添加依赖 / packageA 生成了node_modules，而node_modules里生成了指向 packageB 的软链，类似npm link的效果
lerna publish
lerna list
lerna clean
```

自己的项目中`lerna.json`的配置

```json
{
  "packages": [
    "packages/*" // 要发布的包的路径
  ],
  "command": {
    "publish": {
      "ignoreChanges": [
        "ignored-file",
        "*.md", // 我们团队的约定: 更新说明文档不算为组件更新
        "package.json" // 每次更新版本后都会导致修改版本号的这个文件变成未提交, 所以排除
      ]
    }
  },
  "version": "independent" // 包独立发布
}
```

到此, 我们创建新的组件或者更新组件就可以这样做:

- 先提交自己的代码到 git 仓库
- 执行 `lerna publish` 根据需要修改版本好
  
就可以把自己的组件发布到 Coding 的制品库了

在目标的项目下面:

- `npm i 目标包名 --registry=制品库地址(如果已经全局配置就可以省略)`

## 组件仓库项目

这里还有一个问题就是组件的调试问题.  
方法一: 使用 `npm link` 把包关联到目标项目来调试
方法二: 在项目里面添加一个测试的环境

项目的目录及说明如下:

```text
├─ packages // 组件源文件
| ├─ CSelect
| | ├─  components // 子组件
| | ├─  package.json // 组件描述文件
| | ├─  index.js // 组件入口
| | ├─  c-select.vue
| | └─  README.md // 文档
├─ public
| ├─  index.html
| └─  favicon.ico
├─ src // 测试项目源文件
| ├─ assets
| | └─  logo.png
| ├─ components
| | ├─ CodeEditor // 使用了一个所见即所得的代码编辑器, 使得项目部署后方便调试不同的参数
| | | ├─  index.js
| | | └─  CodeEditor.vue
| ├─ router
| | └─  index.js
| ├─ styles
| | ├─  index.scss
| | └─  element-ui.scss
| ├─ utils
| | ├─  index.js
| | └─  api.js
| ├─ views
| | ├─ examples
| | | ├─ c-select
| | | | ├─  index.vue
| | | | └─  code.js
| | └─  Home.vue
| ├─  main.js
| └─  App.vue
├─  vue.config.js
├─  package.json
├─  lerna.json
├─  babel.config.js
├─  README.md
├─  .npmrc
├─  .gitignore
├─  .eslintrc.js
├─  .browserslistrc
└─  .DS_Store
```

## 使用 npm link 在项目中调试

[npm link的使用](https://www.jianshu.com/p/aaa7db89a5b2)
