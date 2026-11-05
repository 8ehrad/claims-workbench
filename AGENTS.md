# Claims Workbench

Read `README.md`, `docs/ARCHITECTURE.md` and `docs/DEPLOYMENT.md` before changing the application. Work only with synthetic data. Preserve backend authorization, payout checks, replay safety and evaluation isolation.

Use uv for Python. Keep service access in the existing API modules; the Copilot always uses handler identity. Use framework-native LangGraph persistence and interrupts. TypeScript is strict; never use `any`.

Add behavioral tests for code changes. Run focused tests while working, then `npm run check` and `npm run build`. Never weaken a check to pass. Before committing, have a fresh subagent review the changes against these requirements, fix blocking findings and rerun affected tests. Keep verification results honest: stand-in tests are not live model or cloud validation.

Do not publish secrets, provision or delete cloud resources, reseed a shared database or push to GitHub unless the user asks. Preserve attribution in `NOTICE.md`.
