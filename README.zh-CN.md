# 职业 AI 转型 Skill

[English](README.md) | [简体中文](README.zh-CN.md)

这是一套面向 AI 职业转型的工作流，以用户的真实经历、AI 实践和当前招聘数据为依据。

它不会直接给出通用的“高薪岗位清单”，而是先问清用户的背景、真实能力、项目证据、城市与时间约束，再对一个已选方向分析真实 JD，最后生成有学习边界的学习、作品集和求职计划。

## 适用人群

- 已经使用 AI，但不知道自己能对应哪些岗位的人；
- 做过 Skill、Agent、工作流、API 接入、AI 编程或 Vibe Coding 项目的人；
- 已有基础 AI 使用经验，希望把实践转换为可求职证据的人；
- 需要系统学习路线、作品集任务和持续进度管理的人。

## 地区定位

当前版本是 **China-first（中国市场优先），但不是 China-only**。

对中国大陆用户，可以将 BOSS 直聘作为主要岗位数据源，并将一线和强二线城市作为 AI 职业机会的对照组。非中国用户仍可使用能力盘点、差距分析、学习计划和进度管理，但应改用当地招聘平台或手动提供 JD。

市场结论必须以当前证据为准。本 Skill 不保证薪资、面试、录用或固定转型周期。

## 工作流

项目包含四个 Skill：

1. `career-ai-transition-init` — 通过两轮单字段选项题，问清背景、AI 实践、约束和真实能力；
2. `career-ai-transition-scan` — 使用近期真实 JD 验证一个已选职业方向；
3. `career-ai-transition-plan` — 根据已验证差距生成学习、作品集和求职计划；
4. `career-ai-transition-status` — 记录进度，每天最多安排三件事，并根据完成情况调整计划。

## 核心原则

- 用具体案例代替“我会 AI”这类模糊自评。
- 先看岗位本身的核心工作要求，再谈个人偏好。
- 把 JD 要求与用户证据逐项对比，不使用伪精确分数。
- 先获取 8–12 条原始 JD，去重后至少保留 5 条有效样本。
- 优先最近发布的岗位、大厂和行业头部企业，同时保留多公司样本。
- 单次搜索只是“当前快照”，不直接宣称已证明岗位趋势。
- 学习必须有边界：能讲清原理、正确使用、验证结果即可，只在目标岗位需要时继续深入。
- Prompt 是 AI 转型的通用基础能力，不默认当成独立职业方向。
- 推荐持续公开发声和展示作品，但不强制真名、露脸、粉丝增长或每周发布。

## 安装

当前版本主要支持 **Codex** 和 **Claude Code**。

```bash
git clone https://github.com/liaojianquan9-source/career-ai-transition-skill.git
cd career-ai-transition-skill
./install.sh
```

安装后重启对应客户端，然后说“我想做 AI 职业转型能力盘点”即可开始。

初始化阶段不要求预先安装 Node.js、Chrome 调试环境或 BOSS adapter。只有当用户选定职业方向、开始验证真实岗位时，才检查这些依赖。

## BOSS 直聘 adapter

`adapters/boss/` 中的可选工具通过 Chrome DevTools Protocol 连接有界面的 Chrome。

- 用户自行登录并处理验证。
- 只进行低频、只读操作。
- 不自动私聊招聘者，不采集招聘者个人信息。
- 调试端口仅绑定 `127.0.0.1`。
- 独立浏览器配置只用于岗位调查，不要在其中使用邮箱、网银、云盘等敏感服务。
- 平台规则或页面结构不允许安全读取时立即停止，不绕过限制。

详见 [`adapters/boss/README.md`](adapters/boss/README.md)。

## 状态与隐私

用户进度保存在本地文件中，不依赖模型记忆：

- `.skill-state.json` 保存画像、目标方向、计划和进度；
- `workspace/` 保存每日产出和作品集；
- `reports/` 保存生成的报告；
- `lessons.md` 保存可复用的工作流经验。

个人状态、每日产出和报告已通过 `.gitignore` 排除。分享日志、截图、状态文件或 JD 之前，请删除姓名、联系方式、公司机密、客户数据和其他隐私信息。

## 反馈与贡献

这个项目仍在持续测试和完善中。如果你在使用过程中遇到问题，或对追问流程、岗位分析、学习计划、BOSS 数据采集有改进建议，欢迎[提交 GitHub Issue](https://github.com/liaojianquan9-source/career-ai-transition-skill/issues)。

提交反馈时，建议说明：

1. 你使用的是 Codex 还是 Claude Code；
2. 你原本想完成什么；
3. 实际发生了什么；
4. 你期望得到什么结果；
5. 相关错误提示；
6. 已经脱敏的截图或状态片段。

也欢迎通过 [Pull Requests](https://github.com/liaojianquan9-source/career-ai-transition-skill/pulls) 提交代码改进。欢迎不同意见；建议会结合真实使用场景、招聘市场证据、安全边界和项目定位进行评估。

## 开源许可

本项目使用 [MIT License](LICENSE)。
