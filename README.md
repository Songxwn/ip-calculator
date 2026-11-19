# IP 工具箱 · IP Toolbox

纯静态、零依赖、零后端的 IP 工具箱，功能参考 [ip.skk.moe](https://ip.skk.moe/)，可直接部署到 Cloudflare Pages。
网络检测由浏览器直接请求第三方公开接口（CORS / JSONP），子网计算完全在本地完成。

## 页面（导航顺序）
| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 本机 IP | `#/` | IPv4 / IPv6 地址、归属地、ASN；国内（网易、太平洋、测速网）与国际（Cloudflare、IPinfo、ipapi.is）多源出口对比；隐藏 IP / 国内 / 国际开关；国内外网站连通性延迟 |
| 分流检测 | `#/split` | 通过各站点的 `/cdn-cgi/trace` 等接口获取访问 ChatGPT、Claude、X、GitLab 等网站时的实际出口 IP，自动判断是否分流 |
| CDN 节点 | `#/cdn` | Cloudflare / jsDelivr（Fastly、Cloudflare、Gcore）/ unpkg 命中的边缘节点（IATA 代码 + 城市）与延迟 |
| DNS 出口 | `#/dns` | ip-api EDNS、ipleak.net、网易 NSTool 三路检测递归 DNS 出口，提示 DNS 泄露 |
| WebRTC | `#/webrtc` | 多个 STUN 服务器的 UDP 出口与映射端口，对比网页出口提示 WebRTC 泄露 |
| IP 查询 | `#/query?ip=` | 任意 IP / 域名（DoH 解析）在 11 个数据库中的归属对比 + RDAP 注册信息 |
| 住宅 IP | `#/risk?ip=` | 跨境电商 / 社媒运营自查 IP 可信度：IPinfo、ipregistry、ipquery.io、ipapi.is 多库判定 IP 类型（住宅 / 移动 / 商业 / 机房）与 VPN、代理、Tor 等标记；8 个 DNSBL 黑名单；浏览器时区 / 语言与 IP 一致性；综合 0–100 可信度评分 |
| 测速 | `#/speed` | 手动选择节点测速（延迟 / 抖动 / 下载 / 上传）。国内：山东大学、中科大、华科、西交、哈工大、上科大、上交、齐鲁工大、中科院软件所镜像站；国外：Cloudflare 与 LibreSpeed 公共服务器（东京、洛杉矶、纽约、伦敦、法兰克福等） |
| IP 计算器 | `#/calc?q=` | 原子网计算器（位于导航最右侧） |

## 计算器功能
- 自动识别 IPv4 / IPv6，支持 `a.b.c.d/24`、`a.b.c.d 255.255.255.0`、反掩码 `0.0.0.255`、IPv6 压缩写法、内嵌 IPv4（`::ffff:1.2.3.4`）
- 网络 / 广播 / 首末可用地址、主机数、通配符掩码、类别、十六进制、十进制、PTR 反解、地址类型（私有 / CGNAT / ULA / 链路本地等）
- 二进制位视图（网络位 / 主机位着色）
- 子网划分、IP 范围转 CIDR、CIDR 速查表
- 中文 / English，自动 / 浅色 / 深色主题
- 一键复制、分享链接（URL hash）、最近记录
- 快捷键：`/` 聚焦输入，`↑` `↓` 调整前缀（`Shift` 每次 ±8），`Esc` 清空

## 代码结构
```
public/
  index.html      页面骨架与导航
  style.css       主题（浅色 / 深色）与组件样式
  js/core.js      i18n、主题、路由、BigInt IP 运算
  js/net.js       fetch / JSONP 封装、各数据源字段归一化、IATA 节点名
  js/home.js split.js cdn.js dns.js webrtc.js query.js risk.js speed.js calc.js   各页面
  _headers        安全头与 CSP
```

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

### 方式 C：Workers（Git 集成，静态资源）
在 Workers & Pages → Create → **Workers** → Import a repository 中连接仓库：
- Build command: *(留空)*
- Deploy command: `npx wrangler deploy`

`wrangler.toml` 已配置 `[assets] directory = "./public"`，会以纯静态资源 Worker 部署（`_headers` 同样生效）。

### 方式 D：Wrangler CLI
```bash
npx wrangler login
npx wrangler deploy                                        # Workers 静态资源
npx wrangler pages deploy public --project-name ip-calculator   # 或 Pages
```

## 本地预览
```bash
python -m http.server 8080 --directory public
```
