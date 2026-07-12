# 职业 AI 转型 Skill｜Career AI Transition Skill

## 中文说明

### 这是什么

这是一套以真实职业经历、AI 实践和招聘市场为依据的职业转型工作流。它不直接给出通用的“高薪岗位清单”，而是先通过多轮对话问清用户的背景、实际能力、项目证据、城市和薪资约束，再针对一个选定方向分析真实招聘要求，最后形成学习、作品集和求职计划。

### 适用人群

- 已经使用 AI，但不知道自己能对应哪些岗位的人；
- 做过 Skill、Agent、工作流、API 接入、AI 编程或 Vibe Coding，想把实践转化为求职能力的人；
- AI 零基础，希望先根据真实招聘要求安排学习的人；
- 需要系统化学习路线、作品集任务和持续进度管理的人。

### 地区定位

当前版本是 **China-first（中国市场优先）**，不是 China-only。

- 默认语言是中文；
- 默认优先考虑中国大陆招聘语境；
- 中国用户可以选择 BOSS 直聘作为岗位数据来源；
- 系统会优先将一线和强二线城市作为 AI 职业机会的对照组，同时允许用户选择其他城市；
- 具体城市结论必须根据当时的岗位数据验证，不作无条件保证。

非中国用户仍然可以使用能力盘点、差距分析、学习计划和进度管理。但是需要改用当地招聘平台或由用户提供职位描述；中国城市、人民币薪资和本地反诈规则不应直接套用。

### 工具与安装

使用前只需要：

1. 支持 Agent Skills 的 AI 客户端；
2. 安装本 Skill；
3. 允许 AI 读写当前工作目录。

初始化阶段不需要预先安装 BOSS adapter、Node.js 或 Chrome 调试环境。用户选定一个职业方向并进入真实岗位验证时，Skill 再检测环境，并让用户选择：

- 配置并使用 BOSS adapter；
- 手动粘贴若干真实 JD；
- 使用公开网页信息。

### 工作流

1. 初始化与强制追问；
2. 形成能力画像和待验证方向；
3. 选定一个方向，深入分析真实招聘要求；
4. 根据岗位核心能力计算差距；
5. 生成学习路线、作品集和求职计划；
6. 记录进度并持续调整。

### 公开发声与作品证据

本 Skill 强烈建议持续公开输出，但它不是阻止学习进度的硬性门槛。目标不是强迫用户成为网红，而是建立可被招聘者和同行看到的专业表达与作品证据。文章、图文、露脸或不露脸视频、纯声音、GitHub 仓库、Demo、Skill 讲解、教程、案例、工作流、AI 资讯和个人看法均可以。每周一次只是建议节奏。

初始化时会询问用户是否已有公开账号、发布过什么和使用什么形式。用户确认已发布即可，不强制提供链接；有链接时可自愿提供供进一步分析。私人笔记和未发布草稿不算发声。不强制真名、露脸或追求粉丝数，可使用匿名账号。公司机密、客户数据、个人隐私和未授权材料必须脱敏或不发布。

### Prompt 如何处理

初始化阶段不考查 Prompt 术语或固定框架。Skill 会通过用户对真实案例的描述和多轮追问，观察其是否能说清背景、目标、输入、过程、结果和判断标准。相关缺口会在确定目标岗位后，以与工作场景相关的方式加入学习计划。

### 免责声明

本 Skill 只提供职业研究、能力分析和学习规划建议，不保证薪资、面试、录用或转型周期。使用者应自行核对招聘信息、平台条款和本地法律要求。

---

## English Guide

### What this is

Career AI Transition Skill is a workflow for career transition based on a user's real work history, AI practice, and current hiring-market evidence. It does not immediately produce a generic list of high-paying jobs. It first clarifies the user's background, demonstrated capabilities, project evidence, location, salary constraints, and available learning time. After the user selects one direction, it validates that direction against real job descriptions and then produces a learning, portfolio, and job-search plan.

### Who it is for

- People who already use AI but do not know which roles their experience supports;
- People who have built Skills, agents, workflows, API integrations, AI-assisted software, or vibe-coding projects and want to turn that work into employable evidence;
- AI beginners who want a learning route derived from real hiring requirements;
- People who need a structured learning plan, portfolio milestones, and ongoing progress management.

### Regional scope

The current version is **China-first, not China-only**.

- Chinese is the default language.
- Mainland China's hiring context is the default market context.
- Chinese users may use BOSS Zhipin as a job-data source.
- Major first-tier and strong second-tier cities are used as comparison markets for AI opportunities, while users may still choose other locations.
- City recommendations must be validated with current job data and are not unconditional guarantees.

Users outside China can still use capability discovery, gap analysis, learning plans, and progress tracking. They should use local job platforms or provide job descriptions manually. China-specific city assumptions, RMB salary conventions, and local anti-scam rules should not be applied without localization.

### Tools and setup

Before starting, users only need:

1. An AI client that supports Agent Skills;
2. This Skill installed;
3. Permission for the AI client to read and write the current working directory.

The initialization stage does not require the BOSS adapter, Node.js, or a Chrome debugging environment. When the user selects a career direction and begins job-market validation, the Skill checks dependencies and offers three options:

- Configure and use the BOSS adapter;
- Paste several real job descriptions manually;
- Use publicly available web information.

### Workflow

1. Initialize the profile and clarify vague answers;
2. Produce a capability profile and unverified career-direction hypotheses;
3. Select one direction and analyze real hiring requirements;
4. Compare job requirements with demonstrated capabilities;
5. Generate a learning plan, portfolio plan, and job-search timeline;
6. Track progress and adjust the plan.

### Public voice and proof of work

The Skill strongly recommends consistent public output, but it is not a hard gate that blocks learning progress. The goal is not to force users to become influencers, but to build visible professional expression and proof of work. Articles, visual posts, face-to-camera or faceless videos, audio, GitHub repositories, demos, tutorials, case studies, AI news, and personal observations are all acceptable. One post per week is a recommendation, not a requirement.

During initialization, the Skill asks whether the user already has public accounts and what they have published. The user's confirmation is sufficient; a public link is optional. Private notes and unpublished drafts do not count as public voice. Real names, face-to-camera content, and follower growth are not mandatory; aliases are allowed. Company confidential information, client data, personal data, and unauthorized materials must be removed or withheld.

### How Prompt capability is handled

The initialization stage does not test Prompt terminology or fixed frameworks. It observes whether the user can explain the context, goal, inputs, process, outcome, and acceptance criteria of a real task. Any gaps are added to the learning plan later in a form that matches the selected role and its real work scenarios.

### Disclaimer

This Skill provides career research, capability analysis, and learning-planning guidance. It does not guarantee salary, interviews, employment, or a fixed transition timeline. Users must independently verify job information, platform terms, and local legal requirements.
