from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from ml.inference import run_detection
from ml.model_loader import get_model_status

router = APIRouter(prefix="/api", tags=["detection"])

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/tiff", "image/bmp"}


@router.get("/model-status")
def model_status():
    """Returns real loaded model metadata, shapes, and load state."""
    return get_model_status()


@router.post("/detect-spill")
async def detect_spill(file: UploadFile = File(...), coverage_area_km2: float = 100.0):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = await run_in_threadpool(run_detection, image_bytes, coverage_area_km2)
    except Exception as exc:  # noqa: BLE001 - surface model errors to the client for the demo
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc

    return result

