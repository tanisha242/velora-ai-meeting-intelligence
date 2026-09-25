from fastapi import APIRouter
from app.api.routes.meetings import router as meetings_router
from app.api.routes.transcripts import router as transcripts_router
from app.api.routes.action_items import router as action_items_router
from app.api.routes.summaries import router as summaries_router
from app.api.routes.search import router as search_router

api_router = APIRouter(prefix="/api")
api_router.include_router(meetings_router)
api_router.include_router(transcripts_router)
api_router.include_router(action_items_router)
api_router.include_router(summaries_router)
api_router.include_router(search_router)
