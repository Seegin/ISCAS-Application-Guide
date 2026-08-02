// Cloudflare Worker：软件所「效忠」计数器
//
// 路由：
//   GET  /api/pledge  → 返回当前总次数（不递增），如 {"count": 42}
//   POST /api/pledge  → 总次数 +1，返回新总次数
//
// 需要绑定一个 KV namespace，绑定变量名：PLEDGE_COUNT
//
// 部署方式见仓库说明 / README（Cloudflare 面板 → Workers → 粘贴本代码 →
// 创建 KV → 绑定 PLEDGE_COUNT → 部署）。

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

    const key = "pledge_count";
    let count = parseInt((await env.PLEDGE_COUNT.get(key)) || "0", 10);

    if (request.method === "POST") {
      count += 1;
      await env.PLEDGE_COUNT.put(key, String(count));
    }

    return new Response(JSON.stringify({ count }), {
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
