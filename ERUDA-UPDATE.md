# 自定义 eruda 注入 whistle.inspect（方案 2）

把 `F:\eruda` 的构建产物写进 whistle.inspect 插件的 `_values.txt`（键 `whistle.inspect/ev.js`），
保留插件原有的 HEADER/FOOTER 桥接，规则里用 `whistle.inspect://eruda` 即可注入你的构建。

## 日常用法

1. 改 `F:\eruda` 源码并重新构建，产物覆盖 `F:\eruda\dist\eruda.js`；
2. 双击 `F:\whistle\update-eruda.cmd`（或在终端执行 `node F:\whistle\update-eruda.js`）；
3. 脚本打印 `written: OK` 与 `hot-reload: OK` 即生效，刷新目标页面即可看到新版本。

`update-eruda.cmd` 只是包装：切到 UTF-8 代码页、双击（无参数）时暂停窗口、把参数原样转给 `update-eruda.js`。
在终端里带参数调用时不会暂停；习惯命令行的话直接 `node F:\whistle\update-eruda.js <参数>` 即可。

## 脚本做了什么

| 步骤 | 说明 |
| --- | --- |
| 定位文件 | 自动找 `%USERPROFILE%\.WhistleAppData\custom_plugins\*\node_modules\whistle.inspect\_values.txt`，并默认在 `F:\eruda\dist\eruda.js` 找构建 |
| 构建校验 | 检查是否 UMD（拒绝 ESM / `import.meta`）、体积是否异常、是否含 UMD 入口，读取 `eruda vX.Y.Z` 版本号 |
| 拼接包装 | HEADER（局部 `module`/`exports`）+ 去掉 `sourceMappingURL` 的 UMD + FOOTER（`window.whistleInspectEruda = eruda; eruda.init();`） |
| 语法校验 | `new Function(ev)` 整段编译；检查桥接变量与非法 `{{whistlePlugin…}}` 占位符 |
| 备份与写入 | 先复制 `_values.txt.bak.<时间戳>`，再按“临时文件 + rename”原子替换；只改 `ev.js` 一个键，`v.js`/`mv.js` 逐字节比对确认未动 |
| 触发热重载 | `touch` 同目录 `package.json`，然后轮询 `http://127.0.0.1:8899/cgi-bin/plugins/get-plugins` 直到插件 mtime 更新（最长 15s） |

内容与当前一致时脚本不写文件，只提示“已是最新内容”；要强制重写并触发热重载，加 `--force`。

## 参数

| 参数 | 作用 |
| --- | --- |
| `--dist <eruda.js>` | 指定构建产物（默认 `F:\eruda\dist\eruda.js`，也认环境变量 `ERUDA_DIST`） |
| `--values <_values.txt>` | 指定插件值文件（默认自动定位，也认 `WHISTLE_INSPECT_VALUES`） |
| `--dry-run` | 只校验并打印大小/哈希/检查项，不写任何文件 |
| `--force` | 内容未变也重写并触发热重载 |
| `--restore latest` | 回滚到最近一次备份 |
| `--restore <备份路径>` | 回滚到指定备份 |
| `--port <端口>` | whistle 端口，默认 8899（或环境变量 `WHISTLE_PORT`） |
| `--no-verify` | 不等热重载确认，写完即退出 |

退出码：`0` 成功；`1` 运行错误；`2` 校验失败（此时不会写入任何文件）。

## 回滚

```bat
node F:\whistle\update-eruda.js --restore latest
```

或手动把 `_values.txt.bak.<时间戳>` 覆盖回 `_values.txt` 后 `touch package.json`。
`_values.txt.bak`（无时间戳）是插件初始版本，脚本不会覆盖它也不会清理它。
脚本最多保留 5 份时间戳备份。

## 排查

| 现象 | 处理 |
| --- | --- |
| 报“dist 看起来是 ESM 构建” | 该方案要求 UMD（`module.exports`）。用带 UMD 的构建，或改用规则注入路径 `jsPrepend://F:/eruda/dist/eruda.js` |
| 报“找不到 whistle.inspect 的 _values.txt” | 用 `--values` 指定；或先让 whistle 加载一次该插件 |
| `hot-reload: 未确认` | whistle 未运行或端口不对：用 `--port` 指定，或启动/重启 whistle（插件会在启动时读取新值） |
| 页面没变化 | 确认规则命中（`whistle.inspect://eruda`），并强制刷新/绕过缓存；插件面板与脚本同时写 `_values.txt` 会互相覆盖，改完插件面板设置后重跑一次脚本 |
