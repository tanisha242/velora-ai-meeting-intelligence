from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.action_item import ActionItem

class ActionItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_meeting_id(self, meeting_id: str) -> List[ActionItem]:
        return self.db.query(ActionItem)\
            .filter(ActionItem.meeting_id == meeting_id)\
            .order_by(ActionItem.created_at.desc())\
            .all()

    def get_by_id(self, action_item_id: str) -> Optional[ActionItem]:
        return self.db.query(ActionItem).filter(ActionItem.id == action_item_id).first()

    def create(self, action_item: ActionItem) -> ActionItem:
        self.db.add(action_item)
        self.db.commit()
        self.db.refresh(action_item)
        return action_item

    def update(self, action_item: ActionItem) -> ActionItem:
        self.db.commit()
        self.db.refresh(action_item)
        return action_item

    def delete(self, action_item: ActionItem) -> None:
        self.db.delete(action_item)
        self.db.commit()
