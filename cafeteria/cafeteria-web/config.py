import os

from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "cafeteria-secret-key")

    API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")