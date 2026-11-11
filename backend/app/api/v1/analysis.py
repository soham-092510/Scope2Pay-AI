import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.models import Transcript, AnalysisRun, Commitment, User
from app.schemas.schemas import AnalysisResponse, AnalysisResult, AnalysisReviewRequest
from app.middleware.auth import get_current_user
from app.services.ai.gemini_client import analyze_transcript_with_ai

router = APIRouter(prefix="/analysis", tags=["AI Analysis"])


@router.post("", response_model=AnalysisResponse)
async def run_analysis(
    transcript_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transcript = db.query(Transcript).filter(
        Transcript.id == transcript_id,
        Transcript.user_id == current_user.id
    ).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # Run AI Pipeline
    extraction: AnalysisResult = await analyze_transcript_with_ai(transcript.content)

    # Save AnalysisRun
    run = AnalysisRun(
        transcript_id=transcript.id,
        user_id=current_user.id,
        status="completed",
        result_json=extraction.model_dump_json(),
        confidence=extraction.overall_confidence
    )
    db.add(run)
    db.flush()

    # Save extracted commitments into relational table
    for deliv in extraction.deliverables:
        # Combine evidence quotes
        quote_text = " | ".join([e.quote for e in deliv.evidence]) if deliv.evidence else None
        speaker_text = deliv.evidence[0].speaker if deliv.evidence else None
        ts_text = deliv.evidence[0].timestamp if deliv.evidence else None
        
        c = Commitment(
            analysis_id=run.id,
            type="deliverable",
            title=deliv.title,
            description=deliv.description,
            deadline=deliv.deadline,
            amount=deliv.estimated_amount,
            currency=deliv.currency or "USD",
            evidence_quote=quote_text,
            speaker=speaker_text,
            timestamp=ts_text,
            confidence=deliv.confidence,
            requires_review=deliv.requires_review,
            status=deliv.status
        )
        db.add(c)

    db.commit()
    db.refresh(run)

    return AnalysisResponse(
        id=run.id,
        transcript_id=run.transcript_id,
        status=run.status,
        confidence=run.confidence,
        result=extraction,
        created_at=run.created_at
    )


@router.get("/{id}", response_model=AnalysisResponse)
def get_analysis(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    run = db.query(AnalysisRun).filter(
        AnalysisRun.id == id,
        AnalysisRun.user_id == current_user.id
    ).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis not found")

    result_dict = json.loads(run.result_json)
    return AnalysisResponse(
        id=run.id,
        transcript_id=run.transcript_id,
        status=run.status,
        confidence=run.confidence,
        result=AnalysisResult(**result_dict),
        created_at=run.created_at
    )


@router.post("/{id}/review", response_model=AnalysisResponse)
def review_analysis(
    id: str,
    req: AnalysisReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    run = db.query(AnalysisRun).filter(
        AnalysisRun.id == id,
        AnalysisRun.user_id == current_user.id
    ).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis not found")

    run.result_json = req.result.model_dump_json()
    run.confidence = req.result.overall_confidence
    db.commit()
    db.refresh(run)

    return AnalysisResponse(
        id=run.id,
        transcript_id=run.transcript_id,
        status=run.status,
        confidence=run.confidence,
        result=req.result,
        created_at=run.created_at
    )
