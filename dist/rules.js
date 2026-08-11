function pass(message, evidence) {
    return { passed: true, message, evidence };
}
function fail(message) {
    return { passed: false, message, evidence: [] };
}
function firstExisting(context, candidates) {
    return candidates.find((candidate) => context.has(candidate));
}
function matching(context, pattern) {
    return context.find(pattern);
}
function packageScripts(context) {
    const scripts = context.packageJson?.scripts;
    if (typeof scripts !== "object" || scripts === null || Array.isArray(scripts))
        return {};
    return Object.fromEntries(Object.entries(scripts).filter((entry) => typeof entry[1] === "string"));
}
async function containsAny(context, files, patterns) {
    const found = [];
    for (const file of files) {
        const content = await context.read(file);
        if (content !== undefined && patterns.some((pattern) => pattern.test(content)))
            found.push(file);
    }
    return found;
}
export const rules = [
    {
        id: "docs.readme",
        title: "Substantive README",
        category: "documentation",
        weight: 10,
        remediation: "Add a README with purpose, installation, usage, and contribution guidance.",
        async evaluate(context) {
            const file = firstExisting(context, ["README.md", "README.rst", "README.adoc", "README"]);
            if (file === undefined)
                return fail("No README found.");
            const content = (await context.read(file)) ?? "";
            const hasCoreSections = [/install/i, /usage|quick ?start/i, /contribut/i].filter((r) => r.test(content)).length;
            return content.length >= 600 && hasCoreSections >= 2
                ? pass("README explains how to adopt and contribute to the project.", [file])
                : fail("README is present but needs more installation, usage, or contribution detail.");
        },
    },
    {
        id: "legal.license",
        title: "Open-source license",
        category: "documentation",
        weight: 8,
        remediation: "Add an OSI-compatible LICENSE file and declare it in package metadata.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)(license|licence)(\.[^/]+)?$/i);
            if (files.length === 0)
                return fail("No license file found.");
            const content = (await context.read(files[0] ?? "")) ?? "";
            return content.trim().length >= 100
                ? pass("A substantive license file is present.", files.slice(0, 3))
                : fail("License file is empty or incomplete.");
        },
    },
    {
        id: "community.contributing",
        title: "Contribution guide",
        category: "community",
        weight: 6,
        remediation: "Add CONTRIBUTING.md with setup, test, commit, and pull request instructions.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)contributing(\.[^/]+)?$/i);
            return files.length > 0
                ? pass("Contribution guidance is available.", files)
                : fail("No contribution guide found.");
        },
    },
    {
        id: "community.code-of-conduct",
        title: "Code of conduct",
        category: "community",
        weight: 4,
        remediation: "Add CODE_OF_CONDUCT.md to define expected community behavior.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)code[_-]of[_-]conduct(\.[^/]+)?$/i);
            return files.length > 0
                ? pass("A code of conduct is published.", files)
                : fail("No code of conduct found.");
        },
    },
    {
        id: "security.policy",
        title: "Security policy",
        category: "security",
        weight: 8,
        remediation: "Add SECURITY.md with supported versions and a private reporting channel.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)security(\.[^/]+)?$/i);
            if (files.length === 0)
                return fail("No security policy found.");
            const useful = await containsAny(context, files, [
                /report/i,
                /vulnerab/i,
                /supported versions/i,
            ]);
            return useful.length > 0
                ? pass("Security reporting guidance is documented.", useful)
                : fail("Security policy does not explain vulnerability reporting.");
        },
    },
    {
        id: "community.support",
        title: "Support policy",
        category: "community",
        weight: 3,
        remediation: "Add SUPPORT.md that directs questions and bug reports to the right channels.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)support(\.[^/]+)?$/i);
            return files.length > 0
                ? pass("Support channels are documented.", files)
                : fail("No support policy found.");
        },
    },
    {
        id: "community.issue-templates",
        title: "Issue templates",
        category: "community",
        weight: 4,
        remediation: "Add structured bug report and feature request templates under .github/ISSUE_TEMPLATE.",
        async evaluate(context) {
            const files = matching(context, /^\.github\/issue_template\/[^/]+\.(md|ya?ml)$/i);
            return files.length >= 2
                ? pass("Multiple structured issue paths are available.", files)
                : fail("Add at least two issue templates (for example bug report and feature request).");
        },
    },
    {
        id: "community.pull-request-template",
        title: "Pull request template",
        category: "community",
        weight: 4,
        remediation: "Add .github/PULL_REQUEST_TEMPLATE.md with testing and checklist prompts.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)pull_request_template(\/.*|\.[^/]+)$/i);
            return files.length > 0
                ? pass("Pull requests receive structured guidance.", files)
                : fail("No pull request template found.");
        },
    },
    {
        id: "automation.ci",
        title: "Continuous integration",
        category: "automation",
        weight: 8,
        remediation: "Add CI that runs tests and quality checks on pull requests.",
        async evaluate(context) {
            const workflows = matching(context, /^\.github\/workflows\/[^/]+\.ya?ml$/i);
            const useful = await containsAny(context, workflows, [
                /pull_request:/i,
                /\btest\b/i,
                /\bcheck\b/i,
            ]);
            return useful.length > 0
                ? pass("CI workflows validate proposed changes.", useful)
                : fail("No pull-request CI workflow with test or check steps found.");
        },
    },
    {
        id: "automation.dependencies",
        title: "Automated dependency updates",
        category: "automation",
        weight: 5,
        remediation: "Configure Dependabot or Renovate for routine dependency updates.",
        async evaluate(context) {
            const files = [
                ".github/dependabot.yml",
                ".github/dependabot.yaml",
                "renovate.json",
                ".renovaterc",
            ];
            const file = firstExisting(context, files);
            return file === undefined
                ? fail("No dependency update automation found.")
                : pass("Dependencies are monitored by automation.", [file]);
        },
    },
    {
        id: "quality.tests",
        title: "Automated tests",
        category: "quality",
        weight: 8,
        remediation: "Add an automated test suite and a documented test command.",
        async evaluate(context) {
            const testFiles = matching(context, /(^|\/)(test|tests|spec|__tests__)(\/|\.)|\.(test|spec)\.[^/]+$/i);
            const scripts = packageScripts(context);
            const commands = Object.entries(scripts).filter(([name, command]) => /test/i.test(`${name} ${command}`));
            return testFiles.length > 0 || commands.length > 0
                ? pass("An automated test suite is present.", [
                    ...testFiles.slice(0, 5),
                    ...commands.map(([n]) => `package.json#scripts.${n}`),
                ])
                : fail("No automated tests or test command found.");
        },
    },
    {
        id: "quality.lint-format",
        title: "Linting or formatting",
        category: "quality",
        weight: 5,
        remediation: "Configure a linter or formatter and run it in CI.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)(eslint\.config\.|\.eslintrc|pyproject\.toml$|ruff\.toml$|\.golangci|rustfmt\.toml$|\.prettierrc)/i);
            const scripts = packageScripts(context);
            const commands = Object.keys(scripts).filter((name) => /lint|format|check/.test(name));
            return files.length > 0 || commands.length > 0
                ? pass("Automated style or static checks are configured.", [
                    ...files.slice(0, 5),
                    ...commands.map((n) => `package.json#scripts.${n}`),
                ])
                : fail("No linting or formatting configuration found.");
        },
    },
    {
        id: "quality.lockfile",
        title: "Dependency lockfile",
        category: "quality",
        weight: 3,
        remediation: "Commit the ecosystem lockfile for reproducible installs.",
        async evaluate(context) {
            const files = [
                "package-lock.json",
                "pnpm-lock.yaml",
                "yarn.lock",
                "uv.lock",
                "poetry.lock",
                "Cargo.lock",
                "go.sum",
            ];
            const file = firstExisting(context, files);
            return file === undefined
                ? fail("No recognized lockfile found.")
                : pass("Dependency resolution is reproducible.", [file]);
        },
    },
    {
        id: "quality.static-analysis",
        title: "Static analysis or typed code",
        category: "quality",
        weight: 4,
        remediation: "Add static analysis or a typed-language configuration.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)(tsconfig.*\.json|pyrightconfig\.json|mypy\.ini|\.golangci.*|clippy\.toml)$/i);
            const typedSources = matching(context, /\.(ts|tsx|go|rs|java|kt|swift)$/i);
            return files.length > 0 || typedSources.length > 0
                ? pass("Static analysis or typed sources are present.", [
                    ...files.slice(0, 3),
                    ...typedSources.slice(0, 3),
                ])
                : fail("No static analysis configuration or typed source files found.");
        },
    },
    {
        id: "release.changelog",
        title: "Changelog",
        category: "release",
        weight: 5,
        remediation: "Maintain CHANGELOG.md using a consistent release-note format.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)(changelog|changes|history)(\.[^/]+)?$/i);
            return files.length > 0
                ? pass("User-facing changes are tracked.", files)
                : fail("No changelog found.");
        },
    },
    {
        id: "release.automation",
        title: "Release automation",
        category: "release",
        weight: 5,
        remediation: "Add a tag/release workflow with provenance-aware package publishing.",
        async evaluate(context) {
            const workflows = matching(context, /^\.github\/workflows\/[^/]+\.ya?ml$/i);
            const useful = await containsAny(context, workflows, [
                /release/i,
                /publish/i,
                /workflow_dispatch/i,
            ]);
            return useful.length > 0
                ? pass("A repeatable release workflow exists.", useful)
                : fail("No release or publish automation found.");
        },
    },
    {
        id: "metadata.project",
        title: "Project metadata",
        category: "documentation",
        weight: 4,
        remediation: "Declare repository, license, issue tracker, description, and homepage metadata.",
        async evaluate(context) {
            if (context.packageJson === undefined) {
                const alternatives = matching(context, /(^|\/)(pyproject\.toml|cargo\.toml|go\.mod|pom\.xml)$/i);
                return alternatives.length > 0
                    ? pass("An ecosystem project manifest is present.", alternatives)
                    : fail("No recognized project manifest found.");
            }
            const required = ["description", "license", "repository", "bugs"];
            const present = required.filter((key) => context.packageJson?.[key] !== undefined);
            return present.length === required.length
                ? pass("Package metadata links users to source, license, and support.", present.map((key) => `package.json#${key}`))
                : fail(`Package metadata is missing: ${required.filter((key) => !present.includes(key)).join(", ")}.`);
        },
    },
    {
        id: "community.codeowners",
        title: "Code ownership",
        category: "community",
        weight: 3,
        remediation: "Add CODEOWNERS so reviews route to accountable maintainers.",
        async evaluate(context) {
            const file = firstExisting(context, [".github/CODEOWNERS", "CODEOWNERS", "docs/CODEOWNERS"]);
            return file === undefined
                ? fail("No CODEOWNERS file found.")
                : pass("Review ownership is explicit.", [file]);
        },
    },
    {
        id: "community.governance",
        title: "Governance and maintenance model",
        category: "community",
        weight: 3,
        remediation: "Add GOVERNANCE.md or MAINTAINERS.md with decision and maintainer processes.",
        async evaluate(context) {
            const files = matching(context, /(^|\/)(governance|maintainers)(\.[^/]+)?$/i);
            return files.length > 0
                ? pass("Project ownership and decision-making are documented.", files)
                : fail("No governance or maintainer model found.");
        },
    },
];
export function ruleIds() {
    return rules.map((rule) => rule.id);
}
//# sourceMappingURL=rules.js.map