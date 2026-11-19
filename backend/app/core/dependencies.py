from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.profile import CaregiverProfile, EmployerProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
        
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

def get_current_caregiver(
    current_user: User = Depends(require_roles(["caregiver"])),
    db: Session = Depends(get_db)
) -> CaregiverProfile:
    profile = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found. Please complete onboarding."
        )
    return profile

def get_current_employer(
    current_user: User = Depends(require_roles(["employer"])),
    db: Session = Depends(get_db)
) -> EmployerProfile:
    profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found. Please complete onboarding."
        )
    return profile

def get_current_admin(
    current_user: User = Depends(require_roles(["admin"]))
) -> User:
    return current_user
