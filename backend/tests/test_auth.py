import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.database import SessionLocal
from app.models.user import User
from app.models.profile import CaregiverProfile, EmployerProfile

def test_password_hashing():
    pw = "CareGap@2026!"
    hashed = get_password_hash(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_generation_and_decoding():
    token_data = {"sub": "123", "role": "caregiver", "email": "test@caregap.demo"}
    token = create_access_token(token_data)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "123"
    assert decoded["role"] == "caregiver"

def test_demo_accounts_seeded():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@caregap.demo").first()
        employer = db.query(User).filter(User.email == "employer@caregap.demo").first()
        caregiver = db.query(User).filter(User.email == "caregiver@caregap.demo").first()

        assert admin is not None
        assert admin.role == "admin"
        assert verify_password("CareGap@2026!", admin.hashed_password) is True

        assert employer is not None
        assert employer.role == "employer"
        assert employer.employer_profile is not None

        assert caregiver is not None
        assert caregiver.role == "caregiver"
        assert caregiver.caregiver_profile is not None
        assert caregiver.caregiver_profile.monthly_salary > 0
    finally:
        db.close()

def test_caregiver_profile_attributes():
    db = SessionLocal()
    try:
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.full_name == "Pooja Sharma").first()
        assert cg is not None
        assert cg.caregiver_category in ["Elderly Care", "Home Nurse", "Patient Care Assistant", "Specialized Care"]
        assert cg.bank_verification_status == "verified"
        assert cg.bank_account_last4 is not None
    finally:
        db.close()
