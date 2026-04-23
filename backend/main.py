import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configure logging first — Railway captures stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== HomeVal API starting up ===")

    # Validate critical env vars early — fail with clear message
    from app.config import settings
    missing = []
    if not settings.SUPABASE_URL:        missing.append("SUPABASE_URL")
    if not settings.SUPABASE_SERVICE_KEY: missing.append("SUPABASE_SERVICE_KEY")
    if not settings.SUPABASE_JWT_SECRET:  missing.append("SUPABASE_JWT_SECRET")
    if missing:
        logger.error("Missing required env vars: %s", ", ".join(missing))
        logger.error("Set these in Railway → your service → Variables")
        # Don't raise — let the app start anyway so /health responds
        # (useful for debugging via Railway logs)

    # Warm up ML model
    try:
        from app.services.ml_service import get_ml_service
        svc = get_ml_service()
        logger.info("ML model ready — model loaded: %s", svc.model is not None)
    except Exception as e:
        logger.warning("ML model warmup failed (heuristic fallback active): %s", e)

    logger.info("=== HomeVal API ready ===")
    yield
    logger.info("=== HomeVal API shutting down ===")


# Import settings AFTER logging is configured
from app.config import settings

app = FastAPI(
    title="HomeVal API",
    description="Egyptian Real Estate ML Valuation SaaS",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

from app.routers import auth, predict, analytics, chat, predictions, admin

app.include_router(auth.router,        prefix="/api/v1/auth",        tags=["Auth"])
app.include_router(predict.router,     prefix="/api/v1",             tags=["Predict"])
app.include_router(analytics.router,   prefix="/api/v1/analytics",   tags=["Analytics"])
app.include_router(chat.router,        prefix="/api/v1",             tags=["Chat"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])
app.include_router(admin.router,       prefix="/api/v1/admin",       tags=["Admin"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
