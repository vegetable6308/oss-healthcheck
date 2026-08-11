import { lstat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertNoSymlinkPath, canonicalDirectory } from "./path-safety.js";
const TEMPLATES = {
    ".oss-healthcheck.json": `{
  "threshold": 80,
  "disabledRules": []
}\n`,
    "CONTRIBUTING.md": `# Contributing\n\nThank you for helping improve this project.\n\n## Development\n\n1. Fork and clone the repository.\n2. Create a focused branch.\n3. Add tests for behavior changes.\n4. Run the documented quality checks.\n5. Open a pull request explaining the problem and solution.\n\nPlease keep changes small, follow the code of conduct, and report security issues privately.\n`,
    "SECURITY.md": `# Security Policy\n\n## Reporting a vulnerability\n\nPlease do not open a public issue for suspected vulnerabilities. Use GitHub's private vulnerability reporting feature. Include reproduction steps, affected versions, and impact. Maintainers will acknowledge reports within five business days.\n\n## Supported versions\n\nSecurity fixes are provided for the latest released major version.\n`,
    "SUPPORT.md": `# Support\n\nUse GitHub Discussions for questions and usage help. Use the bug report template for reproducible defects. Security issues must follow SECURITY.md and must not be posted publicly.\n`,
    ".github/PULL_REQUEST_TEMPLATE.md": `## Summary\n\nDescribe the problem and solution.\n\n## Validation\n\n- [ ] Tests added or updated\n- [ ] Local quality checks pass\n- [ ] Documentation updated\n- [ ] No unrelated changes\n`,
    ".github/ISSUE_TEMPLATE/bug_report.yml": `name: Bug report\ndescription: Report a reproducible defect\ntitle: "[Bug]: "\nlabels: [bug, triage]\nbody:\n  - type: textarea\n    id: problem\n    attributes:\n      label: What happened?\n      description: Include expected behavior, actual behavior, and minimal reproduction steps.\n    validations:\n      required: true\n  - type: input\n    id: version\n    attributes:\n      label: Version\n    validations:\n      required: true\n`,
    ".github/ISSUE_TEMPLATE/feature_request.yml": `name: Feature request\ndescription: Propose an improvement\ntitle: "[Feature]: "\nlabels: [enhancement, triage]\nbody:\n  - type: textarea\n    id: use-case\n    attributes:\n      label: Use case\n      description: What problem would this solve, and for whom?\n    validations:\n      required: true\n  - type: textarea\n    id: proposal\n    attributes:\n      label: Proposed solution\n    validations:\n      required: true\n`,
};
async function exists(file) {
    try {
        await lstat(file);
        return true;
    }
    catch {
        return false;
    }
}
export async function initializeRepository(rootPath, options = {}) {
    const root = await canonicalDirectory(rootPath);
    const created = [];
    const skipped = [];
    for (const [relative, content] of Object.entries(TEMPLATES)) {
        const destination = path.join(root, relative);
        await assertNoSymlinkPath(root, destination);
        if (!options.force && (await exists(destination))) {
            skipped.push(relative);
            continue;
        }
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, content, "utf8");
        created.push(relative);
    }
    return { created, skipped };
}
//# sourceMappingURL=init.js.map