# 技术栈

本文记录这个 whistle 分支的技术栈：运行时依赖、代理内核、Web UI、构建与测试链路，以及本分支相对上游的定制点。

配套的运行时架构图是一份独立 HTML（`docs/public/architecture.html`，构建后位于站点根路径 `/architecture.html`），也可以直接用浏览器打开源文件：<a href="/architecture.html" target="_blank" rel="noreferrer">打开架构图</a>。

## 概览

| 分层 | 主要技术 | 版本 | 说明 |
|---|---|---|---|
| 运行时 | Node.js | `>= 16`（CI 覆盖 14–26） | CommonJS，源码为 ES5 风格 |
| HTTP 栈 | `http` / `https` / `http2` / `tls` / `net` | Node 内置 | 自行处理 CONNECT、隧道与 TLS 握手 |
| 协议解析 | `hparser` / `hagent` / `ws-parser` / `sockx` | ^0.5.0 / ^0.9.3 / ^0.6.4 / ^0.2.3 | 报文头解析、上游请求、WebSocket 帧解析 |
| 证书 | `node-forge` | ^1.4.3 | 自签根 CA，按域名动态签发中间证书 |
| Web 服务 | Express | ^4.21.2 | 控制台服务端 + CGI 接口 |
| 前端框架 | React + ReactDOM | 15.6.2 | 类组件 + JSX，未使用 Hooks |
| 前端 UI 库 | Bootstrap / Bootstrap Icons / jQuery | ^5.3.8 / ^1.13.2 / ^4.0.0 | Bootstrap 5 + jQuery 兼容桥 |
| 虚拟列表 | `react-virtualized` | ~9.21.2 | Network 面板长列表 |
| 代码编辑 | CodeMirror | ^5.65.16 | Rules / Values 编辑器 |
| 打包 | Webpack + Babel | 1.11.0 / Babel 6 | 老式 `loaders` 配置，无 TS |
| 测试 | tape + should + istanbul | ^4.6.0 / ^13.2.3 / ^0.4.5 | `test/index.test.js` 统一入口 |
| 文档 | VitePress | ^1.6.3 | `docs/`，中英双语 locale |

包名已改为 `@zhictory/whistle`，命令行入口为 `w3`（同时保留 `whistle`、`w2`、`wproxy` 三个别名），默认端口 8899，数据目录 `.whistle`。

## 运行时依赖

