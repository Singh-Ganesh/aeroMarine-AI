from fastapi import APIRouter

from seed_data import incidents, oil_spill_incident

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("")
def list_incidents():
    return incidents


@router.get("/oil-spill")
def get_oil_spill_incident():
    return oil_spill_incident
