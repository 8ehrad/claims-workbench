# Verification

Verified on November 5, 2026, with Python 3.12.12 and Node 26.12.0 on macOS, plus Linux container checks.

| Check | Result |
| --- | --- |
| Python lint, format and Pyright | Passed |
| Python tests | 836 passed; 99% coverage |
| Frontend lint, format and TypeScript | Passed |
| Frontend unit tests | 178 passed across 18 files; 97.42% statement coverage |
| Playwright browser tests | 31 passed, including sign-in, claim workflows, permissions, Copilot and branding |
| Isolated server/context/runtime dependencies | Passed; both agent runtime entry points import |
| Production dashboard build | Passed |
| Docker image build and Compose configuration | Passed |
| Linux application container | Startup, 26 seeded claims, authentication, dashboard deep link, seven context tools and runtime imports passed |
| Lambda archives | Backend 36.0 MB; context 9.8 MB, built for Linux x86_64/Python 3.12 |
| npm dependency audit | Zero reported vulnerabilities after updates, including development dependencies |

The complete `npm run check` passed before the final development-tool patches. After those patches, the complete frontend checks and browser suite were rerun; Python code and dependencies were unchanged. The pre-commit hook also runs the Python and frontend checks.

An independent senior-engineer review found two AWS naming issues introduced by the rename: Gateway IAM prefixes and target names contained underscores. Both were corrected to valid hyphenated names, with their fixtures and deployment instructions updated. The follow-up review found no remaining merge blockers.

Development dependency updates addressed inherited npm advisories. The `minimatch` override pins a patched version 11 for development-tool consumers that otherwise select vulnerable version 10. That crosses their declared major-version range; the full lint, type and test checks validate the installed combination. Keep the lockfile and revisit the override when upstream tools adopt the fixed major version.

The screening prompt's regression contract is a standalone JSON fixture, so tests no longer require external notebooks. Container host validation has explicit allowed-host and denied-host tests. Screenshots were captured from the real dashboard against isolated test services and inspected visually.

Tests use stub models, synthetic data and local service stand-ins. These results establish software behavior and packaging, not live model accuracy or a deployed cloud environment. No paid model calls or cloud provisioning were performed. Existing recovery and confirmation limitations are documented in `ARCHITECTURE.md`.
