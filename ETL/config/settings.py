from pathlib import Path
from pydantic_settings import BaseSettings 
from pydantic import Field

class Settings(BaseSettings):
    # --- conexión Mongo ---
    MONGO_URI: str
    DB_NAME: str = Field(default="database")
    COLL_RAW: str = Field(default="tests")
    COLL_CLEAN: str = Field(default="tests")

    # --- límites y rutas ---
    MAX_SIZE_MB: int = Field(default=50)
    BATCH_SIZE: int = Field(default=500)
    TEMP_DIR: Path = Path("/tmp/ingest")

    # --- validaciones ---
    REQUIRED_FIELDS: list[str] = [
        "test.tid", "test.pid", "test.date",
        "initial.spo", "final.meters"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
