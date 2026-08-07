/* 顶部导航栏「登分」入口
   接入登分系统后：把 overrides/partials/header.html 里 .isc-login 的
   href 换成真实链接，并删除本文件中的 preventDefault 与提示逻辑即可跳转。 */
(function () {
  "use strict";

  var login = document.getElementById("isc-login");
  if (!login) return;

  login.addEventListener("click", function (e) {
    // TODO: 登分系统接入后移除，改为真实跳转
    e.preventDefault();

    var toast = document.querySelector(".isc-toast");
    if (toast) toast.remove();
    toast = document.createElement("div");
    toast.className = "isc-toast";
    toast.textContent = "登分功能尚未开放，敬请期待";
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("isc-toast--show");
    });
    setTimeout(function () {
      toast.classList.remove("isc-toast--show");
      setTimeout(function () { toast.remove(); }, 300);
    }, 2200);
  });
})();
