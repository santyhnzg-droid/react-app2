import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Settings:
    APP_NAME = os.getenv("APP_NAME", "GameZone API")
    APP_ENV = os.getenv("APP_ENV", "development")

    DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

    JWT_SECRET = os.getenv(
        "JWT_SECRET",
        "change-this-secret",
    )
    JWT_ALGORITHM = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )
    JWT_EXPIRE_MINUTES = int(
        os.getenv("JWT_EXPIRE_MINUTES", "480")
    )

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", FRONTEND_URL)
    BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "").strip().rstrip("/")

    STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY", "")
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_CURRENCY = os.getenv("STRIPE_CURRENCY", "cop").lower()

    SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "").strip()
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER).strip()
    SMTP_TLS = os.getenv("SMTP_TLS", "true").lower() in {"1", "true", "yes"}

    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    INITIAL_ADMIN_EMAIL = os.getenv(
        "INITIAL_ADMIN_EMAIL",
        "admin@gamezone.com",
    )
    INITIAL_ADMIN_PASSWORD = os.getenv(
        "INITIAL_ADMIN_PASSWORD",
        "AdminGameZone123",
    )
    INITIAL_ADMIN_DOCUMENT = os.getenv(
        "INITIAL_ADMIN_DOCUMENT",
        "1000000000",
    )

    @property
    def database_url(self):
        if not self.DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL no está configurada. "
                "Define una URL PostgreSQL en backend/.env."
            )
        return self.DATABASE_URL

    def validate_for_production(self):
        """Fail fast when a production process still has local defaults."""
        if self.APP_ENV.lower() not in {"production", "prod"}:
            return

        if self.JWT_SECRET in {"change-this-secret", "CAMBIA_ESTA_CLAVE_EN_TU_ENV_REAL"} or len(self.JWT_SECRET) < 32:
            raise RuntimeError("JWT_SECRET debe ser una clave aleatoria de al menos 32 caracteres en producción.")
        if not self.FRONTEND_URL.startswith("https://") or "localhost" in self.FRONTEND_URL or "127.0.0.1" in self.FRONTEND_URL:
            raise RuntimeError("FRONTEND_URL debe apuntar al dominio público del frontend en producción.")
        if not self.CORS_ORIGINS.strip():
            raise RuntimeError("CORS_ORIGINS debe incluir el dominio público del frontend.")
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if "*" in origins or any(not origin.startswith("https://") for origin in origins):
            raise RuntimeError("CORS_ORIGINS solo puede contener orígenes HTTPS explícitos en producción.")
        if not self.BACKEND_PUBLIC_URL.startswith("http"):
            raise RuntimeError("BACKEND_PUBLIC_URL debe apuntar al dominio público del backend en producción.")
        if not self.BACKEND_PUBLIC_URL.startswith("https://"):
            raise RuntimeError("BACKEND_PUBLIC_URL debe usar HTTPS en producción.")
        if self.INITIAL_ADMIN_PASSWORD in {"AdminGameZone123", "", "CAMBIA_ESTA_CLAVE_EN_TU_ENV_REAL"} or len(self.INITIAL_ADMIN_PASSWORD) < 12:
            raise RuntimeError("INITIAL_ADMIN_PASSWORD debe cambiarse por una contraseña fuerte en producción.")
        if not self.DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg://")):
            raise RuntimeError("DATABASE_URL debe apuntar a PostgreSQL en producción.")
        if not self.STRIPE_SECRET_KEY.startswith("sk_") or "..." in self.STRIPE_SECRET_KEY:
            raise RuntimeError("STRIPE_SECRET_KEY no está configurada correctamente en producción.")
        if not self.STRIPE_WEBHOOK_SECRET.startswith("whsec_") or "..." in self.STRIPE_WEBHOOK_SECRET:
            raise RuntimeError("STRIPE_WEBHOOK_SECRET no está configurada correctamente en producción.")


settings = Settings()
