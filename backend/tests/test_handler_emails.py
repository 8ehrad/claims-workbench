"""Existing Auth accounts can be mapped without changing claims or permissions."""

import json

import pytest
from pydantic import ValidationError
from sqlalchemy import select

from backend import handler_emails
from backend.configure_handlers import configure
from backend.database import engine, handlers, seed
from backend.tests.claim_requests import decide, start
from backend.tests.rows import everything_recorded
from backend.tests.sign_in import DANA, OTHER_KEY, signed_in

EXISTING = "existing.senior@example.com"


def configured(monkeypatch, emails):
    monkeypatch.setenv(handler_emails.SETTING, json.dumps(emails))


def test_existing_account_signs_in_without_reseeding_or_changing_rights(
    client, monkeypatch
):
    start(client, "CLM-1002")
    decide(client, "CLM-1002", "approve", 1350)
    before = everything_recorded()
    configured(monkeypatch, {"HND-01": EXISTING})
    assert configure() == 1
    for handler in before["handlers"]:
        if handler["handler_id"] == "HND-01":
            handler["email"] = EXISTING
    assert everything_recorded() == before
    response = client.get("/api/me", headers=signed_in(EXISTING))
    assert response.status_code == 200
    assert response.json()["handler_id"] == "HND-01"
    assert response.json()["can_approve_over_limit"] is True
    assert client.get("/api/me", headers=signed_in(DANA)).status_code == 403
    assert (
        client.get("/api/me", headers=signed_in(EXISTING, key=OTHER_KEY)).status_code
        == 401
    )


def test_no_mapping_changes_nothing(client):
    before = everything_recorded()
    assert configure() == 0
    assert everything_recorded() == before


def test_seed_respects_configured_email(monkeypatch):
    configured(monkeypatch, {"HND-02": "existing.handler@example.com"})
    seed(engine())
    with engine().connect() as db:
        row = db.execute(select(handlers).where(handlers.c.handler_id == "HND-02"))
        handler = row.mappings().one()
    assert handler["email"] == "existing.handler@example.com"
    assert handler["can_approve_over_limit"] is False


def test_unknown_handler_is_refused_before_any_email_changes(client, monkeypatch):
    configured(monkeypatch, {"HND-01": EXISTING, "HND-99": "unknown@example.com"})
    with pytest.raises(ValueError, match="Unknown handler ids"):
        configure()
    assert client.get("/api/me", headers=signed_in(DANA)).status_code == 200
    assert client.get("/api/me", headers=signed_in(EXISTING)).status_code == 403


@pytest.mark.parametrize(
    "value", ["not json", '["senior@example.com"]', '{"HND-01":"bad"}']
)
def test_invalid_configuration_is_refused(client, monkeypatch, value):
    monkeypatch.setenv(handler_emails.SETTING, value)
    with pytest.raises(ValidationError):
        configure()
    assert client.get("/api/me", headers=signed_in(DANA)).status_code == 200
