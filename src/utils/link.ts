/**
 * 创建终端超链接
 *
 * sobird<i@sobird.me> at 2025/12/13 15:30:15 created.
 */

export function link(text: string, url: string) {
  return `\x1B]8;;${url}\x07${text}\x1B]8;;\x07`;
}
