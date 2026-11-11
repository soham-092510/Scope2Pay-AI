from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.db.models.models import Transcript, User
from app.schemas.schemas import TranscriptCreate, TranscriptResponse
from app.middleware.auth import get_current_user
from app.services.documents.unified_parser import parse_document

router = APIRouter(prefix="/transcripts", tags=["Transcripts"])


@router.get("", response_model=List[TranscriptResponse])
def list_transcripts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transcripts = db.query(Transcript).filter(Transcript.user_id == current_user.id).order_by(Transcript.created_at.desc()).all()
    return [TranscriptResponse.model_validate(t) for t in transcripts]


@router.post("", response_model=TranscriptResponse)
def create_transcript_text(
    req: TranscriptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transcript = Transcript(
        user_id=current_user.id,
        project_id=req.project_id,
        filename=req.filename,
        file_type="text/plain",
        content=req.content,
        raw_size=len(req.content.encode("utf-8"))
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return TranscriptResponse.model_validate(transcript)


@router.post("/upload", response_model=TranscriptResponse)
async def upload_transcript_file(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    if len(file_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds maximum 15MB limit")

    content, mime = parse_document(file.filename or "uploaded_file.txt", file_bytes)
    
    transcript = Transcript(
        user_id=current_user.id,
        project_id=project_id,
        filename=file.filename or "uploaded_transcript.txt",
        file_type=mime,
        content=content,
        raw_size=len(file_bytes)
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return TranscriptResponse.model_validate(transcript)


@router.get("/{id}", response_model=TranscriptResponse)
def get_transcript(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transcript = db.query(Transcript).filter(Transcript.id == id, Transcript.user_id == current_user.id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return TranscriptResponse.model_validate(transcript)


@router.delete("/{id}")
def delete_transcript(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transcript = db.query(Transcript).filter(Transcript.id == id, Transcript.user_id == current_user.id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    db.delete(transcript)
    db.commit()
    return {"message": "Transcript deleted"}
