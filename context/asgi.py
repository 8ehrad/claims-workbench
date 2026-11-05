"""The context service's ASGI entry point for container hosting."""

import os

from mcp.server.transport_security import TransportSecuritySettings

from context.server import build_server

host = os.getenv("CLAIMS_CONTEXT_HOST", "localhost")
security = TransportSecuritySettings(
    allowed_hosts=["127.0.0.1:*", "localhost:*", f"{host}:*"],
    allowed_origins=["http://127.0.0.1:*", "http://localhost:*", f"http://{host}:*"],
)
app = build_server(security).streamable_http_app()
