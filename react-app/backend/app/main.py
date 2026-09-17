from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.database import SessionLocal
from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.sales import router as sales_router
from app.routers.services import router as services_router
from app.routers.users import router as users_router
from app.routers.payments import router as payments_router
from app.seed import seed_initial_data

import app.models


BASE_DIR = Path(__file__).resolve().parents[1]
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_initial_data()
    print("[GAMEZONE] Base de datos inicializada.")
    yield


app = FastAPI(
    title="GameZone API",
    description=(
        "API REST del proyecto GameZone desarrollada con FastAPI."
    ),
    version="4.0.0",
    lifespan=lifespan,
)


allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/", tags=["Sistema"])
def home():
    return {
        "ok": True,
        "message": "API GameZone FastAPI funcionando",
    }


@app.get("/api/test-db", tags=["Sistema"])
def test_database():
    db = SessionLocal()

    try:
        database = db.execute(
            text("SELECT DATABASE()")
        ).scalar()

        return {
            "ok": True,
            "database": database,
        }

    finally:
        db.close()
