# Five-minute demonstration

1. **Queue and oversight.** Sign in as Dana. Show the claim counts, open a claim and point out its story, supporting documents, policy and history. Explain why models receive tools scoped to one claim.
2. **Work the queue.** Start a dispatch at a small concurrency such as three. Follow the security check, context lookups and decision calculation on a claim. Point to the sources and the code-calculated run summary.
3. **Human approval.** Open a held payout. Show its calculation and send it back with a policy-specific review note, or sign it off. Explain that sign-off pays through a backend operation, and the graph resumes after a persisted interrupt.
4. **Copilot with the handler's permissions.** Ask about a claim and then request a held payout's sign-off. Show the confirmation card. Repeat as Marcus to demonstrate the permission refusal.
5. **Evidence and tradeoffs.** Open the Scoreboard and explain isolated evaluation copies, payout accuracy, mistake cost, model cost and elapsed time. Show configuration history and the human approval boundary on improvement rounds.

Prepare the demo before the interview: seed once into a dedicated database, check all services, confirm the chosen model is available and keep an eye on its usage. Live dispatches and evaluations incur provider charges. Do not reseed once you have a demonstration state you want to keep.

Be clear about authorship: this is an adaptation of an existing application, with your packaging, branding and documented changes. Use the architecture discussion to show what you understand: recovery after failures, replay safety, authorization boundaries, evaluation leakage and the limits of model-based screening. `NOTICE.md` credits the foundation.
