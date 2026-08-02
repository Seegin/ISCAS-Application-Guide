// Cloudflare Worker：软件所「效忠」计数器
//
// 路由：
//   GET  /api/pledge  → 返回当前总次数（不递增），如 {"count": 42}
//   POST /api/pledge  → 总次数 +1，返回新总次数
//
// 防刷：同一 IP 60 秒内只能 POST 一次，超限返回 429（{"error":"rate_limited"}）。
//       24 小时冷却由前端 localStorage 控制，这里只挡暴力刷数字。
//
// 需要绑定一个 KV namespace，绑定变量名：PLEDGE_COUNT

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS 预检（浏览器跨域请求需要）
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname !== "/api/pledge") {
      return new Response("Not found", { status: 404 });
    }

    // 客户端真实 IP（Cloudflare 自动注入）
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    if (request.method === "POST") {
      // 防刷：同一 IP 60 秒内只能效忠一次（KV key 设 TTL 自动过期）
      const ipKey = "rl:" + clientIP;
      const recent = await env.PLEDGE_COUNT.get(ipKey);
      if (recent) {
        return json({ error: "rate_limited" }, 429);
      }
      await env.PLEDGE_COUNT.put(ipKey, String(Date.now()), { expirationTtl: 60 });

      // 递增总次数
      const key = "pledge_count";
      let count = parseInt((await env.PLEDGE_COUNT.get(key)) || "0", 10);
      count += 1;
      await env.PLEDGE_COUNT.put(key, String(count));
      return json({ count });
    }

    // GET：读取当前总次数
    const count = parseInt((await env.PLEDGE_COUNT.get("pledge_count")) || "0", 10);
    return json({ count });
  },
};
