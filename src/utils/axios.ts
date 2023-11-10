/**
 * 全局代理项目所有浏览器接口请求，框架级配置，请谨慎修改。
 * Axios 是一个基于 Promise 的 HTTP 库，可以用在浏览器和Node.js中。
 *
 * @see https://axios-http.com/zh/docs/intro
 * sobird<i@sobird.me> at 2021/02/20 11:18:13 created.
 */

import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export type ResponseParser<T = unknown> = (response: AxiosResponse) => T;

export interface InternalHttpRequestConfig<T = unknown> extends InternalAxiosRequestConfig<T> {
  responseParser?: ResponseParser;
}

interface HttpResponse<T = unknown, D = unknown> extends AxiosResponse<T, D> {
  config: InternalHttpRequestConfig<D>;
}

/**
 * 全局的 axios 默认值，所有新建的Axios实例将继承此处的设置
 *
 * 配置的优先级 配置将会按优先级进行合并。
 * 它的顺序是：在lib/defaults.js中找到的库默认值，然后是实例的 defaults 属性，最后是请求的 config 参数。
 * 后面的优先级要高于前面的。
 */
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10 * 1000;
// 全局默认的baseURL参数配置
axios.defaults.baseURL = "https://pcs.baidu.com/rest/2.0";

// axios.defaults.headers.common['Request-Source'] = 2;
// ssoid
// axios.defaults.headers.common['access-token'] = SSO_ACCESS_TOKEN;
// axios.defaults.headers.common['client-id'] = SSO_CLIENT_ID;

// 请求拦截器
axios.interceptors.request.use(
  (config: InternalHttpRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (response: HttpResponse) => {
    const { config, data } = response;
    return config.responseParser ? config.responseParser(response) : data;
  },
  (error: AxiosError) => {
    const { request, response } = error;

    if (response) {
      // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
      switch (response.status) {
        case 401:
          break;
        case 404:
          break;
        default:
      }
    } else if (request) {
      // 请求已经成功发起，但没有收到响应
    }
    return Promise.reject(error);
  }
);

export default axios;
