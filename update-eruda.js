#!/usr/bin/env node
/*
 * update-eruda.js — 把自定义 eruda 构建注入 whistle.inspect 插件（方案 2）
 *
 * 用法：
 *   node update-eruda.js                      # 默认取 F:\eruda\dist\eruda.js 并自动定位插件
 *   node update-eruda.js --dry-run            # 只校验、不写入
 *   node update-eruda.js --dist <eruda.js>    # 指定构建产物
 *   node update-eruda.js --values <_values.txt>  # 指定插件值文件（一般不用）
 *   node update-eruda.js --force              # 内容未变时也重写并触发热重载
 *   node update-eruda.js --restore latest     # 回滚到最近一次备份
 *   node update-eruda.js --restore <备份文件>  # 回滚到指定备份
 *
 * 逻辑：读取 dist 里的 eruda UMD → 去掉 sourceMappingURL → 套上插件原有的
 * HEADER/FOOTER 桥接（module.exports → window.whistleInspectEruda → eruda.init()）
 * → 语法校验 → 备份 _values.txt → 原子写入 → touch package.json 触发热重载
 * → 轮询 whistle API 确认插件 mtime 已更新。
 *
 * 只改 whistle.inspect/ev.js 一个键，v.js / mv.js 逐字节不动。
 * 退出码：0 成功 / 1 运行错误 / 2 校验失败。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const crypto = require('crypto');

const VALUE_KEY = 'whistle.inspect/ev.js';
const BAD_TOKEN_RE = /\{\{(?:whistlePluginName|whistlePluginPackage\.[^}\s]+)\}\}/;
const KEEP_BACKUPS = 5;
const DEFAULT_DIST = 'F:\\eruda\\dist\\eruda.js';

const HEADER = `;(function() {
  if (typeof window === 'undefined' || window['___whistle.inspect-is-inited']) {
    return;
  }
  window['___whistle.inspect-is-inited'] = true;
  var exports = {};
  var module = { exports: exports };
`;
const FOOTER = `
  var eruda = module.exports;
  window.whistleInspectEruda = eruda;
  eruda.init();
})();
`;

/* ---------------------------------------------------------------- utils */

const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const bytes = (s) => Buffer.byteLength(s, 'utf8');

function log(msg) { console.log(msg); }
function warn(msg) { console.warn('WARN  ' + msg); }
function fail(msg, code) { console.error('ERROR ' + msg); process.exit(code || 1); }

function stamp() {
  const d = new Date();
  const p = (n, w) => String(n).padStart(w || 2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    if (eq > 0) { opts[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const name = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) { opts[name] = next; i += 1; } else { opts[name] = true; }
  }
  return opts;
}

function findValuesFile(explicit) {
  const home = os.homedir();
  const candidates = [];
  if (explicit) candidates.push(explicit);
  if (process.env.WHISTLE_INSPECT_VALUES) candidates.push(process.env.WHISTLE_INSPECT_VALUES);
  candidates.push(path.join(home, '.WhistleAppData', 'custom_plugins', 'whistle.inspect',
    'node_modules', 'whistle.inspect', '_values.txt'));

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return path.resolve(c);
  }

  // 兜底：扫一遍 custom_plugins 下所有 whistle.inspect 安装位置
  const root = path.join(home, '.WhistleAppData', 'custom_plugins');
  if (fs.existsSync(root)) {
    for (const name of fs.readdirSync(root)) {
      const p = path.join(root, name, 'node_modules', 'whistle.inspect', '_values.txt');
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function findDistFile(explicit) {
  const candidates = [];
  if (explicit) candidates.push(explicit);
  if (process.env.ERUDA_DIST) candidates.push(process.env.ERUDA_DIST);
  candidates.push(DEFAULT_DIST, path.resolve('eruda/dist/eruda.js'), path.resolve('dist/eruda.js'));
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return path.resolve(c);
  }
  return null;
}

/* -------------------------------------------------------- dist handling */

function inspectDist(dist, distPath) {
  const problems = [];
  const warnings = [];

  if (/^\s*(import|export)\s/m.test(dist) && !/module\.exports/.test(dist)) {
    problems.push('dist 看起来是 ESM 构建（有 import/export），本方案需要 UMD 构建');
  }
  if (/import\.meta/.test(dist)) {
    problems.push('dist 含 import.meta，浏览器直接 <script> 加载会语法报错');
  }
  if (!/module\.exports|typeof exports/.test(dist)) {
    warnings.push('dist 里没找到 module.exports / exports，可能不是标准 UMD');
  }
  if (bytes(dist) < 50000) {
    problems.push(`dist 只有 ${bytes(dist)} 字节，疑似不完整（eruda 构建通常 300KB+）`);
  }

  let start = dist.indexOf('/*! eruda v');
  if (start < 0) start = dist.search(/!function\(/);
  if (start < 0) start = dist.indexOf('(function(');
  if (start < 0) problems.push('dist 里没有找到 UMD 入口（/*! eruda */ 或 !function(）');

  const version = (dist.match(/eruda\s+v?([0-9][\w.\-+]*)/i) || [])[1] || 'unknown';
  const built = fs.statSync(distPath).mtime;

  // 跳过字符串字面量里的 "eruda.init()"（eruda 内部提示语），只看真正的调用语句
  const selfInit = /(^|[^"'\w.$\\])eruda\.init\s*\(\s*\)\s*;?/.test(dist);
  if (selfInit) warnings.push('dist 自身调用了 eruda.init()，注入后可能初始化两次');

  return { problems, warnings, version, start, built };
}

function extractCore(dist, start) {
  const sm = dist.lastIndexOf('//# sourceMappingURL=');
  const end = sm > start ? sm : dist.length;
  return dist.slice(start, end).replace(/\s+$/, '');
}

/* ------------------------------------------------------------- whistle */

function httpJson(port, pathname, timeoutMs) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: pathname, timeout: timeoutMs || 3000 }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(null); }
      });
    });
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

