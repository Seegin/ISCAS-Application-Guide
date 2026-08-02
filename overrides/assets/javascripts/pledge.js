/* 软件所「效忠」计数器交互
   ⚠️ 部署 Cloudflare Worker 后，把 PLEDGE_API 替换成你的 Worker 地址，
      例如 'https://pledge-counter.你的账号.workers.dev/api/pledge'。
   未部署 Worker 时点击只弹窗、不计数，不影响使用。 */
document$.subscribe(function () {
  var btn = document.getElementById("pledge-btn");
  if (!btn) return;

  // TODO: 部署 Worker 后替换为真实地址
  var PLEDGE_API = "https://YOUR-WORKER.workers.dev/api/pledge";

  var overlay = document.getElementById("pledge-overlay");
  var closed = false;

  function setCount(n) {
    document.querySelectorAll(".isc-pledge-count").forEach(function (el) {
      el.textContent = String(n);
    });
  }

  // 页面加载时读取当前总次数（失败则静默，保持 0）
  fetch(PLEDGE_API)
    .then(function (r) { return r.json(); })
    .then(function (d) { setCount(d.count); })
    .catch(function () {});

  function showOverlay() {
    if (!overlay) return;
    overlay.hidden = false;
    closed = false;
    setTimeout(function () {
      if (!closed) { overlay.hidden = true; closed = true; }
    }, 3200);
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      overlay.hidden = true;
      closed = true;
    });
  }

  btn.addEventListener("click", function () {
    showOverlay();
    fetch(PLEDGE_API, { method: "POST" })
      .then(function (r) { return r.json(); })
      .then(function (d) { setCount(d.count); })
      .catch(function () {});
  });
});
