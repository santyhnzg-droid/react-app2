from sqlalchemy import create_engine, text

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)

from app.core.config import settings


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()


def ensure_email_columns():
    """Agrega columnas nuevas en instalaciones existentes sin migrador."""
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP NULL"))
        connection.execute(text("ALTER TABLE facturas ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP NULL"))


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
