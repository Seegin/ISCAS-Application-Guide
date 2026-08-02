# 中科院软件所（ISCAS）考研报考指南 - 本地构建脚本
#
# 用法：
#   .\build-site.ps1            构建静态网站到 site/
#   .\build-site.ps1 -Serve     启动本地预览服务（http://127.0.0.1:8000）
#
# 原理：把仓库根目录的 markdown 内容同步到 docs_src/（MkDocs 要求内容在
# 配置文件子目录下，而仓库本身要保持原有结构），再交给 MkDocs 构建。
# docs_src/ 与 site/ 均为生成产物，已加入 .gitignore，不入库。

param(
    [switch]$Serve
)

$ErrorActionPreference = 'Stop'
$root   = $PSScriptRoot
$docs   = Join-Path $root 'docs_src'
$venvPy = Join-Path $root '.venv\Scripts\python.exe'

# ---- 1. 准备虚拟环境（首次自动安装） ----
if (-not (Test-Path $venvPy)) {
    Write-Host '首次运行：创建虚拟环境并安装 mkdocs-material ...'
    python -m venv (Join-Path $root '.venv')
    & $venvPy -m pip install --upgrade pip -q
    & $venvPy -m pip install -q mkdocs-material
    if ($LASTEXITCODE -ne 0) { throw 'mkdocs-material 安装失败，请检查网络后重试。' }
}

# ---- 2. 同步内容到构建源目录 ----
Write-Host '同步内容到 docs_src/ ...'
if (Test-Path $docs) { Remove-Item $docs -Recurse -Force }
New-Item -ItemType Directory -Path $docs | Out-Null

Copy-Item (Join-Path $root 'README.md') $docs
Copy-Item (Join-Path $root '初试准备') $docs -Recurse
Copy-Item (Join-Path $root '复试准备') $docs -Recurse
Copy-Item (Join-Path $root '上岸经验分享') $docs -Recurse
Copy-Item (Join-Path $root '经验分享投稿模板.md') $docs
Copy-Item (Join-Path $root 'CONTRIBUTORS.md') $docs

# ---- 2.5 网站层匿名化（源文件不动） ----
# 学校名 → 层次、删除联系方式（仅改 docs_src 副本）
& $venvPy (Join-Path $root 'anonymize.py') $docs

# ---- 3. 构建 ----
& $venvPy -m mkdocs build --config-file (Join-Path $root 'mkdocs.yml')
if ($LASTEXITCODE -ne 0) { throw '构建失败' }

# ---- 4. 预览（纯静态服务器，行为与 Cloudflare 部署一致；中文路径正常） ----
if ($Serve) {
    Write-Host ''
    Write-Host '启动预览服务：http://127.0.0.1:8000 （Ctrl+C 停止）'
    Write-Host '提示：修改内容后需重新运行本脚本（无热更新）'
    & $venvPy -m http.server 8000 --directory (Join-Path $root 'site') --bind 127.0.0.1
} else {
    Write-Host ''
    Write-Host "构建完成：$(Join-Path $root 'site\index.html')"
}