全部为生产依赖，见 [`package.json`](https://github.com/zhictory/whistle/blob/feat/bootstrap5-ui/package.json)：

- **代理链路**：`pipestream`（流式转发）、`parseurl`、`mime`、`iconv-lite`（字符集转码）、`hparser`、`hagent`、`sockx`、`sni`（按 SNI 选择证书）。
- **证书与安全**：`node-forge` 生成根证书与域名证书；`sni` 做 TLS 回调分发。
- **上游代理与 PAC**：`node-pac`、`set-global-proxy`（系统代理设置）。
- **进程与服务**：`starting`（命令行与守护进程）、`pfork`（多进程/端口占用处理）、`express`、`body-parser`、`multer2`（文件上传）、`adm-zip`（导出/导入配置）。
- **数据与工具**：`lru-cache`、`fs-extra2`、`json5`、`xml2js`、`extend`、`colors`、`async-limiter`、`weinre2`（远程调试）。

## 代理内核（`lib/`）

`lib/index.js` 是入口，把 `net` / `tls` / `http` / `https` / `socks` 与 Express 中间件装配成一条处理链：

```js
// lib/index.js 中的中间件装配顺序（简化）
['./init', '../biz'].concat(inspectors, config.middlewares, handlers)
```

按目录划分：

| 目录 | 职责 |
|---|---|
| `lib/https/` | 证书签发（`ca.js`，node-forge）、TLS 握手、HTTP/2（`h2.js` 内 `require('http2')`） |
| `lib/handlers/` | 请求/响应改写、重定向、限速、注入等规则动作 |
| `lib/rules/` | 规则解析与匹配，`values` 变量系统 |
| `lib/inspectors/` | 抓包会话采集，按协议区分 HTTP / WebSocket / 隧道 |
| `lib/plugins/` | 插件沙箱与生命周期 |
| `lib/service/` | 配置、存储、进程间通信等后台服务 |
| `lib/util/` | 工具函数与通用中间件 |

关键文件：`lib/tunnel.js`（CONNECT 隧道）、`lib/socket-mgr.js`（会话内存管理与前端数据分发）、`lib/upgrade.js`（WebSocket 升级）。

## 业务中间件（`biz/`）

`biz/` 是 Express 侧的业务层，既承载控制台服务端，也内置了几个调试工具：

- `biz/webui/`：控制台服务端（CGI 接口、插件鉴权、静态资源）。
- `biz/weinre/`、`biz/console/`、`biz/composer/`：内置的 Weinre、Console、Composer 工具。
- `biz/index.js`：把上述能力挂进主中间件链。

## Web UI 前端

源码位于 `biz/webui/htdocs/src/`，构建产物输出到 `biz/webui/htdocs/js/`。

- **框架**：React 15 类组件 + JSX，没有 Hooks，也没有 TypeScript 源码（仓库仅有 `index.d.ts` 类型声明）。
- **Bootstrap 5 迁移桥**：`src/js/bootstrap-v5.js` 把 Bootstrap 4 时代的 `$(el).modal('show')` 调用接到 Bootstrap 5 的 `Modal.getOrCreateInstance`，让老代码在不重写的前提下跑在新版 Bootstrap 上。
- **实时数据不是 WebSocket**：前端通过 XHR 轮询 `/cgi-bin/socket/data` 拉取会话增量，配合 `/cgi-bin/socket/abort`、`/cgi-bin/socket/change-status` 控制抓包状态，逻辑集中在 `src/js/data-center.js`。
- **样式**：CSS 变量 + 四套皮肤（`src/css/skins/`，默认 looseleaf，另有 clean / playful / retro）。

### 设计语言 Looseleaf

`DESIGN.md` 定义了默认皮肤的视觉规范，要点：

| 项 | 浅色 | 深色 |
|---|---|---|
| 纸张背景 | `#fbf6e9` | `#2f2b24` |
| 面板 | `#f8f5ee` | `#33302a` |
| 主文字 | `#2a2420` | `#ece6d9` |
| 标记橙 | `#df6b3c` | `#e2834f` |
| 链接 | `#2c4f9e` | — |
| 高亮 | `#f7ecc4` | — |

字体为正文字体 Avenir Next / Segoe UI / PingFang SC，技术文本用 IBM Plex Mono；圆角取 3 / 4 / 6px 三档。规范明确不使用纯白 `#fff`，面板统一用偏暖的纸白。

## 插件与扩展

- 内置插件在 `builtin_plugins/`，其中 `whistle.inspect` 带一份约 4.68MB 的 `_values.txt`，用于把 eruda 注入移动端页面。
- 第三方插件按 NPM 模块安装，通过 `%` 变量与 `plugin-vars` 规则接入；开发文档见 `docs/docs/extensions/`。
- 插件运行在独立进程（`pfork`），由 `lib/plugins/` 管理生命周期与通信。

## 构建、测试与文档

| 命令 | 作用 |
|---|---|
| `npm run dev` | Webpack watch 模式构建前端 |
| `npm run build:web` | 生产构建 `biz/webui/htdocs/src/webpack.config.js` |
| `npm start` | `node bin/whistle.js run`，默认监听 8899 |
| `npm test` | 先 `eslint --fix`，再跑 `test/index.test.js` |
| `npm run cov` | istanbul + tape 覆盖率 |
| `npm run docs` / `docs:dev` | 构建 / 本地预览 VitePress 文档 |

- 打包配置是 Webpack 1 时代的写法：`loaders` 数组、`style-loader!css-loader`、`url-loader` 处理字体和图片，插件为 `DefinePlugin` + `UglifyJsPlugin`。
- Babel 6 预设为 `babel-preset-env` + `babel-preset-react`，另加 class properties 与 object rest spread 两个插件（`.babelrc`）。
- ESLint 2.x：2 空格缩进、单引号、必需分号，环境为 browser / node / es6，启用 `eslint-plugin-react`。
- CI（`.travis.yml`）在 Node 14 / 15 / 16 / 17 / 18 / 20 / 22 / 24 / 26 上跑 `npm run cov`。

## 目录结构

```
bin/            CLI 入口（w3 / whistle / w2 / wproxy）
lib/            代理内核：handlers / https / inspectors / plugins / rules / service / util
biz/            Express 业务层：webui 服务端 + Weinre / Console / Composer
  webui/htdocs/ 前端源码（src/）与构建产物（js/）
builtin_plugins/ 内置插件（whistle.inspect）
test/           代理测试、单元测试、插件测试
docs/           VitePress 文档站（中英双语）
```

## 已知注意点

- 前端栈是 2016 年前后的组合（React 15 + Webpack 1 + Babel 6），升级 React 会连带影响 `react-virtualized` 与 CodeMirror 的集成，属于大改。
- 实时数据依赖 XHR 轮询而非长连接，抓包量大时轮询频率与单次返回体积是主要性能变量。
- `package-lock.json` 顶层的 `name` 仍是 `whistle`，与 `package.json` 的 `@zhictory/whistle` 不一致，重新生成锁文件即可消除。
- 运行时要求 Node `>= 16`，但 `lib/` 使用 CommonJS 与回调风格，没有引入 ESM 或顶层 await。
