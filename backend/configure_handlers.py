"""Apply configured sign-in emails without reseeding claims or changing roles."""

from sqlalchemy import select, update

from backend import handler_emails
from backend.database import engine, handlers


def configure() -> int:
    """Update only the email of each explicitly configured existing handler."""
    with engine().begin() as db:
        ids = db.execute(select(handlers.c.handler_id)).scalars().all()
        emails = handler_emails.for_handlers(ids)
        for handler_id, email in emails.items():
            db.execute(
                update(handlers)
                .where(handlers.c.handler_id == handler_id)
                .values(email=email)
            )
    return len(emails)


def main() -> None:
    """Apply local sign-in mappings and report how many handlers were configured."""
    print(
        f"Configured {configure()} handler sign-in emails; roles and claims unchanged"
    )


if __name__ == "__main__":
    main()