async function waitReload(port, touchedAt, deadlineMs) {
  const deadline = Date.now() + deadlineMs;
  let last = null;
  while (Date.now() < deadline) {
    /* eslint-disable no-await-in-loop */
    last = await httpJson(port, '/cgi-bin/plugins/get-plugins');
    const mtime = last && last.plugins && last.plugins['inspect:'] && last.plugins['inspect:'].mtime;
    if (mtime && mtime >= touchedAt - 1000) return { ok: true, mtime };
    await new Promise((r) => setTimeout(r, 1200));
  }
  return { ok: false, last };
}

/* ---------------------------------------------------------------- main */

function readValues(valuesFile) {
  const raw = fs.readFileSync(valuesFile, 'utf8');
  let obj;
  try { obj = JSON.parse(raw); } catch (e) { fail(`_values.txt 不是合法 JSON：${e.message}`, 2); }
  if (typeof obj[VALUE_KEY] !== 'string') fail(`_values.txt 里没有 ${VALUE_KEY}`, 2);
  return obj;
}

function writeValues(valuesFile, obj) {
  const tmp = `${valuesFile}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(obj), 'utf8');
  fs.renameSync(tmp, valuesFile);
}

function rotateBackups(valuesFile, keep) {
  const dir = path.dirname(valuesFile);
  const base = path.basename(valuesFile) + '.bak.';
  const list = fs.readdirSync(dir)
    .filter((n) => n.startsWith(base) && /^\.bak\.\d{8}T\d{6}$/.test(n.slice(path.basename(valuesFile).length)))
    .sort()
    .reverse();
  for (const old of list.slice(keep)) {
    try { fs.unlinkSync(path.join(dir, old)); } catch (e) { /* ignore */ }
  }
  return list.length;
}

function touchPackageJson(valuesFile) {
  const pkg = path.join(path.dirname(valuesFile), 'package.json');
  if (!fs.existsSync(pkg)) { warn('未找到 package.json，跳过触发热重载'); return 0; }
  const now = new Date();
  fs.utimesSync(pkg, now, now);
  return now.getTime();
}

async function doRestore(opts, valuesFile) {
  const target = opts.restore;
  let file = target;
  if (!file || file === true || file === 'latest') {
    const dir = path.dirname(valuesFile);
    const base = path.basename(valuesFile) + '.bak.';
    const list = fs.readdirSync(dir).filter((n) => n.startsWith(base)).sort();
    if (!list.length) fail('没有可用的备份（_values.txt.bak.*）', 2);
    file = path.join(dir, list[list.length - 1]);
  }
  if (!fs.existsSync(file)) fail(`备份不存在：${file}`, 2);

  const restored = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (typeof restored[VALUE_KEY] !== 'string') fail(`${file} 里没有 ${VALUE_KEY}`, 2);
  const current = readValues(valuesFile);

  if (current[VALUE_KEY] === restored[VALUE_KEY]) {
    log('当前 ev.js 与该备份一致，无需回滚。');
    return 0;
  }
  log(`restore from : ${file}`);
  log(`ev size      : ${bytes(current[VALUE_KEY])} -> ${bytes(restored[VALUE_KEY])}`);
  if (opts['dry-run']) { log('--dry-run: no files written.'); return 0; }

  const bak = `${valuesFile}.bak.${stamp()}`;
  fs.copyFileSync(valuesFile, bak);
  writeValues(valuesFile, restored);
  log(`backup       : ${bak}`);
  const touchedAt = touchPackageJson(valuesFile);
  const port = Number(opts.port || process.env.WHISTLE_PORT || 8899);
  if (touchedAt && !opts['no-verify']) {
    const r = await waitReload(port, touchedAt, 15000);
    log(r.ok ? `hot-reload   : OK (plugin mtime ${r.mtime})` : `hot-reload   : 未确认（whistle 可能未运行，端口 ${port}）`);
  }
  log('restored     : OK');
  return 0;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    log('用法: node update-eruda.js [--dist <eruda.js>] [--values <_values.txt>] [--dry-run] [--force] [--restore latest|<bak>] [--port 8899] [--no-verify]');
    return 0;
  }

  if (opts.values && !fs.existsSync(opts.values)) fail(`指定的 _values.txt 不存在：${opts.values}`, 2);
  const valuesFile = findValuesFile(opts.values);
  if (!valuesFile) fail('找不到 whistle.inspect 的 _values.txt，请用 --values 指定', 2);
  log(`values file  : ${valuesFile}`);

  if (opts.restore !== undefined) return doRestore(opts, valuesFile);

  if (opts.dist && !fs.existsSync(opts.dist)) fail(`指定的构建不存在：${opts.dist}`, 2);
  const distPath = findDistFile(opts.dist);
  if (!distPath) fail(`找不到 eruda 构建，请用 --dist 指定（默认尝试 ${DEFAULT_DIST}）`, 2);
  const dist = fs.readFileSync(distPath, 'utf8');
  const info = inspectDist(dist, distPath);
  if (info.problems.length) {
    for (const p of info.problems) console.error('  - ' + p);
    fail('dist 校验未通过，未写入任何文件', 2);
  }
  for (const w of info.warnings) warn(w);

  const ev = HEADER + extractCore(dist, info.start) + FOOTER;
  const old = readValues(valuesFile)[VALUE_KEY];

  const checks = {
    'eruda version banner': info.version,
    'syntax (new Function)': (() => { try { new Function(ev); return 'ok'; } catch (e) { return e.message; } })(),
    'module bridge present': ev.includes('window.whistleInspectEruda'),
    'no whistlePlugin tokens': !BAD_TOKEN_RE.test(ev),
    'changed vs current': ev !== old ? 'yes' : 'no (identical)',
  };
  const bad = checks['syntax (new Function)'] !== 'ok' || !checks['module bridge present'] || !checks['no whistlePlugin tokens'];

  log(`dist file    : ${distPath} (${bytes(dist)} bytes, built ${info.built.toLocaleString()})`);
  log(`eruda version: ${info.version}`);
  log(`ev size      : ${bytes(old)} -> ${bytes(ev)} bytes`);
  log(`ev sha256    : ${sha256(ev)}`);
  for (const [k, v] of Object.entries(checks)) log(`  ${k}: ${v}`);

  if (bad) fail('校验未通过，未写入任何文件', 2);

  if (ev === old && !opts.force) {
    log('');
    log('已是最新内容，未做任何修改。若需强制重写并触发热重载，加 --force。');
    return 0;
  }
  if (opts['dry-run']) { log(''); log('--dry-run: no files written.'); return 0; }

  const bak = `${valuesFile}.bak.${stamp()}`;
  fs.copyFileSync(valuesFile, bak);
  const values = readValues(valuesFile);
  const keep = Object.fromEntries(Object.entries(values).filter(([k]) => k !== VALUE_KEY));
  values[VALUE_KEY] = ev;
  writeValues(valuesFile, values);

  const back = readValues(valuesFile);
  for (const [k, v] of Object.entries(keep)) {
    if (back[k] !== v) fail(`键 ${k} 被意外修改，请用备份 ${bak} 回滚`, 1);
  }
  if (back[VALUE_KEY] !== ev) fail(`写回校验失败，请用备份 ${bak} 回滚`, 1);

  rotateBackups(valuesFile, KEEP_BACKUPS);
  log('');
  log(`written      : OK`);
  log(`backup       : ${bak}`);

  const touchedAt = touchPackageJson(valuesFile);
  const port = Number(opts.port || process.env.WHISTLE_PORT || 8899);
  if (touchedAt && !opts['no-verify']) {
    log(`hot-reload   : 等待 whistle 重新加载插件（端口 ${port}）...`);
    const r = await waitReload(port, touchedAt, 15000);
    if (r.ok) log(`hot-reload   : OK (plugin mtime ${r.mtime})`);
    else warn('未确认热重载：whistle 可能未运行。启动 whistle 后会自动读取新值；或执行 w2 restart。');
  }
  log('');
  log('完成。规则里使用 whistle.inspect://eruda 即注入该构建。');
  return 0;
}

main().then((code) => process.exit(code), (e) => {
  console.error('ERROR ' + (e && e.message ? e.message : e));
  process.exit(1);
});
