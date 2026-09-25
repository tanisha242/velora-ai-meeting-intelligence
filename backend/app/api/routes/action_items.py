from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.action_item_service import ActionItemService
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate, ActionItemStatusPatch, ActionItemResponse
from app.schemas.common import ResponseEnvelope

router = APIRouter(tags=["Action Items"])

@router.get("/meetings/{meeting_id}/action-items", response_model=ResponseEnvelope[List[ActionItemResponse]])
def get_meeting_action_items(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    service = ActionItemService(db)
    items = service.list_action_items(meeting_id)
    return ResponseEnvelope(data=items, message="Action items retrieved successfully")

@router.post("/meetings/{meeting_id}/action-items", response_model=ResponseEnvelope[ActionItemResponse], status_code=status.HTTP_201_CREATED)
def create_action_item(
    meeting_id: str,
    payload: ActionItemCreate,
    db: Session = Depends(get_db)
):
    service = ActionItemService(db)
    item = service.create_action_item(meeting_id, payload)
    return ResponseEnvelope(data=item, message="Action item created successfully")

@router.put("/action-items/{id}", response_model=ResponseEnvelope[ActionItemResponse])
def update_action_item(
    id: str,
    payload: ActionItemUpdate,
    db: Session = Depends(get_db)
):
    service = ActionItemService(db)
    item = service.update_action_item(id, payload)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
    return ResponseEnvelope(data=item, message="Action item updated successfully")

@router.patch("/action-items/{id}/status", response_model=ResponseEnvelope[ActionItemResponse])
def update_action_item_status(
    id: str,
    payload: ActionItemStatusPatch,
    db: Session = Depends(get_db)
):
    service = ActionItemService(db)
    item = service.update_status(id, payload.status)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
    return ResponseEnvelope(data=item, message="Action item status updated successfully")

@router.delete("/action-items/{id}", response_model=ResponseEnvelope[dict])
def delete_action_item(
    id: str,
    db: Session = Depends(get_db)
):
    service = ActionItemService(db)
    success = service.delete_action_item(id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
    return ResponseEnvelope(data={"id": id}, message="Action item deleted successfully")
