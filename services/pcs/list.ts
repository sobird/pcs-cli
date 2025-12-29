/**
 * 获取文档列表
 *
 * 本接口用于获取用户指定目录下的文档列表，本接口必须经过用户授权后才可正常使用
 *
 * 请求结构
 *
 * GET /rest/2.0/xpan/file?method=doclist HTTP/1.1
 * Host: pan.baidu.com
 *
 * https://pcs.baidu.com/rest/2.0/pcs/file?method=list&access_token=[access_token]&path=/
 *
 * sobird<i@sobird.me> at 2025/12/22 15:56:56 created.
 */

export interface PCSFile {
  app_id: number;
  black_tag: number;
  category: number;
  ctime: number;
  extent_int2: number;
  extent_int8: number;
  extent_tinyint7: number;
  from_type: number;
  fs_id: number;
  is_scene: number;
  isdelete: number;
  isdir: 0 | 1;
  local_ctime: number;
  local_mtime: number;
  mtime: number;
  oper_id: number;
  owner_id: number;
  owner_type: number;
  path: string;
  pl: number;
  real_category: string;
  server_atime: number;
  server_ctime: number;
  server_filename: string;
  server_mtime: number;
  share: 0;
  size: number;
  status: number;
  tkbind_id: number;
  unlist: number;
  user_id: number;
  wpfile: number;
}

export interface PCSListResponse {
  list: PCSFile[],
  request_id: number;
}

export interface PCSListParams {
  method: 'list';
  access_token: string;
  path: string;
}
