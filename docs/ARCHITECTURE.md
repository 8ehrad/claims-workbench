# Architecture and boundaries

## Application

`backend/main.py` defines claim lifecycle operations. Routers in `runs.py`, `configuration.py`, `improvement.py` and `copilot.py` handle their respective records. SQLAlchemy Core queries support PostgreSQL and SQLite; Supabase Auth JWTs identify configured handlers.

The backend enforces payout calculations, complete decision records, approval limits and senior-handler permissions. A conditional status update ensures only one concurrent sign-off or send-back succeeds. Repeated matching decisions and payments return the existing record. Agent-only routes require `CLAIMS_API_KEY`; a key cannot substitute for a handler's identity.

`agent/harness.py` builds a LangGraph claim graph: screen customer text, investigate with tools, record a decision, pay or pause for review, and optionally save customer memory. The dispatcher fans out to separate claim agents with bounded concurrency. PostgreSQL checkpoints save progress synchronously after each graph step. Transient errors resume the same attempt; other failures receive one new attempt before being left for a handler.

`context/` serves seven read-only MCP tools with source metadata. Each claim agent's claim, policy and customer identifiers come from runtime context, rather than model-supplied identifiers. The direct route calls the backend and context service; the optional Gateway route signs MCP requests with SigV4.

Evaluations work isolated copies, keep them out of the queue and disable customer memory. Handler labels are scoring data, unavailable through claim-agent tools. The improver reads evaluation-set misses and held-out aggregate scores; proposed changes require approval and a code-based keep/rollback rule.

`agent/copilot/` is a separate graph. Its backend calls carry the handler's JWT. The graph pauses for explicit payment confirmation, while the backend fills the card from records and rechecks the held decision when an answer arrives. Identity tokens are runtime context and are not checkpointed.

The React dashboard uses a typed API client, shared loading/action hooks and adaptive polling. Each claim displays calculations, decision provenance, agent steps and the context sources used.

## Important limitations

- This is a portfolio demo using synthetic travel insurance rules and simulated payments. It has not been assessed for production insurance use.
- A process failure after a decision or payment can leave its optional memory save unfinished. Paid claims remain paid; memory is not the system of record.
- Failed claim resumes are logged. A later dispatch recovers eligible in-progress claims after their heartbeat expires.
- Stale work is marked stopped after five minutes, but that does not terminate a still-running worker. Backend checks protect decisions and payments against replay.
- A Copilot turn can outlive its handler token. Unfinished turns become stopped after twenty minutes; there is no automatic reconciliation of every partially completed turn.
- The Copilot may explain a decision from existing claim records without independently retrieving every cited policy section. Its instructions encourage verification but do not guarantee that lookup.
- A changed held decision between a confirmation answer and the eventual sign-off is a remaining race window. The backend still applies permission and held-status checks.
- Long-lived live agents require PostgreSQL, even when the backend uses SQLite. Tests replace persistence and external services with stand-ins.
- Model behavior and scores vary between runs. The repository's test suite validates software behavior; it does not certify claim-decision accuracy.
