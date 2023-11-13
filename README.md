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
  init [options]                          Initialize Baidu Personal Cloud Storage
  refresh [options]                       refresh token.
  quota [options]                         check your cloud storage status.
  meta [options] [path]                   get path meta.
  list|ll [options] [path]                list directory contents.
  upload [options] [pattern] [remote]     upload local file.
  download|dl [options] [remote] [local]  download remote file.
  delete|rm [options] <remote>            delete remote file.
  fetch [options] [source] [remote]       fetch source to remote.
  help [command]                          display help for command
```

### init
在初始化之前，需要提供百度PCS应用的name，key，secret。如果没有请访问 [创建应用](https://pan.baidu.com/union/console/createapp) 进行创建，如果已有应用请访问 [应用列表](https://pan.baidu.com/union/console/applist) 查看应用信息。

```sh
pcs init
```


[npm]: https://img.shields.io/npm/v/pcs-cli.svg
[npm-url]: https://www.npmjs.com/package/pcs-cli
[build-status]: https://img.shields.io/github/actions/workflow/status/sobird/pcs-cli/npm-publish.yml?label=CI&logo=github
[build-status-url]: https://github.com/sobird/pcs-cli/actions
[size]: https://packagephobia.com/badge?p=pcs-cli
[size-url]: https://packagephobia.com/result?p=pcs-cli
