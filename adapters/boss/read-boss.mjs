#!/usr/bin/env node
// BOSS直聘「半自动读取」adapter —— B 档(read-only, 用你已登录的有界面浏览器)
//
// 机制:挂到你真浏览器,在登录态(共享 cookie)的标签里搜词、只读 DOM。
//   用【原始 CDP 协议】(HTTP 建标签 + WebSocket 发 Runtime.evaluate)直驱,
//   不走 playwright 的 connectOverCDP —— 后者要做 browser-context 管理,跟新版 Chrome(148+)不兼容。
//   Node 22+ 自带全局 WebSocket,无需任何依赖。
// 关键边界:只读【搜索结果列表页】——列表卡片只有公开的"岗位名/薪资/公司/标签",
//   不进详情页、不点"立即沟通"、不碰 HR 个人信息/聊天。所以不触 反诈 rubric A6(爬个人信息)。
//
// 前提:先 ./launch-chrome.sh 起【有界面】Chrome 并【扫码登录 BOSS直聘】。
//   BOSS 频控比闲鱼凶,可能弹滑块/安全验证 → 你自己在窗口里手动过一下,再跑本脚本。
//
// 用法: node read-boss.mjs <关键词> [城市码,默认100010000=全国] [端口,默认9222] [页码,默认1]
//   例: node read-boss.mjs "AIGC" 100010000 9222 1
//
// 诚实说明:提取是启发式("找含单条薪资的卡片"),真实登录态选择器尚未校准;
//   首跑若条数不对,把输出的 diagnostics 发回(尤其 blocked/maybeNeedLogin/sampleCardText),几分钟可调准。

import http from 'node:http';

const KEYWORD = process.argv[2];
const CITY = process.argv[3] || '100010000'; // BOSS: 100010000 = 全国
const PORT = process.argv[4] || '9222';
const PAGE = process.argv[5] || '1';

if (!KEYWORD) {
  console.error('用法: node read-boss.mjs <关键词> [城市码] [端口] [页码]\n例:  node read-boss.mjs "AIGC" 100010000 9222 1');
  process.exit(1);
}

if (!/^[1-9]\d*$/.test(PAGE)) {
  console.error('页码必须是正整数。');
  process.exit(1);
}

function pageExtractor() {
  const out = { url: location.href, title: document.title, items: [], diagnostics: {} };
  const bodyText = (document.body.innerText || '');

  // 反爬/登录/验证拦截探测
  if (/请完成.*验证|安全验证|滑块验证|请输入验证码|验证后继续访问|拖动.*完成验证/.test(bodyText))
    out.diagnostics.blocked = '被安全验证拦截 → 在浏览器窗口里手动过验证后重跑';
  if (/登录后查看|立即登录|扫码登录|未登录/.test(bodyText) && bodyText.length < 1500)
    out.diagnostics.maybeNeedLogin = '疑似未登录/结果未加载(页面提示登录)';

  const txt = (n) => (n ? (n.textContent || '').trim().replace(/\s+/g, ' ') : '');

  // BOSS 搜索结果是结构化 DOM:li.job-card-box 一卡一岗。带兜底选择器以防改版。
  let cardEls = [...document.querySelectorAll('li.job-card-box')];
  if (!cardEls.length) cardEls = [...document.querySelectorAll('[class*="job-card-box"], [class*="job-card-wrap"]')];

  const seen = new Set();
  let obfCount = 0;
  for (const el of cardEls) {
    const nameA = el.querySelector('a.job-name, [class*="job-name"]');
    const title = txt(nameA) || txt(el.querySelector('[class*="job-title"] a, [class*="job-title"]'));
    if (!title) continue;
    // 薪资:BOSS 用自定义字体(kanzhun-mix)把数字渲染成私有区(PUA U+E000–U+F8FF)码点防爬。
    //   单位(K/元/天/-)是明文,数字抓不到 → 用 ▯ 占位,诚实标注被混淆,不假装拿到了数字。
    const salRaw = txt(el.querySelector('[class*="job-salary"], [class*="salary"]'));
    const salObfuscated = [...salRaw].some(c => c.codePointAt(0) >= 0xE000 && c.codePointAt(0) <= 0xF8FF);
    const salary = [...salRaw].map(c => (c.codePointAt(0) >= 0xE000 && c.codePointAt(0) <= 0xF8FF) ? "\u25AF" : c).join("");
    if (salObfuscated) obfCount++;
    // 标签:经验/学历/技能
    const tags = [...el.querySelectorAll('ul.tag-list li, [class*="tag-list"] li, [class*="tag"] li')]
      .map(t => txt(t)).filter(Boolean);
    // 公司:footer 里 gongsi 链接或 company-name
    const company = txt(el.querySelector('a[href*="gongsi"], [class*="company-name"], [class*="company"] a, [class*="company"]'));
    const jobLocation = txt(el.querySelector('[class*="job-area"], [class*="area"], [class*="location"], [class*="address"]'));
    const publishTime = txt(el.querySelector('[class*="job-time"], [class*="publish-time"], [class*="time"]'));
    const href = (nameA && nameA.getAttribute('href')) || '';
    const link = href ? (href.startsWith('http') ? href : location.origin + href) : '';

    const key = link || title + '|' + salary;
    if (seen.has(key)) continue;
    seen.add(key);
    out.items.push({ title, salary, company, location: jobLocation, publish_time: publishTime || null, tags: tags.slice(0, 8), link });
  }

  out.items = out.items.slice(0, 60);
  out.diagnostics.cardCount = cardEls.length;
  if (obfCount) out.diagnostics.salaryObfuscated = `${obfCount} 条薪资数字被 BOSS 字体混淆(▯ 占位),单位明文可见。准确数字需打开链接到详情页人工看。`;
  if (!out.items.length) {
    out.diagnostics.sampleRawText = bodyText.slice(0, 400);
    out.diagnostics.salaryNodeProbe = document.querySelectorAll('[class*="salary"]').length;
  }
  return out;
}

