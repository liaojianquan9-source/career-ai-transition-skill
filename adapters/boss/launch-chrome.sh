#!/usr/bin/env bash
# 用「带远程调试端口 + 独立 profile」的方式启动 Chrome。
# 第一次会让你登录 BOSS直聘(扫码),登录态存在独立 profile 里,以后不用重登。
# 这个 Chrome 是你自己在操作:你来搜索、你来过滑块/安全验证 —— adapter 只读当前页。
set -euo pipefail
PORT="${1:-9222}"
DEFAULT_PROFILE="$HOME/.skill-chrome-profile"
PROFILE="${BOSS_CHROME_PROFILE:-$DEFAULT_PROFILE}"
LOG="/tmp/career-ai-transition-boss-chrome.log"

if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1024 || PORT > 65535 )); then
  echo "端口必须是 1024-65535 之间的整数。" >&2
  exit 1
fi

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "当前 BOSS Chrome 启动脚本仅在 macOS 上验证。" >&2
  exit 1
fi

mkdir -p "$PROFILE"
chmod 700 "$PROFILE"
echo "⚠️  安全提示：这是仅供 BOSS 直聘使用的独立 Chrome Profile。"
echo "→ 不要在该窗口登录邮箱、网银、云盘或其他敏感网站。"
echo "→ CDP 端口拥有控制该 Chrome 的能力；任务完成后立即关闭该 Chrome。"
echo "启动 Chrome(调试端口 $PORT, profile=$PROFILE)"
echo "→ 在打开的窗口里【扫码登录 BOSS直聘】(必须登录,否则看不到结果),保持窗口开着"
echo "→ 若弹滑块/安全验证,自己手动过一下(human-in-the-loop)"
echo "→ 若读取失败,先运行: node diagnose-cdp.mjs $PORT"
echo "→ 然后回来运行: node read-boss.mjs \"AIGC\" 100010000 $PORT"
if command -v open >/dev/null 2>&1; then
  : > "$LOG"
  open -na "Google Chrome" --args \
    --remote-debugging-address="127.0.0.1" \
    --remote-debugging-port="$PORT" \
    --user-data-dir="$PROFILE" \
    --no-first-run \
    --no-default-browser-check \
    "https://www.zhipin.com" >>"$LOG" 2>&1
  echo "Chrome 已通过 macOS open 启动。日志: $LOG"
else
  echo "macOS open 命令不可用，无法安全启动独立 Chrome。" >&2
  exit 1
fi
echo "关闭 Chrome 窗口才会结束登录态会话；关闭本终端不会自动关浏览器。"

for _ in {1..20}; do
  if node -e "require('node:http').get('http://127.0.0.1:$PORT/json/version', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))" >/dev/null 2>&1; then
    echo "Chrome 调试端口已就绪: 127.0.0.1:$PORT"
    exit 0
  fi
  sleep 0.5
done

echo "⚠️  Chrome 已尝试启动，但 127.0.0.1:$PORT 暂不可读。"
echo "→ 若已有普通 Chrome 正在运行，请关闭它或换端口重试: ./launch-chrome.sh 9223"
echo "→ 可查看日志: $LOG"
exit 1
