from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine, ensure_email_columns
from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.sales import router as sales_router
from app.routers.services import router as services_router
from app.routers.users import router as users_router
from app.routers.payments import router as payments_router
from app.routers.reports import router as reports_router
from app.routers.invoices import router as invoices_router
from app.routers.dashboard import router as dashboard_router
from app.routers.pqr import router as pqr_router
from app.routers.chatbot import router as chatbot_router
from app.seed import seed_initial_data

import app.models


BASE_DIR = Path(__file__).resolve().parents[1]
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.validate_for_production()
    # Primero garantiza las tablas y columnas nuevas; el seed consulta User.
    # Si se ejecutara antes, una instalación existente fallaría al arrancar.
    Base.metadata.create_all(bind=engine)
    ensure_email_columns()
    seed_initial_data()
    print("[GAMEZONE] Base de datos inicializada.")
    yield


is_production = settings.APP_ENV.lower() in {"production", "prod"}

app = FastAPI(
    title="GameZone API",
    description=(
        "API REST del proyecto GameZone desarrollada con FastAPI."
    ),
    version="4.0.0",
    lifespan=lifespan,
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)


allowed_origins = [
    origin.strip().rstrip("/")
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads",
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(services_router)
app.include_router(sales_router)
app.include_router(payments_router)
app.include_router(reports_router)
app.include_router(invoices_router)
app.include_router(dashboard_router)
app.include_router(pqr_router)
app.include_router(chatbot_router)


@app.get("/", tags=["Sistema"])
def home():
    return {
        "ok": True,
        "message": "API GameZone FastAPI funcionando",
    }


@app.get("/health", tags=["Sistema"])
def health():
    """Health check para el proveedor de despliegue y balanceadores."""
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"ok": True, "service": "gamezone-api", "database": "ok"}
    except Exception:
        return JSONResponse(status_code=503, content={"ok": False, "service": "gamezone-api"})
    finally:
        db.close()


@app.get("/api/test-db", tags=["Sistema"])
def test_database():
    if is_production:
        raise HTTPException(status_code=404, detail="Not found")
    db = SessionLocal()

    try:
        database = db.execute(
            text("SELECT current_database()")
        ).scalar()

        return {"ok": True, "database": database}

    finally:
        db.close()
