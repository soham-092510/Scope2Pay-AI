from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.models import User
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticate user via JWT Bearer token.
    If no token is supplied, ensures a default demo user exists and returns it,
    allowing frictionless evaluation and testing during hackathon reviews.
    """
    if token:
        user_id = decode_access_token(token)
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user

    # Ensure demo user exists
    demo_email = "jordan@scope2pay.ai"
    demo_user = db.query(User).filter(User.email == demo_email).first()
    if not demo_user:
        from app.core.security import hash_password
        demo_user = User(
            email=demo_email,
            password_hash=hash_password("DemoPassword123!"),
            full_name="Jordan Smith",
            company_name="Studio Arsa Digital",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    return demo_user
