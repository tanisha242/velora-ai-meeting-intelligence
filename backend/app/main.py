from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.db.database import Base, engine
from app.db.seed import seed_database

# Explicitly import all models so SQLAlchemy metadata registers all tables
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.meeting_participant import meeting_participants
from app.models.transcript import Transcript
from app.models.transcript_segment import TranscriptSegment
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem

from app.api.routes import api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("meetnote")

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        seed_database()
    except Exception as e:
        logger.error(f"Error initializing database on startup: {e}")

init_db()

app = FastAPI(
    title="MeetNote REST API",
    description="Fireflies-inspired Meeting Notes & Transcription Platform Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check server logs."}
    )

app.include_router(api_router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "MeetNote API", "environment": settings.ENVIRONMENT}
