from fastapi import APIRouter, Depends, HTTPException

from app.schemas.system import VirtualLabExecuteRequest, VirtualLabExecuteResponse
from app.services.virtual_lab_service import VirtualLabService
from app.api.deps import get_current_active_user
from app.models import User

router = APIRouter(prefix="/virtual-lab", tags=["Interactive Virtual Labs"])

@router.post("/execute", response_model=VirtualLabExecuteResponse)
def execute_lab_simulation(
    req: VirtualLabExecuteRequest,
    current_user: User = Depends(get_current_active_user)
):
    try:
        return VirtualLabService.execute_lab(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
