// Cloudflare Pages Function：效忠计数「同源代理」
//
// 背景：前端原来跨域直连 *.workers.dev（pledge-counter.xuefeiyu2026.workers.dev），
// 该域名在国内手机网络下经常超时/被干扰，导致「效忠总人数」读不到、永远显示 0。
// 本 Function 把 /api/pledge 请求在 Cloudflare 内部网络转发给 Worker，
// 前端改为请求同源地址 /api/pledge——手机只要能打开网页，就一定能读到计数。
//
// 上游是 worker/pledge-counter.js（Cloudflare Worker，本地维护、手动部署）。
const UPSTREAM = "https://pledge-counter.xuefeiyu2026.workers.dev/api/pledge";

export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

  // 透传真实客户端 IP，保证 Worker 端「同一 IP 24h 只能效忠一次」的防刷仍然有效。
  // 注意：必须用自定义头 X-Real-IP —— CF-Connecting-IP 经 Function 转发后会被
  // Cloudflare 覆盖成 Pages 函数节点 IP（所有用户相同），导致 Worker 把所有用户
  // 识别为同一 IP、防刷误伤所有人、计数被锁定。X-Real-IP 不会被覆盖。
  const headers = { "Content-Type": "application/json" };
  const clientIP = request.headers.get("CF-Connecting-IP");
  if (clientIP) headers["X-Real-IP"] = clientIP;

  // 原样透传 Worker 的响应（GET 200 {"count":N} / POST 200 或 429 {"error":"rate_limited"}）
  return fetch(UPSTREAM, { method, headers });
}
