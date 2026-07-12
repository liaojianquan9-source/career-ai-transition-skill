# Career AI Transition Skill

[English](README.md) | [简体中文](README.zh-CN.md)

A China-first, evidence-based career transition workflow for people who want to turn practical AI experience into employable capabilities.

Instead of returning a generic list of high-paying jobs, the Skill clarifies the user's real experience, validates one selected direction against current job descriptions, identifies evidence-backed gaps, and produces a bounded learning, portfolio, and job-search plan.

## Who it is for

- People who already use AI but do not know which roles their experience supports;
- People who have built Skills, agents, workflows, API integrations, AI-assisted software, or vibe-coding projects;
- People with basic AI experience who want to turn that practice into employable evidence;
- People who need structured learning milestones, portfolio tasks, and ongoing progress tracking.

## Regional scope

The current release is **China-first, not China-only**.

For mainland China, it can use BOSS Zhipin as the primary job-data source and compare opportunities across major first-tier and strong second-tier cities. Users outside China can still use capability discovery, gap analysis, planning, and progress tracking, but should provide local job descriptions or use local hiring sources.

Market conclusions must be based on current evidence. The Skill does not guarantee salary, interviews, employment, or a fixed transition timeline.

## Workflow

The project contains four Skills:

1. `career-ai-transition-init` — clarify the user's background, AI practice, constraints, and demonstrated capabilities through two rounds of single-field multiple-choice questions;
2. `career-ai-transition-scan` — validate one selected career direction against recent job descriptions;
3. `career-ai-transition-plan` — build a bounded learning, portfolio, and job-search plan from the verified gaps;
4. `career-ai-transition-status` — track progress, provide up to three daily tasks, and adjust the plan using completed work.

## Core principles

- Use concrete examples instead of vague self-ratings such as “I know AI.”
- Put the role's core work requirements before personal preferences.
- Compare job requirements with demonstrated evidence instead of using pseudo-precise scores.
- Collect 8–12 raw job descriptions and retain at least five effective samples after deduplication.
- Prefer recent postings and major or industry-leading employers while preserving multi-company diversity.
- Treat a single search as a current snapshot, not proof of a market trend.
- Keep learning bounded: understand the principle, use it correctly, validate results, and deepen only when the target role requires it.
- Treat Prompt capability as a foundation for AI work, not automatically as a standalone career direction.
- Recommend public proof of work without making follower growth, real names, face-to-camera content, or weekly publishing a hard gate.

## Installation

The current release targets **Codex** and **Claude Code**.

```bash
git clone https://github.com/liaojianquan9-source/career-ai-transition-skill.git
cd career-ai-transition-skill
./install.sh
```

Restart the client after installation, then ask it to begin an AI career-transition capability assessment.

The initialization stage does not require Node.js, a Chrome debugging environment, or the BOSS adapter. Those dependencies are checked only after the user selects a career direction and begins job-market validation.

## BOSS Zhipin adapter

The optional adapter under `adapters/boss/` connects to a visible Chrome session through the Chrome DevTools Protocol.

- The user logs in and handles any verification manually.
- The workflow is low-frequency and read-only.
- It does not message recruiters or collect recruiter personal information.
- Its debugging port is bound to `127.0.0.1`.
- Use the dedicated browser profile only for job research. Do not use it for email, banking, cloud storage, or other sensitive services.
- Stop if the platform rules or page structure prevent safe access; do not bypass restrictions.

See [`adapters/boss/README.md`](adapters/boss/README.md) for setup and safety details.

## State and privacy

User progress is stored in local files rather than model memory:

- `.skill-state.json` stores the profile, selected direction, plans, and progress;
- `workspace/` stores daily work and portfolio artifacts;
- `reports/` stores generated reports;
- `lessons.md` stores reusable workflow lessons.

Personal state, generated daily work, and reports are excluded by `.gitignore`. Before sharing logs, screenshots, state files, or job descriptions, remove names, contact details, company-confidential information, client data, and other personal information.

## Feedback and contributions

This project is still being tested and improved. If you encounter a problem or have suggestions about the interview flow, job analysis, learning plans, or BOSS data collection, please [open an issue](https://github.com/liaojianquan9-source/career-ai-transition-skill/issues).

When submitting feedback, please include:

1. Whether you are using Codex or Claude Code;
2. What you were trying to accomplish;
3. What actually happened;
4. What you expected to happen;
5. Any relevant error message;
6. Sanitized screenshots or state excerpts when helpful.

Code improvements are welcome through [pull requests](https://github.com/liaojianquan9-source/career-ai-transition-skill/pulls). Different opinions are welcome; suggestions are evaluated against real usage scenarios, hiring-market evidence, safety, and the scope of the project.

## License

This project is released under the [MIT License](LICENSE).
