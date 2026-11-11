from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models.models import Client, User
from app.schemas.schemas import ClientCreate, ClientResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("", response_model=List[ClientResponse])
def list_clients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clients = db.query(Client).filter(Client.user_id == current_user.id).order_by(Client.created_at.desc()).all()
    return [ClientResponse.model_validate(c) for c in clients]


@router.post("", response_model=ClientResponse)
def create_client(req: ClientCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client = Client(
        user_id=current_user.id,
        name=req.name,
        email=req.email,
        company=req.company,
        address=req.address,
        phone=req.phone,
        currency=req.currency or "USD"
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return ClientResponse.model_validate(client)


@router.get("/{id}", response_model=ClientResponse)
def get_client(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return ClientResponse.model_validate(client)


@router.delete("/{id}")
def delete_client(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return {"message": "Client deleted"}
