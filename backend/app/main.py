from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class MetaResponse(BaseModel):
    project_name: str
    version: str
    challenge_name: str


app = FastAPI(title="FieldShift AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/api/v1/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Return the service health for local development."""
    return HealthResponse(status="ok")


@app.get("/api/v1/meta", response_model=MetaResponse)
def meta() -> MetaResponse:
    """Return non-scientific project metadata."""
    return MetaResponse(
        project_name="FieldShift AI",
        version="0.1.0",
        challenge_name="Field Shift: Adapting Farms with NASA Data",
    )
