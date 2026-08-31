from pydantic import BaseModel, Field
from typing import List, Optional

class UserProfile(BaseModel):
    interests: List[str] = Field(default_factory=list)
    experience_level: str = "beginner"
    career_aspirations: str = ""
    learning_goals: str = ""
    completed_courses: List[str] = Field(default_factory=list)
    preferred_learning_format: str = ""
    preferred_difficulty: str = ""
    available_hours_per_week: int = 0
    target_completion_date: Optional[str] = None
    preferred_study_schedule: str = ""
    learning_preferences: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)

class GeneratePathRequest(BaseModel):
    user_id: str
    profile: UserProfile
    
class ChatMessage(BaseModel):
    role: str
    content: str

class ExtractProfileRequest(BaseModel):
    chat_history: List[ChatMessage]

class MilestoneSchema(BaseModel):
    title: str
    description: str
    ai_explanation: str
    
class GeneratedPathSchema(BaseModel):
    title: str
    description: str
    milestones: List[MilestoneSchema]

class ChatRequest(BaseModel):
    user_id: str
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str
