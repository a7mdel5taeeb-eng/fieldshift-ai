from datetime import date

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.adapters.power import PowerAdapter, PowerAdapterError
from app.adapters.smap import SmapAdapter, SmapAdapterError, quality_warnings
from app.repositories.crops import CropNotFoundError, CropRepository
from app.schemas.domain import ClimateObservation, CropProfile, SoilMoistureObservation, SoilProfile


class HealthResponse(BaseModel):
    status: str


class MetaResponse(BaseModel):
    project_name: str
    version: str
    challenge_name: str


app = FastAPI(title="FieldShift AI", version="0.1.0")
power_adapter = PowerAdapter()
smap_adapter = SmapAdapter()
crop_repository = CropRepository()

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

class EnvironmentRequest(BaseModel):
    latitude: float
    longitude: float
    start_date: date
    end_date: date

class EnvironmentResponse(BaseModel):
    data: list[ClimateObservation]
    provenance: list[str]
    warnings: list[str]
    limitations: list[str]
    errors: list[str]


class SoilMoistureResponse(BaseModel):
    data: list[SoilMoistureObservation]
    provenance: list[str]
    warnings: list[str]
    limitations: list[str]
    errors: list[str]

@app.post("/api/v1/environment/context", response_model=EnvironmentResponse)
def environment_context(request: EnvironmentRequest) -> EnvironmentResponse:
    try:
        data = power_adapter.fetch(request.latitude, request.longitude, request.start_date, request.end_date)
        return EnvironmentResponse(data=data, provenance=["NASA POWER Daily API"], warnings=[], limitations=["NASA POWER values use source-native spatial resolution and are not field measurements"], errors=[])
    except PowerAdapterError as error:
        return EnvironmentResponse(data=[], provenance=[], warnings=[], limitations=[], errors=[str(error)])


@app.post("/api/v1/soil-moisture/context", response_model=SoilMoistureResponse)
def soil_moisture_context(request: EnvironmentRequest) -> SoilMoistureResponse:
    warnings = quality_warnings(request.start_date, request.end_date)
    try:
        data = smap_adapter.fetch(request.latitude, request.longitude, request.start_date, request.end_date)
        return SoilMoistureResponse(data=data, provenance=["NASA SMAP SPL4SMGP Version 8"], warnings=warnings, limitations=["9 km model/data-assimilation estimate; not a field measurement"], errors=[])
    except SmapAdapterError as error:
        return SoilMoistureResponse(data=[], provenance=["NASA SMAP SPL4SMGP Version 8"], warnings=warnings, limitations=["9 km model/data-assimilation estimate; not a field measurement"], errors=[str(error)])

@app.get("/api/v1/crops", response_model=list[CropProfile])
def list_crops() -> list[CropProfile]: return crop_repository.list()
@app.get("/api/v1/crops/{crop_id}", response_model=CropProfile)
def get_crop(crop_id: str) -> CropProfile:
    try:
        return crop_repository.get(crop_id)
    except CropNotFoundError as error:
        raise HTTPException(404, "CROP_NOT_SUPPORTED") from error
@app.post("/api/v1/soil/profile/validate", response_model=SoilProfile)
def validate_soil(profile: SoilProfile) -> SoilProfile: return profile
