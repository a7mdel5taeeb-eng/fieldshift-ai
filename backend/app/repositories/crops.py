from pathlib import Path

from app.schemas.domain import CropProfile


class CropNotFoundError(LookupError): pass
class CropRepository:
    def __init__(self, directory: Path | None = None) -> None: self.directory = directory or Path(__file__).parents[3] / "data/reference/crops"
    def list(self) -> list[CropProfile]: return [CropProfile.model_validate_json(path.read_text()) for path in self.directory.glob("*.json")]
    def get(self, crop_id: str) -> CropProfile:
        for crop in self.list():
            if crop.id == crop_id: return crop
        raise CropNotFoundError(crop_id)
