from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

DB_DIR  = Path("./data")
DB_FILE = DB_DIR / "filament.db"

DB_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
