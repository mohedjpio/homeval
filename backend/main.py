import logging, sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stdout)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== HomeVal v2 starting ===")
    try:
        from app.services.ml_service import get_ml_service
        svc = get_ml_service()
        logger.info("ML model ready — loaded: %s", svc.model is not None)
    except Exception as e:
        logger.warning("ML model: %s", e)
    logger.info("=== Ready ===")
    yield

from app.config import settings
from app.routers import auth, predict, analytics, chat, predictions

app = FastAPI(title="HomeVal API v2", version="2.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router,        prefix="/api/v1/auth",        tags=["Auth"])
app.include_router(predict.router,     prefix="/api/v1",             tags=["Predict"])
app.include_router(analytics.router,   prefix="/api/v1/analytics",   tags=["Analytics"])
app.include_router(chat.router,        prefix="/api/v1/chat",        tags=["Chat"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0", "auth": "custom-jwt"}
