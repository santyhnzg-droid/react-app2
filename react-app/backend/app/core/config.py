import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    APP_NAME = os.getenv("APP_NAME", "GameZone API")
    APP_ENV = os.getenv("APP_ENV", "development")

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "gamezone")

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

    STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY", "")
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_CURRENCY = os.getenv("STRIPE_CURRENCY", "cop").lower()

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
        return (
            f"mysql+pymysql://"
            f"{self.DB_USER}:"
            f"{self.DB_PASSWORD}@"
            f"{self.DB_HOST}:"
            f"{self.DB_PORT}/"
            f"{self.DB_NAME}"
            "?charset=utf8mb4"
        )


settings = Settings()
