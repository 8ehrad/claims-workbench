# Deployment

## Container route

Use a dedicated Supabase project for PostgreSQL and Auth. Configure `.env` from `.env.example` and create the demo handlers in Supabase Auth. The database must allow creating the `claims_workbench` schema. Never point the seed command at a business database.

```sh
docker compose build
docker compose run --rm backend python -m backend.seed
docker compose up -d
```

Open `http://localhost:8000`. The single application image runs four services: backend with the built dashboard, context MCP, claim agent and Copilot. Agents open their checkpoint pools on their first invocation. The container runtime uses a non-root user. `.env`, keys, local databases and test fixtures are excluded from the build context.

The frontend's Supabase URL and publishable key are build-time values. Rebuild the image after changing them; the publishable key is intended for the browser, while the database password, OpenRouter key and agent key stay server-side.

For a cloud container platform, deploy the same image as four services with the commands in `compose.yaml`. Put the backend behind HTTPS and expose only it publicly. Use private service addresses for `CLAIMS_API`, `CLAIMS_AGENT`, `CLAIMS_COPILOT` and `CLAIMS_CONTEXT`. Keep the context service private: its local transport does not authenticate requests. Configure its exact private DNS hostname with `CLAIMS_CONTEXT_HOST` so MCP's host validation accepts the service. Use one worker process per agent service, persistent external PostgreSQL and your platform's secret manager. Configure Supabase Auth's site URL and allowed redirects to the deployed HTTPS origin.

The compose file binds the backend to loopback for local use and does not provision TLS or cloud infrastructure. For a hosted demo, give the reviewer a limited handler account separately; do not put credentials in the repository. The demo has no public sign-up.

## AWS Lambda and AgentCore route

The backend's Lambda entry point is `backend.main.handler`; the context service uses `context.server.handler`. The backend serves `dashboard/dist` beside `/api`. Package the backend, `data/`, the built dashboard and the `server` dependency group for Linux/Python 3.12. Package `context/` and its `context` dependency group separately. See `tools/package-lambda.mjs`.

```sh
npm run build
node tools/package-lambda.mjs
```

These commands produce `dist/backend-lambda.zip` and `dist/context-lambda.zip`; they create no AWS resources. The dependency downloads require network access.

Configure Lambda with `DATABASE_URL` using Supabase's transaction pooler, `VITE_SUPABASE_URL`, `CLAIMS_API_KEY`, `CLAIMS_AGENT_RUNTIME` and `CLAIMS_COPILOT_RUNTIME`. Lambda uses a connection per request, keeps no pool, and disables prepared statements. Seed the dedicated demo database separately before invoking Lambda; Lambda never seeds on startup.

`agentcore/agentcore.json` and its CDK application define the agent and Copilot runtimes. AgentCore Identity supplies `OPENROUTER_API_KEY`, `CLAIMS_API_KEY` and `DATABASE_URL` to the agent; the Copilot fetches the first and last only. `agentcore/.env.local` supplies non-secret API, Gateway and optional memory settings. The runtimes use the `runtime` dependency group and entry points in `runtime/`.

This is an advanced deployment path: configure the Gateway's application OpenAPI target and private context target, Identity providers, runtime IAM permissions, Lambda invocation permissions and optional Memory resources in your account. Name the Gateway `claims-workbench-gateway` and its targets `claims-workbench-app` and `claims-workbench-context`. Gateway and target names use hyphens, not underscores. Memory names use the `claims_workbench` prefix in the supplied policies. Scope the IAM resources to your actual ARNs. Set Gateway payment policy to the required maximum and restrict the Copilot role to context tools. Deployment credentials and generated AWS targets are intentionally absent. No AWS infrastructure is created automatically by this repository.
