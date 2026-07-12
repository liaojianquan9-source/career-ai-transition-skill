#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL="$HOME/.agents/skills"
CLAUDE="$HOME/.claude/skills"

mkdir -p "$CANONICAL" "$CLAUDE"

# 先检查所有冲突，避免安装到一半才停止。
for d in "$ROOT"/skills/*/; do
  name="$(basename "$d")"
  if [[ -e "$CANONICAL/$name" || -L "$CANONICAL/$name" || -e "$CLAUDE/$name" || -L "$CLAUDE/$name" ]]; then
    echo "冲突：已存在同名 Skill: $name" >&2
    echo "请先备份或卸载旧版本，安装脚本不会自动覆盖。" >&2
    exit 1
  fi
done

for d in "$ROOT"/skills/*/; do
  name="$(basename "$d")"
  ln -sfn "$d" "$CANONICAL/$name"
  ln -sfn "$CANONICAL/$name" "$CLAUDE/$name"
  echo "linked: $name"
done

echo "安装完成。"
echo "- Codex：使用 ~/.agents/skills/"
echo "- Claude Code：使用 ~/.claude/skills/ 软链接"
echo "重启对应客户端后生效。"
