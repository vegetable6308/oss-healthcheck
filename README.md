# OSS Healthcheck

[![CI](https://github.com/vegetable6308/oss-healthcheck/actions/workflows/ci.yml/badge.svg)](https://github.com/vegetable6308/oss-healthcheck/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A zero-runtime-dependency CLI and GitHub Action that turns open-source repository health into an explainable 100-point check.**

OSS Healthcheck helps maintainers find missing community, security, quality, automation, and release practices before contributors do. Every rule has a visible weight, evidence, and remediation. The same engine powers local scans, machine-readable reports, and pull-request gates.

[简体中文](README.zh-CN.md)

## Why this project exists

Repository health is more than a README badge. Healthy projects tell people how to contribute, route vulnerability reports privately, test changes, update dependencies, assign review ownership, and publish releases repeatably. Those signals are scattered across GitHub settings and files, so they are easy to miss and hard to enforce consistently.

OSS Healthcheck makes that contract:

- **transparent** — 19 documented rules total exactly 100 points;
- **actionable** — failures explain what is missing and how to fix it;
- **portable** — zero runtime dependencies and Node.js 20+ support;
- **automation-friendly** — text, JSON, and SARIF output plus a native GitHub Action;
- **safe by default** — initialization never overwrites existing files unless `--force` is explicit.

## Quick start

Run the verified source revision without installing globally:

```bash
npm exec --yes --package=github:vegetable6308/oss-healthcheck#17f37153ef8aefceac5989da5442ce0a507788ad -- oss-healthcheck .
```

The npm package is not published yet. After the first registry release, the shorter commands will be:

```bash
npx oss-healthcheck@latest .
npm install --global oss-healthcheck
```

Scan a repository and require 90 points:

```bash
oss-healthcheck ./my-project --min-score 90
```

Exit code `0` means the threshold passed, `1` means the score is too low, and `2` means the command or configuration is invalid.

## Commands

### Scan

```bash
oss-healthcheck [scan] [path] [options]
```

| Option           | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `--format text`  | Human-readable findings (default)               |
| `--format json`  | Stable report schema for scripts and dashboards |
| `--format sarif` | SARIF 2.1.0 for code-scanning ingestion         |
| `--min-score 80` | Override the configured passing score           |
| `--config path`  | Load an explicit JSON configuration             |
| `--output path`  | Write a report inside the scanned repository    |
| `--no-color`     | Disable ANSI colors                             |

Examples:

```bash
oss-healthcheck . --format json --output reports/health.json
oss-healthcheck . --format sarif --output reports/health.sarif
oss-healthcheck rules
```

For safety, `--output` cannot write outside the scanned repository.

### Initialize community files

```bash
oss-healthcheck init .
```

This creates a configuration, contribution guide, security and support policies, pull-request template, and structured bug/feature issue forms. Existing files are skipped. Review and customize generated text before committing it. Use `--force` only when you intentionally want to replace those exact templates.

The initializer deliberately does **not** choose a software license or create CODEOWNERS for you: both require a human decision.

## GitHub Action

```yaml
name: Repository health
on:
  pull_request:
  push:
    branches: [main]

jobs:
  healthcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      # Replace this SHA with a released v1 tag once available.
      - uses: vegetable6308/oss-healthcheck@17f37153ef8aefceac5989da5442ce0a507788ad
        with:
          min-score: "90"
```

The action exposes `score` and `passed` outputs and fails the step when the threshold is not met. Pin a full commit SHA in high-assurance environments.

## Configuration

Create `.oss-healthcheck.json` in the repository root:

```json
{
  "threshold": 85,
  "disabledRules": ["quality.lockfile"]
}
```

Disabled rules are removed from the denominator and the remaining weights are normalized to 100. Unknown rule IDs and invalid thresholds fail closed. Prefer documenting why a rule is disabled in your governance or contribution guide.

## Scoring model

| Area          | Rule                          | Points |
| ------------- | ----------------------------- | -----: |
| Documentation | Substantive README            |     10 |
| Documentation | Open-source license           |      8 |
| Community     | Contribution guide            |      6 |
| Community     | Code of conduct               |      4 |
| Security      | Security policy               |      8 |
| Community     | Support policy                |      3 |
| Community     | Issue templates               |      4 |
| Community     | Pull request template         |      4 |
| Automation    | Pull-request CI               |      8 |
| Automation    | Dependency updates            |      5 |
| Quality       | Automated tests               |      8 |
| Quality       | Linting or formatting         |      5 |
| Quality       | Dependency lockfile           |      3 |
| Quality       | Static analysis or typed code |      4 |
| Release       | Changelog                     |      5 |
| Release       | Release automation            |      5 |
| Documentation | Project metadata              |      4 |
| Community     | CODEOWNERS                    |      3 |
| Community     | Governance/maintainers        |      3 |

The score measures the presence of maintainership foundations, not project popularity or code correctness. A 100 score is not a security certification. Rule changes follow semantic versioning and are documented in the changelog.

## Development

Prerequisites: Node.js 20+ and npm 10+.

```bash
git clone https://github.com/vegetable6308/oss-healthcheck.git
cd oss-healthcheck
npm ci
npm run check
```

`npm run check` verifies formatting, linting, types, coverage, the production build, and end-to-end CLI behavior. The committed `dist/` directory is intentional because GitHub JavaScript Actions execute it directly; CI verifies it can be rebuilt from source.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [GOVERNANCE.md](GOVERNANCE.md) before opening a change.

Maintainers can use the [release checklist](docs/RELEASE_CHECKLIST.md). The Chinese [Codex for Open Source application guide](docs/APPLICATION_GUIDE.zh-CN.md) separates verifiable application evidence from metrics that must be earned after publication.

## Roadmap

- repository-host API adapters for settings that files cannot prove;
- policy packs for language ecosystems and foundations;
- historical score trends and adoption metrics;
- signed release attestations and richer SARIF locations.

Feature work is tracked in public issues and milestones. Proposals should begin with a concrete maintainer use case.

## License

MIT © 2026 OSS Healthcheck contributors.
