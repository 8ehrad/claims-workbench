"""Explicit mappings from demo handlers to existing Supabase sign-in emails."""

import os
from collections.abc import Collection
from typing import Annotated

from pydantic import StringConstraints, TypeAdapter

SETTING = "CLAIMS_HANDLER_EMAILS"
Email = Annotated[
    str,
    StringConstraints(strip_whitespace=True, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"),
]
EMAILS = TypeAdapter(dict[str, Email])


def for_handlers(handler_ids: Collection[str]) -> dict[str, str]:
    """Read configured emails for known handlers, refusing unknown handler ids."""
    emails = EMAILS.validate_json(os.getenv(SETTING, "{}"))
    unknown = emails.keys() - set(handler_ids)
    if unknown:
        raise ValueError(
            f"Unknown handler ids in {SETTING}: {', '.join(sorted(unknown))}"
        )
    return emails
