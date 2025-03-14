import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY environment variable not set")
    sys.exit(1)

# API endpoints
BOT_API_BASE_URL = "http://103.253.20.13:25050"
BOT_INIT_ENDPOINT = f"{BOT_API_BASE_URL}/robot-ai-lesson/api/v1/bot/initConversation"
BOT_WEBHOOK_ENDPOINT = f"{BOT_API_BASE_URL}/robot-ai-lesson/api/v1/bot/webhook"

# OpenAI settings
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_MAX_TOKENS = 100
OPENAI_TEMPERATURE = 0.7

# HTTP client settings
HTTP_TIMEOUT = 3600.0 