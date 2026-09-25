from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.action_item_repository import ActionItemRepository
from app.models.action_item import ActionItem
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate

class ActionItemService:
    def __init__(self, db: Session):
        self.repo = ActionItemRepository(db)

    def list_action_items(self, meeting_id: str) -> List[ActionItem]:
        return self.repo.get_by_meeting_id(meeting_id)

    def create_action_item(self, meeting_id: str, payload: ActionItemCreate) -> ActionItem:
        action_item = ActionItem(
            meeting_id=meeting_id,
            title=payload.title,
            description=payload.description,
            assignee=payload.assignee,
            due_date=payload.due_date,
            status=payload.status or "pending"
        )
        return self.repo.create(action_item)

    def update_action_item(self, action_item_id: str, payload: ActionItemUpdate) -> Optional[ActionItem]:
        action_item = self.repo.get_by_id(action_item_id)
        if not action_item:
            return None

        if payload.title is not None:
            action_item.title = payload.title
        if payload.description is not None:
            action_item.description = payload.description
        if payload.assignee is not None:
            action_item.assignee = payload.assignee
        if payload.due_date is not None:
            action_item.due_date = payload.due_date
        if payload.status is not None:
            action_item.status = payload.status

        return self.repo.update(action_item)

    def update_status(self, action_item_id: str, status: str) -> Optional[ActionItem]:
        action_item = self.repo.get_by_id(action_item_id)
        if not action_item:
            return None
        action_item.status = status
        return self.repo.update(action_item)

    def delete_action_item(self, action_item_id: str) -> bool:
        action_item = self.repo.get_by_id(action_item_id)
        if not action_item:
            return False
        self.repo.delete(action_item)
        return True
