import os
from google import genai
from google.genai import types
from pydantic import BaseModel
from app.schemas import UserProfile, GeneratedPathSchema, ChatRequest, ChatMessage

# We expect GEMINI_API_KEY to be set in the environment
client = genai.Client()

async def generate_learning_path(profile: UserProfile) -> GeneratedPathSchema:
    prompt = f"""
    Create a personalized learning path for a user with the following profile:
    - Interests: {', '.join(profile.interests)}
    - Experience Level: {profile.experience_level}
    - Career Aspirations: {profile.career_aspirations}
    - Learning Goals: {profile.learning_goals}
    
    The learning path should include a title, a description, and a list of milestones.
    CRITICAL: Keep the roadmap concise! Provide exactly 3 to 5 high-impact milestones to ensure quick processing.
    Each milestone should have a title, a description, and a clear 'ai_explanation' explaining why it was recommended for this specific user.
    """
    
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash-8b',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeneratedPathSchema,
        ),
    )
    
    # response.parsed will contain the pydantic object if using structured output, 
    # but google-genai structured output with pydantic schemas requires passing the schema.
    # In google-genai 0.2.1, it parses automatically if we provide response_schema as a Pydantic model.
    return response.parsed

async def extract_profile_from_conversation(chat_history: list[ChatMessage]) -> UserProfile:
    prompt = "Extract the user profile from the following conversation history.\n"
    for msg in chat_history:
        prompt += f"{msg.role}: {msg.content}\n"
    
    prompt += """
    Based on the above, create a UserProfile.
    - interests: list of topics they want to learn
    - experience_level: 'beginner', 'intermediate', or 'advanced' (infer from context)
    - career_aspirations: what job or role do they want?
    - learning_goals: what specific outcome are they looking for?
    - completed_courses: any courses or subjects they mentioned already completing
    - preferred_learning_format: e.g., 'video', 'text', 'interactive', 'project-based'
    - preferred_difficulty: e.g., 'easy', 'medium', 'hard', 'challenging'
    - available_hours_per_week: integer representing hours they can dedicate
    - target_completion_date: date string if they mentioned a deadline (e.g. 'YYYY-MM-DD')
    - preferred_study_schedule: e.g., 'weekends', 'evenings', 'mornings'
    - learning_preferences: list of preferences (e.g., 'visual', 'hands-on')
    - constraints: list of constraints (e.g., 'no paid courses', 'limited internet')
    """
    
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash-8b',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=UserProfile,
        ),
    )
    return response.parsed


async def chat_with_assistant(request: ChatRequest) -> str:
    # A simple chat interface. In a real app we'd keep conversation history.
    context_str = str(request.context) if request.context else "No specific context."
    prompt = f"""
    You are an AI Learning Assistant. You are helping a user with their personalized learning path.
    Context: {context_str}
    
    User message: {request.message}
    """
    
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash-8b',
        contents=prompt
    )
    return response.text
