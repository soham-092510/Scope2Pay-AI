from fastapi import APIRouter, Depends
from app.core.config import settings
from app.schemas.schemas import SettingsStatusResponse, SettingsUpdateRequest
from app.middleware.auth import get_current_user
from app.db.models.models import User

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SettingsStatusResponse)
def get_settings_status(current_user: User = Depends(get_current_user)):
    client_id_preview = None
    if settings.PAYPAL_CLIENT_ID:
        client_id_preview = f"{settings.PAYPAL_CLIENT_ID[:6]}...{settings.PAYPAL_CLIENT_ID[-4:]}"

    return SettingsStatusResponse(
        gemini_configured=bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10),
        gemini_model=settings.GEMINI_MODEL,
        paypal_mode=settings.PAYPAL_MODE,
        paypal_configured=bool(settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET),
        paypal_client_id_preview=client_id_preview
    )


@router.post("", response_model=SettingsStatusResponse)
def update_settings(
    req: SettingsUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    if req.gemini_api_key is not None:
        settings.GEMINI_API_KEY = req.gemini_api_key.strip()
    if req.paypal_client_id is not None:
        settings.PAYPAL_CLIENT_ID = req.paypal_client_id.strip()
    if req.paypal_client_secret is not None:
        settings.PAYPAL_CLIENT_SECRET = req.paypal_client_secret.strip()
    if req.paypal_mode is not None:
        settings.PAYPAL_MODE = req.paypal_mode.strip()

    client_id_preview = None
    if settings.PAYPAL_CLIENT_ID:
        client_id_preview = f"{settings.PAYPAL_CLIENT_ID[:6]}...{settings.PAYPAL_CLIENT_ID[-4:]}"

    return SettingsStatusResponse(
        gemini_configured=bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10),
        gemini_model=settings.GEMINI_MODEL,
        paypal_mode=settings.PAYPAL_MODE,
        paypal_configured=bool(settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET),
        paypal_client_id_preview=client_id_preview
    )
