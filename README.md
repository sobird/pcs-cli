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
  init [options]                          initialize baidu pcs
  refresh [options]                       refresh token
  quota [options]                         check your cloud storage status
  meta [options] [path]                   get path meta
  list|ll [options] [path]                list directory contents
  upload [options] [pattern] [remote]     upload local file
  download|dl [options] [remote] [local]  download remote file
  delete|rm [options] <remote>            delete remote file
  fetch [options] [source] [remote]       fetch source to remote
  help [command]                          display help for command
```

### init
在初始化之前，需要提供百度PCS应用的name，key，secret。如果没有请访问 [创建应用](https://pan.baidu.com/union/console/createapp) 进行创建，如果已有应用请访问 [应用列表](https://pan.baidu.com/union/console/applist) 查看应用信息。

```sh
pcs init -n name -k key -s secret
# 或者 根据提示填写应用的name key secret
pcs init 
```
初始化完成后，将在本地生成一个有效期30天的token，存放路径为`~/.pcs-cli`。

### refresh
`access_token` 有效期30天，过期后支持刷新，刷新后的 `access_token` 有效期仍为 30 天，刷新 `access_token` 请按需刷新，不需要不停的刷新。

刷新请求，如果API返回失败，旧的 `refresh_token` 会失效，此时需要重新发起授权请求，获取新的 `access_token`、`refresh_token`，而不是使用旧的 `refresh_token` 循环再发起刷新请求。

`refresh_token` 只支持使用一次，`refresh_token` 使用后失效，下次刷新 `access_token` 时需要使用上一次刷新请求响应中的 `refresh_token`。

```sh
pcs refresh
Successfully refreshed token
```

### quota
该命令用来查看pcs配额状态

```sh
pcs quota
███████████████░░░░░░░░░░░░░░░ 1.6TB/3.1TB 51%
```

### meta
用于获取用户指定文件的meta信息，meta信息包括文件名字、文件创建时间、文件的下载地址等。

```sh
# 不指定路径，默认使用应用的根路径
pcs meta
```

### list
获取指定目录下的文件列表。

```sh
# 不指定路径，默认使用应用的根路径
pcs list
2023/11/13 13:40:12          1MB  split23.mp4
2023/11/13 13:40:14          1MB  split22.mp4
2023/11/13 13:40:15         107B  package.json
2023/11/13 13:40:17      527.7KB  IMG_3224.jpeg
2023/11/13 13:40:23       2.21MB  IMG_3222.jpeg
```

### upload
上传文件

```sh
# 不指定本地文件路径，默认上传当前目录下的所有文件
pcs upload
```

### download
下载文件

```sh
# 不指定远程文件路径，默认下载远程根目录下的所有文件
pcs download
```

### delete
删除远程文件

```sh
pcs rm 
```

### fetch
离线下载(貌似不支持)

```sh
pcs fetch [source] [remote]
```

[npm]: https://img.shields.io/npm/v/pcs-cli.svg
[npm-url]: https://www.npmjs.com/package/pcs-cli
[build-status]: https://img.shields.io/github/actions/workflow/status/sobird/pcs-cli/npm-publish.yml?label=CI&logo=github
[build-status-url]: https://github.com/sobird/pcs-cli/actions
[size]: https://packagephobia.com/badge?p=pcs-cli
[size-url]: https://packagephobia.com/result?p=pcs-cli
