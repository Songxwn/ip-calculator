# IP 子网计算器 · IPv4 / IPv6 Subnet Calculator

纯静态、零依赖的 IPv4 + IPv6 子网计算器。所有计算都在浏览器本地完成。

## 功能
- 自动识别 IPv4 / IPv6，支持 `a.b.c.d/24`、`a.b.c.d 255.255.255.0`、反掩码 `0.0.0.255`、IPv6 压缩写法、内嵌 IPv4（`::ffff:1.2.3.4`）
- 网络 / 广播 / 首末可用地址、主机数、通配符掩码、类别、十六进制、十进制、PTR 反解、地址类型（私有 / CGNAT / ULA / 链路本地等）
- 二进制位视图（网络位 / 主机位着色）
- 子网划分、IP 范围转 CIDR、CIDR 速查表
- 中文 / English，自动 / 浅色 / 深色主题
- 一键复制、分享链接（URL hash）、最近记录
- 快捷键：`/` 聚焦输入，`↑` `↓` 调整前缀（`Shift` 每次 ±8），`Esc` 清空

## 部署到 Cloudflare Pages

所有站点文件都在 `public/` 目录。

### 方式 A：网页控制台（无需本地工具）
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → **Upload assets**
2. 项目名填 `ip-calculator`，把 `public` 文件夹拖进去 → Deploy

### 方式 B：Git 集成
把这个仓库推到 GitHub / GitLab，在 Pages 中连接该仓库：
- Framework preset: `None`
- Build command: *(留空)*
- Build output directory: `public`

### 方式 C：Wrangler CLI
```bash
npx wrangler login
npx wrangler pages deploy public --project-name ip-calculator
```

## 本地预览
```bash
python -m http.server 8080 --directory public
```
