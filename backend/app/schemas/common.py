from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

DataT = TypeVar("DataT")

class ResponseEnvelope(BaseModel, Generic[DataT]):
    data: DataT
    message: str = "Operation completed successfully"

class ErrorResponse(BaseModel):
    detail: str