// ---- 极简 CDP 客户端(HTTP 取/建标签 + 单页 WS 发命令) ----
const sleep = ms => new Promise(r => setTimeout(r, ms));

function httpJson(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path, method, timeout: 5000 }, res => {
      let d = ''; res.on('data', c => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on('timeout', () => req.destroy(new Error(`连接 127.0.0.1:${PORT} 超时`)));
    req.on('error', reject);
    req.end();
  });
}

// 每次读取都新建一个独立 page 目标,避免多个关键词并发时抢同一个标签页。
async function getPageTarget() {
  return httpJson('/json/new', 'PUT'); // 新建空白标签,稍后用 Page.navigate 导航
}

async function closePageTarget(target) {
  if (!target?.id) return;
  await httpJson(`/json/close/${target.id}`).catch(() => {});
}

// 一条 WS 连接驱动一个页面:send(method,params) → Promise(result)
function openCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  const ready = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id; pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const evaluate = async (fnOrExpr) => {
    const expression = typeof fnOrExpr === 'function' ? `(${fnOrExpr.toString()})()` : fnOrExpr;
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'evaluate 抛异常');
    return r.result?.value;
  };
  return { ready, send, evaluate, close: () => ws.close() };
}

(async () => {
  let target;
  try {
    await httpJson('/json/version'); // 探活
    target = await getPageTarget();
  } catch (e) {
    console.error(`❌ 连不上 Chrome 调试端口 ${PORT}。
先确认:
1. 已运行 ./launch-chrome.sh ${PORT}, 且 Chrome 窗口还开着
2. 终端里看到 DevTools listening on ws://127.0.0.1:${PORT}/...
3. 当前环境允许访问本机 127.0.0.1:${PORT}; 若在 Codex/Claude 沙箱里失败, 需要用非沙箱权限重跑本命令
4. 可先运行 node diagnose-cdp.mjs ${PORT} 做端口诊断
原因: ${e.message || e.code || '无详细错误'}`);
    process.exit(1);
  }

  const cdp = openCdp(target.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send('Page.enable').catch(() => {});

  // 在你已登录的浏览器里(共享 cookie)导航到搜索结果页
  const url = `https://www.zhipin.com/web/geek/jobs?query=${encodeURIComponent(KEYWORD)}&city=${CITY}&page=${PAGE}`;
  await cdp.send('Page.navigate', { url });

  // zhipin 是 SPA:轮询等岗位卡片出现 + 薪资 span 渲染(懒加载),或登录墙,最多 ~18s
  for (let i = 0; i < 18; i++) {
    await sleep(1000);
    const state = await cdp.evaluate(() => {
      const cards = document.querySelectorAll('li.job-card-box, [class*="job-card-box"]');
      const salFilled = [...document.querySelectorAll('[class*="job-salary"], [class*="salary"]')]
        .filter(n => (n.textContent || '').trim()).length;
      const t = document.body ? document.body.innerText : '';
      return { cards: cards.length, salFilled, login: /登录后查看|扫码登录|立即登录/.test(t) };
    }).catch(() => ({}));
    // 卡片已出 + 至少几个薪资填好 → 可读;或撞登录墙 → 停
    if ((state.cards > 0 && state.salFilled >= Math.min(3, state.cards)) || state.login) break;
    if (i === 6) await cdp.evaluate(() => window.scrollBy(0, 1200)).catch(() => {}); // 中途滚一下催懒加载
  }
  await cdp.evaluate(() => window.scrollBy(0, 1600)).catch(() => {});
  await sleep(1500);

  const data = await cdp.evaluate(pageExtractor);
  console.log(JSON.stringify(data, null, 2));
  cdp.close();
  await closePageTarget(target);
})();
