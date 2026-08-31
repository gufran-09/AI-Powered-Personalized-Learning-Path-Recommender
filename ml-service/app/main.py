from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import get_settings
from app.schemas import GeneratePathRequest, GeneratedPathSchema, ChatRequest, ChatResponse, ExtractProfileRequest, UserProfile
from app.llm_service import generate_learning_path, chat_with_assistant, extract_profile_from_conversation

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Learning Path Recommender",
    description="Generates personalized learning paths and provides an AI assistant.",
    version="2.0.0",
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-path", response_model=GeneratedPathSchema)
async def api_generate_path(req: GeneratePathRequest):
    try:
        path = await generate_learning_path(req.profile)
        return path
    except Exception as e:
        logger.error(f"Error generating path: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate learning path")

@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(req: ChatRequest):
    try:
        reply = await chat_with_assistant(req)
        return ChatResponse(reply=reply)
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to chat with assistant")

@app.post("/api/extract-profile", response_model=UserProfile)
async def api_extract_profile(req: ExtractProfileRequest):
    try:
        profile = await extract_profile_from_conversation(req.chat_history)
        return profile
    except Exception as e:
        logger.error(f"Error extracting profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract profile")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG, log_level=settings.LOG_LEVEL)
