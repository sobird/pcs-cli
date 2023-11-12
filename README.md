# pcs CLI

百度个人云存储命令行接口

[![npm][npm]][npm-url]
[![Build Status][build-status]][build-status-url]
[![Install Size][size]][size-url]

## 安装

```sh
npm i -g pcs-cli
```

## 使用
在终端执行下面命令：

```
pcs-cli [command] [options]
```

### 可用命令
```
Commands:
  init [options]                Initialize Baidu Personal Cloud Storage
  refresh                       refresh token.
  quota                         Check Your Cloud Storage Status.
  meta <path>                   Get Path Meta.
  list|ls <path>                list directory contents.
  download|dl [remote] [local]  download remote file.
  upload [local] [remote]       upload local file.
  delete|rm [remote]            delete remote file.
  fetch [source] [remote]       fetch source to remote.
  help [command]                display help for command
```

### init
在初始化之前，需要提供百度PCS应用的name，key，secret。如果没有请访问 [创建应用](https://pan.baidu.com/union/console/createapp) 进行创建，如果已有应用请访问 [应用列表](https://pan.baidu.com/union/console/applist) 查看应用信息。

```sh
pcs init
```


[npm]: https://img.shields.io/npm/v/pcs-cli.svg
[npm-url]: https://www.npmjs.com/package/pcs-cli
[build-status]: https://github.com/yangjunlong/pcs-cli/workflows/pcs-cli/badge.svg?branch=master
[build-status-url]: https://github.com/yangjunlong/pcs-cli/actions
[size]: https://packagephobia.com/badge?p=pcs-cli
[size-url]: https://packagephobia.com/result?p=pcs-cli