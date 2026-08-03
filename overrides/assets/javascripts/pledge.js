/* 软件所「效忠」计数器交互
   同一浏览器 24 小时内只能效忠一次，重复点击提示「你已经证明了你的决心」。 */
document$.subscribe(function () {
  var btn = document.getElementById("pledge-btn");
  if (!btn) return;

  // 同源代理：由 Cloudflare Pages Function（/api/pledge）转发到 Worker，
  // 避免手机端跨域直连 *.workers.dev 不稳定导致总人数读不到。
  var PLEDGE_API = "/api/pledge";
  var LAST_KEY = "pledge_last_time";
  var DAY_MS = 24 * 60 * 60 * 1000; // 24 小时

  var overlay = document.getElementById("pledge-overlay");
  var closed = false;

  function setCount(n) {
    document.querySelectorAll(".isc-pledge-count").forEach(function (el) {
      el.textContent = String(n);
    });
  }

  // 设置弹窗提示：正常效忠用「效忠」表情 + 胶囊，重复点击用「冲刺」表情 + 渐变大字
  function showPledgeResult(html, isRejected) {
    var num = overlay && overlay.querySelector(".isc-pledge-number");
    var img = overlay && overlay.querySelector(".isc-pledge-emoji");
    if (num) {
      num.innerHTML = html;
      num.className = isRejected ? "isc-pledge-message" : "isc-pledge-number";
    }
    if (img) {
      img.src = isRejected ? "assets/images/冲刺.jpg" : "assets/images/效忠.jpg";
    }
  }

  // 带超时的 fetch：避免手机网络下请求无限挂起
  function fetchWithTimeout(url, timeoutMs) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var opts = {};
    if (ctrl) opts.signal = ctrl.signal;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs);
    return fetch(url, opts).finally(function () { clearTimeout(timer); });
  }

  // 页面加载时读取当前总次数：超时 + 失败重试 1 次；仍失败则显示「—」而非误导性的 0
  function loadCount(retryLeft) {
    return fetchWithTimeout(PLEDGE_API, 8000)
      .then(function (r) { return r.json(); })
      .then(function (d) { setCount(d.count); })
      .catch(function (err) {
        if (retryLeft > 0) return loadCount(retryLeft - 1);
        setCount("—");
        console.warn("[效忠] 读取总人数失败：", err);
      });
  }
  loadCount(1);

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
    var now = Date.now();
    var last = parseInt(localStorage.getItem(LAST_KEY) || "0", 10);

    // 24 小时内已效忠过：拒绝重复点击，弹窗显示醒目提示
    if (now - last < DAY_MS) {
      showPledgeResult("你已经证明了你的决心", true);
      showOverlay();
      return;
    }

    showOverlay();
    fetch(PLEDGE_API, { method: "POST" })
      .then(function (r) {
        if (r.status === 429) {
          // Worker 端同 IP 24h 内已效忠过：与本地冷却一致的提示，并记录本机冷却
          showPledgeResult("你已经证明了你的决心", true);
          localStorage.setItem(LAST_KEY, String(now));
          return null;
        }
        return r.json();
      })
      .then(function (d) {
        if (d) {
          setCount(d.count);
          showPledgeResult("您是第 <b>" + d.count + "</b> 位宣誓者", false);
          localStorage.setItem(LAST_KEY, String(now));
        }
      })
      .catch(function () {
        // 即使计数请求失败，也记录本次点击，防止反复刷
        localStorage.setItem(LAST_KEY, String(now));
      });
  });
});
