#!/usr/bin/env bash
# 中科院软件所（ISCAS）考研报考指南 - Linux 构建脚本
# 供 Cloudflare Pages / CI 等 Linux 环境使用（本地 Windows 请用 build-site.ps1）
#
# 用法：
#   bash build-site.sh          # 构建静态网站到 site/

set -euo pipefail
cd "$(dirname "$0")"

# ---- 智能选择 Python 解释器（本地 venv 优先，CI 用系统 python） ----
if [ -x ".venv/Scripts/python.exe" ]; then
  PY=".venv/Scripts/python.exe"          # Windows
elif [ -x ".venv/bin/python" ]; then
  PY=".venv/bin/python"                   # Linux venv
else
  PY="python"                             # Cloudflare Pages / CI
fi

# ---- 首次运行安装依赖（已装则跳过） ----
if ! "$PY" -c "import mkdocs_material" 2>/dev/null; then
  echo "首次运行：安装 mkdocs-material ..."
  "$PY" -m pip install -q --upgrade pip
  "$PY" -m pip install -q mkdocs-material
fi

# ---- 同步内容到构建源目录（仓库 markdown 仍是唯一内容源） ----
echo "同步内容到 docs_src/ ..."
rm -rf docs_src
mkdir -p docs_src
cp README.md docs_src/
cp -r 初试准备 复试准备 上岸经验分享 docs_src/
cp 经验分享投稿模板.md CONTRIBUTORS.md docs_src/

# ---- 网站层匿名化（学校名 → 层次，仅改 docs_src 副本，源文件不动） ----
"$PY" anonymize.py docs_src

# ---- 构建 ----
"$PY" -m mkdocs build
echo "构建完成：$(pwd)/site/index.html"
