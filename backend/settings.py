from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Centralized settings management for Synapse backend.
    
    This class automatically loads environment variables from the .env file
    and provides type validation and error handling for missing required variables.
    """
    
    # OpenAI Proxy Configuration (Required)
    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str
    
    # Integration Tokens (Optional - some features may not work without them)
    SLACK_BOT_TOKEN: Optional[str] = None
    GITHUB_TOKEN: Optional[str] = None
    
    # Application Configuration
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Configuration
    CHROMA_DB_PATH: str = "./chroma_db"
    
    # This tells Pydantic to load from a .env file
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True
    )

# Create a single, global instance of the settings
# This will be imported throughout the application
settings = Settings()