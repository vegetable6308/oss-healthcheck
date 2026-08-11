# Codex for Open Source 申请与维护指南

本文用于把 OSS Healthcheck 从“高质量新仓库”推进为“有真实使用与持续维护证据的开源项目”。不要填写虚假 Star、下载量、贡献者或维护记录。

## 官方审核信号

OpenAI 当前公开说明重点关注：

1. 申请人是活跃公开开源项目的 primary maintainer 或 core maintainer；
2. 仓库具有真实使用、较广采用，或对软件生态有清晰价值；
3. 能看到持续维护证据，例如 PR review、Issue triage、版本发布、安全与代码质量工作；
4. GitHub 个人资料与仓库必须公开；
5. 申请滚动审核，入选由 OpenAI 决定，没有“100% 通过”的公开硬门槛。

官方申请页：https://openai.com/form/codex-for-oss/

## 发布前一次性设置

GitHub 用户名已确认后，检查仓库链接全部指向该公开用户名，然后：

- 创建公开仓库 `oss-healthcheck`，默认分支为 `main`；
- 启用 Issues、Discussions 和 Private vulnerability reporting；
- 为 `main` 配置 ruleset：要求 PR、CI 与 CodeQL 通过，禁止 force push 和删除；
- 在 npm 启用 trusted publishing，并把 GitHub `release.yml` 绑定为可信发布者；
- 为 npm 发布环境增加必要的审批和分支/标签限制；
- 创建 `v0.1.0` GitHub Release，并验证 npm provenance；
- 在仓库 About 中填写描述、官网、topics：`open-source`、`repository-health`、`github-action`、`maintainer-tools`、`security`。

## 建议的真实采用路线

### 第 1 周：可用性验证

- 用 5 个不同语言的公开仓库进行扫描，记录误判并创建公开 Issue；
- 发布 `v0.1.0`，验证 `npx oss-healthcheck@latest` 与 GitHub Action；
- 为 README 增加真实终端截图或短演示；
- 邀请 2–3 位真实维护者试用并直接提出 Issue，而不是只求 Star。

### 第 2–4 周：维护证据

- 公开分类和回复每个 Issue；
- 通过 PR 修复至少一个来自真实仓库的误判；
- 按语义化版本发布修复版本，并维护 CHANGELOG；
- 记录真实 npm 周下载量、唯一使用仓库、外部贡献者和典型问题；
- 每周更新下面的维护日志。

只有真实发生的数据才应写入申请。新仓库可立即申请，但从官方标准看，先积累一段可核验的使用和维护记录更有说服力。

## 维护证据日志

| 日期       | Issue triage | PR review/merge | Release  | 使用/生态证据  | 安全/质量工作 |
| ---------- | ------------ | --------------- | -------- | -------------- | ------------- |
| YYYY-MM-DD | 链接         | 链接            | 版本链接 | 真实数据与链接 | 链接          |

## 申请字段草稿

以下英文草稿必须在提交前用真实数据替换方括号内容，每项控制在表单的 500 字符限制内。

### Role

选择 `Primary maintainer`。

### Why does this repository qualify?

```text
I am the primary maintainer of OSS Healthcheck, a zero-runtime-dependency CLI and GitHub Action that audits 19 open-source maintenance practices across documentation, security, community, CI, quality, and releases. It has [REAL STARS], [REAL MONTHLY DOWNLOADS], and is used by [REAL PUBLIC REPOSITORIES/MAINTAINERS]. I triage issues, review contributions, maintain releases, and handle security reports. Its goal is to make healthy OSS maintenance measurable and actionable across ecosystems.
```

如果申请时采用数据仍很少，诚实使用生态价值版本：

```text
I am the primary maintainer of OSS Healthcheck, a zero-runtime-dependency CLI and GitHub Action that makes 19 essential OSS maintenance practices measurable and actionable. It produces text, JSON, and SARIF reports and safely scaffolds community files. The project addresses a cross-ecosystem problem: maintainers need a repeatable way to detect missing contribution, security, CI, ownership, and release processes. I actively triage issues, review changes, publish releases, and maintain security and quality.
```

### How will you use API credits for your project?

```text
I will use API credits for maintainer automation: classifying and deduplicating incoming issues, drafting reproducible test fixtures from sanitized reports, reviewing pull requests against the scoring contract, generating release-note drafts from merged changes, and evaluating rule false positives across language ecosystems. Human maintainers will review every write action. No private repository content, secrets, or personal data will be sent without explicit authorization.
```

### Anything else we should know?

```text
The project intentionally has zero runtime dependencies to reduce supply-chain risk. CI tests Node.js 20/22/24, CodeQL and Dependabot are enabled, npm releases use trusted provenance, and the test suite covers path traversal and symlink-safe writes. The repository publishes English and Chinese documentation and a transparent 100-point scoring model. Current metrics and maintenance evidence are linked in the public repository; no adoption figures in this application are estimated.
```

## 提交前核对

- GitHub profile 和仓库是 Public；
- 申请邮箱与 ChatGPT 账号一致；
- GitHub username、仓库 URL、OpenAI Organization ID 正确；
- 所有数字都有公开页面或 npm/GitHub 可核验来源；
- 表单中的项目角色与仓库活动一致；
- 需要 API credits 时，说明具体 maintainer automation 用途；
- 阅读并同意当时最新的 Program Terms；
- 保存提交日期，但不要重复频繁提交。
