from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user
from app.core.audit import log_audit
from app.models.user import User
from app.models.profile import CaregiverProfile, EmployerProfile
from app.schemas.auth import UserRegister, UserLogin, Token, PasswordResetRequest, PasswordResetConfirm, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    role = user_data.role if user_data.role in ["caregiver", "employer", "admin"] else "caregiver"
    hashed_pw = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        role=role,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize empty profile based on role
    if role == "caregiver":
        cg = CaregiverProfile(
            user_id=new_user.id,
            full_name=user_data.email.split("@")[0].capitalize(),
            mobile_number="9800000000",
            city="Mumbai",
            state="Maharashtra",
            pin_code="400001",
            caregiver_category="Elderly Care",
            monthly_salary=18000.0,
            employment_type="Full-Time Agency"
        )
        db.add(cg)
    elif role == "employer":
        emp = EmployerProfile(
            user_id=new_user.id,
            organization_name=f"{user_data.email.split('@')[0].capitalize()} Care Agency",
            contact_person=user_data.email.split("@")[0].capitalize(),
            mobile_number="9800000000",
            address="12 Main Care Road",
            city="Mumbai",
            state="Maharashtra",
            pin_code="400001"
        )
        db.add(emp)
    db.commit()

    log_audit(db=db, action="USER_REGISTER", entity_type="user", entity_id=str(new_user.id), user_id=new_user.id)

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role, "email": new_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.role,
        "user_id": new_user.id,
        "email": new_user.email
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently inactive. Contact administration."
        )

    log_audit(db=db, action="USER_LOGIN", entity_type="user", entity_id=str(user.id), user_id=user.id)

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    # Return generic success for security
    return {
        "message": "If this email is registered in our prototype directory, a secure reset token has been simulated.",
        "demo_reset_token": "CG-RESET-TOKEN-DEMO-2026"
    }

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    log_audit(db=db, action="PASSWORD_RESET", entity_type="user", entity_id=str(user.id), user_id=user.id)
    return {"message": "Password successfully updated. You may now log in with your new credentials."}

