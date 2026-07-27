from pydantic import BaseModel
from typing import List, Optional

class IntentRequest(BaseModel):
    text: str

class IntentResult(BaseModel):
    intent_code: str
    original_text: str
    severity: str
    category: str
    description: str
    confidence: float
    ai_contribution: Optional[float] = None
    rule_name: Optional[str] = None

class IntentRule(BaseModel):
    name: str
    intent_code: str
    severity: str
    category: str
    description: str
    patterns: List[str]
    weight: float = 1.0
