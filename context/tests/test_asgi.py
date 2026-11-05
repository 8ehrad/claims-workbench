"""The container's MCP endpoint admits its configured host and refuses others."""

from importlib import reload

import pytest
from starlette.testclient import TestClient

from context import asgi


@pytest.mark.parametrize(
    ("host", "status"), [("context:8006", 200), ("unexpected.example:8006", 421)]
)
def test_container_host_validation(monkeypatch, host, status):
    monkeypatch.setenv("CLAIMS_CONTEXT_HOST", "context")
    app = reload(asgi).app
    with TestClient(app, base_url=f"http://{host}") as client:
        response = client.post(
            "/mcp",
            headers={"Accept": "application/json, text/event-stream"},
            json={"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}},
        )
    assert response.status_code == status
    if status == 200:
        assert len(response.json()["result"]["tools"]) == 7
