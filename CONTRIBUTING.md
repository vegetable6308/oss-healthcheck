# Contributing

Thank you for improving OSS Healthcheck. Contributions should make repository health more accurate, explainable, or easier to automate.

## Before starting

- Use a bug report for reproducible incorrect behavior.
- Use a feature request for a concrete maintainer problem.
- Discuss scoring or rule-weight changes before implementing them because they affect every consumer.
- Report vulnerabilities privately as described in SECURITY.md.

## Development setup

```bash
git clone https://github.com/vegetable6308/oss-healthcheck.git
cd oss-healthcheck
npm ci
npm run check
```

The project supports Node.js 20 and newer. Production code must retain zero runtime dependencies unless maintainers approve a documented exception.

## Pull requests

1. Create a focused branch from `main`.
2. Add or update tests for every behavior change.
3. Preserve cross-platform paths and deterministic output.
4. Update the English and Chinese documentation when user behavior changes.
5. Add an entry to `CHANGELOG.md` under Unreleased.
6. Run `npm run check` before opening the pull request.

Keep commits reviewable and avoid unrelated formatting. Maintainers may ask for a changeset to be split when independent concerns are mixed.

## Adding or changing a rule

Rules live in `src/rules.ts`. A rule must have a stable ID, documented weight, actionable failure message, remediation, pass/fail tests, and evidence paths. Total default weight must remain exactly 100. Avoid rules that infer popularity, contributor identity, or private repository settings from files.

## Review and release

At least one maintainer review is required. Security-sensitive or scoring-model changes should receive two reviews once the project has multiple active maintainers. Releases are created from signed `v*` tags through the release workflow; npm publishing uses trusted provenance.
