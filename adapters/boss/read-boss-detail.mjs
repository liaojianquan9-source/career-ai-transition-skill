#!/usr/bin/env node
// BOSS直聘 JD 详情只读 adapter。
//
// 安全边界:
// - 只读取用户明确给出的 BOSS job_detail 链接。
// - 只提取岗位标题、公司、薪资、JD/要求文本、来源链接。
// - 不读取/保存 HR 信息，不点"立即沟通"，不批量抓取。

import http from 'node:http';

const PORT = process.argv[2] || '9222';
const LINKS = process.argv.slice(3);

if (!/^\d+$/.test(PORT)) {
  console.error('用法: node read-boss-detail.mjs <端口> <BOSS详情链接1> [链接2] [链接3]');
  process.exit(1);
}

if (!LINKS.length) {
  console.error('请传入用户明确选择的 BOSS job_detail 链接。');
  process.exit(1);
}

for (const link of LINKS) {
  if (!/^https:\/\/www\.zhipin\.com\/job_detail\//.test(link)) {
    console.error(`只允许读取 BOSS job_detail 链接: ${link}`);
    process.exit(1);
  }
}

if (LINKS.length > 8) {
  console.error('一次选择的 JD 较多。请分批读取，每批建议不超过 8 个，以保持低频和人工确认边界。');
  process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function httpJson(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path, method, timeout: 5000 }, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on('timeout', () => req.destroy(new Error(`连接 127.0.0.1:${PORT} 超时`)));
    req.on('error', reject);
    req.end();
  });
}

async function getPageTarget() {
  return httpJson('/json/new', 'PUT');
}

async function closePageTarget(target) {
  if (!target?.id) return;
  await httpJson(`/json/close/${target.id}`).catch(() => {});
}

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
  const ready = new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
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

function detailExtractor() {
  const textOf = (node) => node ? (node.textContent || '').trim().replace(/\s+/g, ' ') : '';
  const normalize = (s) => (s || '')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const cleanSalary = (raw) => [...(raw || '')].map(c => {
    const code = c.codePointAt(0);
    return code >= 0xE000 && code <= 0xF8FF ? '\u25AF' : c;
  }).join('');

  const bodyText = document.body?.innerText || '';
  const out = {
    url: location.href,
    title: document.title,
    job_title: '',
    company: '',
    location: '',
    publish_time: '',
    salary: '',
    tags: [],
    jd_text: '',
    diagnostics: {}
  };

  if (/请完成.*验证|安全验证|滑块验证|请输入验证码|验证后继续访问|拖动.*完成验证/.test(bodyText))
    out.diagnostics.blocked = '被安全验证拦截 → 在浏览器窗口里手动过验证后重跑';
  if (/登录后查看|立即登录|扫码登录|未登录/.test(bodyText) && bodyText.length < 1500)
    out.diagnostics.maybeNeedLogin = '疑似未登录/结果未加载(页面提示登录)';

  out.job_title = textOf(document.querySelector('.job-title, [class*="job-title"], h1'));
  out.salary = cleanSalary(textOf(document.querySelector('.salary, [class*="salary"]')));
  out.company = textOf(document.querySelector('[class*="company-name"], a[href*="/gongsi/"], .sider-company p'));
  if (!out.company || out.company === '公司') {
    const titleMatch = document.title.match(/招聘」_(.+?)招聘-BOSS直聘/);
    if (titleMatch) out.company = titleMatch[1];
  }
  out.location = textOf(document.querySelector('[class*="job-address"], [class*="location-address"], [class*="address"]'));
  out.publish_time = textOf(document.querySelector('[class*="job-time"], [class*="publish-time"], [class*="update-time"], time'));
  out.tags = [...document.querySelectorAll('.job-tags span, .job-tags li, [class*="job-tags"] span, [class*="job-tags"] li')]
    .map(textOf)
    .filter(Boolean)
    .slice(0, 12);

  const jdCandidates = [
    '.job-sec-text',
    '.job-detail-section',
    '.job-detail',
    '[class*="job-sec"]',
    '[class*="job-detail"]',
    '[class*="detail-content"]'
  ];

  let jd = '';
  for (const selector of jdCandidates) {
    const parts = [...document.querySelectorAll(selector)]
      .map(n => n.innerText || n.textContent || '')
      .map(normalize)
      .filter(s => s.length > 40 && !/立即沟通|BOSS|在线|客服热线/.test(s));
    if (parts.length) {
      jd = parts.join('\n\n');
      break;
    }
  }

  if (!jd) out.diagnostics.noTrustedJdContainer = '未找到可信的 JD 容器，已拒绝回退输出整页文本；请用户手动粘贴职位描述。';

  out.jd_text = normalize(jd).slice(0, 6000);
  if (!out.location) {
    const addressMatch = out.jd_text.match(/(?:地址|办公地点|工作地点|公司地址)[:：]\s*([^\n。；;]{4,80})/);
    if (addressMatch) out.location = addressMatch[1].trim();
  }
  out.diagnostics.jdTextLength = out.jd_text.length;
  return out;
}

async function readOne(link) {
  let target;
  let cdp;
  try {
    target = await getPageTarget();
    cdp = openCdp(target.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send('Page.enable').catch(() => {});
    await cdp.send('Page.navigate', { url: link });

    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      const state = await cdp.evaluate(() => {
        const text = document.body?.innerText || '';
        return {
          hasDetail: /职位描述|任职要求|岗位职责|工作内容|职位详情/.test(text),
          blocked: /安全验证|滑块验证|验证码/.test(text),
          login: /登录后查看|扫码登录|立即登录/.test(text)
        };
      }).catch(() => ({}));
      if (state.hasDetail || state.blocked || state.login) break;
    }

    await cdp.evaluate(() => window.scrollBy(0, 800)).catch(() => {});
    await sleep(800);
    return await cdp.evaluate(detailExtractor);
  } finally {
    cdp?.close();
    await closePageTarget(target);
  }
}

try {
  await httpJson('/json/version');
} catch (e) {
  console.error(`❌ 连不上 Chrome 调试端口 ${PORT}。先运行 ./launch-chrome.sh ${PORT} 并登录 BOSS。\n原因: ${e.message || e.code || '无详细错误'}`);
  process.exit(1);
}

const results = [];
for (const link of LINKS) {
  results.push(await readOne(link));
}

console.log(JSON.stringify({ items: results }, null, 2));
