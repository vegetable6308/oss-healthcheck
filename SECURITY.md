# Security Policy

## Supported versions

Security fixes are provided for the latest released major version. Pre-release branches and unsupported Node.js runtimes may not receive fixes.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub private vulnerability reporting on this repository. If that feature is unavailable, contact the primary maintainer through the private address listed on their public GitHub profile and state that the message concerns OSS Healthcheck security.

Include the affected version, impact, minimal reproduction, and any suggested mitigation. Never include real secrets or third-party personal data.

Maintainers aim to acknowledge a report within five business days, provide a triage decision within ten business days, and coordinate disclosure after a fix is available. Good-faith research that avoids privacy violations, service disruption, and data destruction is welcome.

## Scope

Security issues include path traversal, unsafe file overwrite, command execution, untrusted configuration handling, output injection, and compromised release artifacts. A low health score or an inaccurate non-security rule is normally a public bug, not a private vulnerability.
