# Governance

OSS Healthcheck uses a maintainer-led, evidence-based governance model.

## Roles

- **Contributors** submit issues, documentation, tests, or code.
- **Reviewers** have demonstrated sound reviews and may approve routine changes.
- **Core maintainers** triage issues, review pull requests, manage releases, and handle security reports.
- **Primary maintainer** is accountable for project direction, access, and continuity.

Roles are earned through sustained, constructive public contributions. Maintainers document role changes in MAINTAINERS.md.

## Decisions

Routine changes use lazy consensus after review. Scoring weights, breaking CLI behavior, security policy, and governance changes require a public proposal and at least seven days for feedback. Maintainers seek consensus; if it is not possible, the primary maintainer records a decision and rationale publicly.

## Releases and access

Releases follow semantic versioning and the published release workflow. Repository and npm permissions use least privilege. No single contributor should merge and release their own security-sensitive change without independent review once a second maintainer is active.

## Inactivity and succession

A maintainer inactive for six months may move to emeritus status after contact attempts. If the primary maintainer is unavailable for 30 days during an urgent security or release issue, active core maintainers may designate an interim primary maintainer by public consensus.
