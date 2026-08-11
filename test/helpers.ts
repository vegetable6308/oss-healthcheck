import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export async function makeRepository(files: Record<string, string> = {}): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "oss-healthcheck-test-"));
  for (const [relative, content] of Object.entries(files)) {
    const destination = path.join(root, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content, "utf8");
  }
  return root;
}

export const completeRepository: Record<string, string> = {
  "README.md": `# Healthy repository\n\n${"Purpose and background. ".repeat(30)}\n## Installation\nInstall it.\n## Usage\nUse it.\n## Contributing\nContribute.\n`,
  LICENSE: "MIT License\n" + "Permission is hereby granted. ".repeat(10),
  "CONTRIBUTING.md": "# Contributing\nRun tests and open a pull request.",
  "CODE_OF_CONDUCT.md": "# Code of Conduct\nBe kind.",
  "SECURITY.md": "# Security\n## Supported versions\nPrivately report a vulnerability.",
  "SUPPORT.md": "# Support\nUse Discussions.",
  "GOVERNANCE.md": "# Governance\nMaintainers use consensus.",
  "CHANGELOG.md": "# Changelog\n## 0.1.0",
  ".github/CODEOWNERS": "* @maintainer",
  ".github/PULL_REQUEST_TEMPLATE.md": "# Pull request\n- [ ] Tests pass",
  ".github/ISSUE_TEMPLATE/bug.yml": "name: Bug",
  ".github/ISSUE_TEMPLATE/feature.yml": "name: Feature",
  ".github/dependabot.yml": "version: 2",
  ".github/workflows/ci.yml":
    "on:\n  pull_request:\njobs:\n  test:\n    steps:\n      - run: npm test",
  ".github/workflows/release.yml":
    "on:\n  release:\njobs:\n  publish:\n    steps:\n      - run: npm publish",
  "src/index.ts": "export const healthy = true;",
  "test/index.test.ts": "// test fixture",
  "tsconfig.json": "{}",
  "eslint.config.mjs": "export default [];",
  "package-lock.json": "{}",
  "package.json": JSON.stringify({
    name: "healthy-fixture",
    description: "fixture",
    license: "MIT",
    repository: "https://example.test/repo",
    bugs: "https://example.test/issues",
    scripts: { test: "vitest", lint: "eslint ." },
  }),
};
