# Release checklist

## Before tagging

- [ ] Confirm all user-facing changes are documented in CHANGELOG.md.
- [ ] Run `npm ci` from a clean checkout.
- [ ] Run `npm run check` on a supported Node.js version.
- [ ] Run `node dist/cli.js . --min-score 100 --no-color`.
- [ ] Run `npm pack --dry-run --ignore-scripts` and inspect the file list.
- [ ] Run `npm audit` and review Dependabot/CodeQL alerts.
- [ ] Confirm the version in `package.json`, `src/scanner.ts`, and CHANGELOG.md agrees.
- [ ] Confirm generated `dist/` matches source and contains no secrets or local paths.

## Publish

- [ ] Merge through a reviewed pull request.
- [ ] Create a signed semantic-version tag such as `v0.1.0`.
- [ ] Let the protected GitHub release workflow publish to npm with provenance.
- [ ] Create GitHub release notes from the changelog.

## Verify

- [ ] Install with `npx oss-healthcheck@<version> --version` in a clean directory.
- [ ] Verify npm provenance and package contents.
- [ ] Verify `vegetable6308/oss-healthcheck@v1` in a public fixture repository.
- [ ] Watch Issues, Discussions, security reports, and CI for regressions.
- [ ] Move the `v1` major tag only after the release is verified.
