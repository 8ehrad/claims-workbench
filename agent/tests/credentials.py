"""The settings the deployment gives an AgentCore app on Runtime in the tests, naming
the providers of the project's three credentials in AgentCore Identity."""

CREDENTIALS = {
    "OPENROUTER_API_KEY": "claims_workbench-openrouter",
    "CLAIMS_API_KEY": "claims_workbench-api-key",
    "DATABASE_URL": "claims_workbench-database",
}
