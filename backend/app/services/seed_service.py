from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import CaregiverProfile, EmployerProfile
from app.models.employment import EmploymentRecord, SalaryRecord
from app.models.insurance import InsurancePlan, Policy, PolicyCoverage, RiskAssessment
from app.models.claim import Claim, ClaimDocument, ClaimReview
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.core.security import get_password_hash
from app.core.config import settings

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).count() > 0:
        return

    print("Seeding CareGap AI database with demonstration data...")
    now = datetime.now(timezone.utc)
    demo_hashed_pw = get_password_hash(settings.DEMO_PASSWORD)

    # 1. CREATE CORE DEMO USERS
    admin_user = User(
        email="admin@caregap.demo",
        hashed_password=demo_hashed_pw,
        role="admin",
        is_active=True,
        is_verified=True,
        created_at=now - timedelta(days=90)
    )
    db.add(admin_user)

    employer_user = User(
        email="employer@caregap.demo",
        hashed_password=demo_hashed_pw,
        role="employer",
        is_active=True,
        is_verified=True,
        created_at=now - timedelta(days=90)
    )
    db.add(employer_user)

    caregiver_user = User(
        email="caregiver@caregap.demo",
        hashed_password=demo_hashed_pw,
        role="caregiver",
        is_active=True,
        is_verified=True,
        created_at=now - timedelta(days=60)
    )
    db.add(caregiver_user)
    db.commit()

    # 2. CREATE 3 ILLUSTRATIVE INSURANCE PLANS
    basic_plan = InsurancePlan(
        plan_code="BASIC",
        name="Basic Care Shield",
        description="Option A personal medical illness and accidental injury income protection.",
        coverage_option="OPTION_A",
        monthly_premium=199.0,
        base_option_a_premium=199.0,
        option_b_premium=0.0,
        additional_benefits_premium=0.0,
        max_option_a_duration_days=60,
        max_option_b_duration_days=0,
        option_a_waiting_period_days=7,
        option_b_waiting_period_days=0,
        min_qualifying_employment_months=1,
        coverage_limit_multiplier=1.0,
        exclusions=[
            "Pre-existing illnesses declared within initial 30 days",
            "Non-accidental cosmetic treatments",
            "Self-inflicted injuries"
        ],
        eligibility_conditions=[
            "Active full-time or part-time caregiving employment",
            "Certified medical incapacity by a registered physician",
            "Minimum 7-day waiting period satisfaction"
        ],
        is_active=True
    )
    db.add(basic_plan)

    plus_plan = InsurancePlan(
        plan_code="PLUS",
        name="CareGap Plus Dual Shield",
        description="Comprehensive Option A (Illness/Injury) + Option B (Involuntary Employment Loss) protection.",
        coverage_option="COMBINED",
        monthly_premium=349.0,
        base_option_a_premium=199.0,
        option_b_premium=150.0,
        additional_benefits_premium=0.0,
        max_option_a_duration_days=60,
        max_option_b_duration_days=60,
        option_a_waiting_period_days=7,
        option_b_waiting_period_days=14,
        min_qualifying_employment_months=3,
        coverage_limit_multiplier=1.0,
        exclusions=[
            "Voluntary resignation without qualifying cause",
            "Disciplinary termination due to proven caregiver misconduct",
            "Pre-existing illnesses without prior coverage"
        ],
        eligibility_conditions=[
            "Continuous 3 months caregiving work history",
            "Involuntary termination confirmation by employer/household",
            "Documented medical inability or employer cessation"
        ],
        is_active=True
    )
    db.add(plus_plan)

    premium_plan = InsurancePlan(
        plan_code="PREMIUM",
        name="CareGap Elite Comprehensive",
        description="Dual Option A + Option B coverage with extended 90-day benefit window and zero deductible.",
        coverage_option="COMBINED_PREMIUM",
        monthly_premium=499.0,
        base_option_a_premium=199.0,
        option_b_premium=150.0,
        additional_benefits_premium=150.0,
        max_option_a_duration_days=90,
        max_option_b_duration_days=90,
        option_a_waiting_period_days=3,
        option_b_waiting_period_days=7,
        min_qualifying_employment_months=2,
        coverage_limit_multiplier=1.2,
        exclusions=[
            "Fraudulent claim submissions",
            "Voluntary job abandonment"
        ],
        eligibility_conditions=[
            "Minimum 2 months verified employment",
            "Expedited 3-day waiting period",
            "Access to priority teleconsultation assistance"
        ],
        is_active=True
    )
    db.add(premium_plan)
    db.commit()

    # 3. CREATE EMPLOYER PROFILES (4 Agencies)
    employer_orgs_data = [
        ("CareBridge Senior Living & Homecare", "Care Agency", "Vikram Malhotra", "9820123456", "CB-MUM-2022", "12 Nariman Point", "Mumbai", "Maharashtra", "400021"),
        ("GoldenYears Eldercare Services", "Care Agency", "Anjali Deshmukh", "9845098765", "GY-BLR-2021", "44 Koramangala 4th Block", "Bengaluru", "Karnataka", "560034"),
        ("Sunrise Home Health Solutions", "Hospital / Clinic", "Dr. Rajeshwar Rao", "9988776655", "SH-HYD-2019", "8 Banjara Hills Road No 2", "Hyderabad", "Telangana", "500034"),
        ("Gracefield Care Associates", "Placement Service", "Sunita Nair", "9811223344", "GF-DEL-2020", "105 Connaught Place", "New Delhi", "Delhi", "110001")
    ]

    employer_profiles = []
    # Demo primary employer profile
    demo_emp_prof = EmployerProfile(
        user_id=employer_user.id,
        organization_name=employer_orgs_data[0][0],
        organization_type=employer_orgs_data[0][1],
        contact_person=employer_orgs_data[0][2],
        mobile_number=employer_orgs_data[0][3],
        registration_number=employer_orgs_data[0][4],
        address=employer_orgs_data[0][5],
        city=employer_orgs_data[0][6],
        state=employer_orgs_data[0][7],
        pin_code=employer_orgs_data[0][8],
        is_verified=True,
        created_at=now - timedelta(days=90)
    )
    db.add(demo_emp_prof)
    employer_profiles.append(demo_emp_prof)

    for i in range(1, len(employer_orgs_data)):
        e_data = employer_orgs_data[i]
        u = User(
            email=f"agency{i}@caregap.demo",
            hashed_password=demo_hashed_pw,
            role="employer",
            is_active=True,
            is_verified=True,
            created_at=now - timedelta(days=80 - i * 10)
        )
        db.add(u)
        db.flush()
        ep = EmployerProfile(
            user_id=u.id,
            organization_name=e_data[0],
            organization_type=e_data[1],
            contact_person=e_data[2],
            mobile_number=e_data[3],
            registration_number=e_data[4],
            address=e_data[5],
            city=e_data[6],
            state=e_data[7],
            pin_code=e_data[8],
            is_verified=True,
            created_at=now - timedelta(days=80 - i * 10)
        )
        db.add(ep)
        employer_profiles.append(ep)
    db.commit()

    # 4. CREATE 15 CAREGIVERS & PROFILES
    caregivers_raw = [
        ("Pooja Sharma", "9821112233", "1994-05-12", "Mumbai", "Maharashtra", "400050", "Elderly Care", 4.5, 20000.0, "Full-Time Agency", "CareBridge Senior Living & Homecare", "HDFC Bank", "4921", "HDFC0001234"),
        ("Suresh Kumar", "9822223344", "1991-08-23", "Bengaluru", "Karnataka", "560001", "Patient Care Assistant", 3.0, 18000.0, "Direct Family Contract", "GoldenYears Eldercare Services", "State Bank of India", "8821", "SBIN0004321"),
        ("Mary D'souza", "9823334455", "1988-11-04", "Mumbai", "Maharashtra", "400016", "Home Nurse", 7.0, 26000.0, "Full-Time Agency", "CareBridge Senior Living & Homecare", "ICICI Bank", "1290", "ICIC0000567"),
        ("Amit Verma", "9824445566", "1996-02-18", "New Delhi", "Delhi", "110025", "Specialized Care", 2.0, 19000.0, "Full-Time Agency", "Gracefield Care Associates", "Axis Bank", "7712", "UTIB0000890"),
        ("Kavita Patel", "9825556677", "1993-09-30", "Pune", "Maharashtra", "411001", "Elderly Care", 5.0, 21000.0, "Part-Time Multiple Homes", "Sunrise Home Health Solutions", "Bank of Baroda", "3411", "BARB0001122"),
        ("Rajesh Goud", "9826667788", "1990-07-15", "Hyderabad", "Telangana", "500001", "Patient Care Assistant", 6.0, 22000.0, "Full-Time Agency", "Sunrise Home Health Solutions", "Canara Bank", "9012", "CNRB0002233"),
        ("Fatima Sheikh", "9827778899", "1995-12-01", "Mumbai", "Maharashtra", "400088", "Home Nurse", 3.5, 24000.0, "Direct Family Contract", "CareBridge Senior Living & Homecare", "Kotak Mahindra Bank", "6623", "KKBK0003344"),
        ("Manish Tiwari", "9828889900", "1992-04-10", "New Delhi", "Delhi", "110012", "Elderly Care", 4.0, 18500.0, "Full-Time Agency", "Gracefield Care Associates", "Punjab National Bank", "5119", "PUNB0004455"),
        ("Deepa Nair", "9829990011", "1989-03-25", "Bengaluru", "Karnataka", "560076", "Specialized Care", 8.0, 28000.0, "Full-Time Agency", "GoldenYears Eldercare Services", "State Bank of India", "3098", "SBIN0005566"),
        ("Arun Pillai", "9830001122", "1997-10-14", "Chennai", "Tamil Nadu", "600004", "Patient Care Assistant", 1.5, 16000.0, "Freelance/Independent", "Direct Family", "Indian Overseas Bank", "4412", "IOBA0006677"),
        ("Geeta Rani", "9831112233", "1991-01-20", "Gurugram", "Haryana", "122001", "Elderly Care", 5.5, 22500.0, "Full-Time Agency", "Gracefield Care Associates", "HDFC Bank", "8721", "HDFC0007788"),
        ("Pradeep Yadav", "9832223344", "1994-06-05", "Pune", "Maharashtra", "411038", "Home Nurse", 4.0, 23000.0, "Full-Time Agency", "Sunrise Home Health Solutions", "Union Bank of India", "1923", "UBIN0008899"),
        ("Sunita Jadhav", "9833334455", "1993-08-19", "Mumbai", "Maharashtra", "400071", "Patient Care Assistant", 3.0, 17500.0, "Part-Time Multiple Homes", "CareBridge Senior Living & Homecare", "Bank of India", "9934", "BKID0009900"),
        ("Ramesh Sen", "9834445566", "1987-12-11", "Kolkata", "West Bengal", "700001", "Elderly Care", 9.0, 25000.0, "Full-Time Agency", "Gracefield Care Associates", "UCO Bank", "6201", "UCBA0001111"),
        ("Lakshmi Reddy", "9835556677", "1995-04-03", "Hyderabad", "Telangana", "500028", "Specialized Care", 2.5, 20500.0, "Full-Time Agency", "Sunrise Home Health Solutions", "Andhra Bank", "7319", "ANDB0002222")
    ]

    caregiver_profiles = []

    # Caregiver 0 is our primary demo user
    demo_cg = CaregiverProfile(
        user_id=caregiver_user.id,
        full_name=caregivers_raw[0][0],
        mobile_number=caregivers_raw[0][1],
        date_of_birth=caregivers_raw[0][2],
        city=caregivers_raw[0][3],
        state=caregivers_raw[0][4],
        pin_code=caregivers_raw[0][5],
        caregiver_category=caregivers_raw[0][6],
        years_experience=caregivers_raw[0][7],
        monthly_salary=caregivers_raw[0][8],
        employment_type=caregivers_raw[0][9],
        employer_name=caregivers_raw[0][10],
        employment_start_date="2023-01-15",
        bank_verification_status="verified",
        bank_name=caregivers_raw[0][11],
        bank_account_last4=caregivers_raw[0][12],
        ifsc_code=caregivers_raw[0][13],
        verification_documents=[{"type": "Aadhaar", "status": "verified"}, {"type": "Bank Passbook", "status": "verified"}],
        created_at=now - timedelta(days=60)
    )
    db.add(demo_cg)
    caregiver_profiles.append(demo_cg)

    for i in range(1, len(caregivers_raw)):
        c_raw = caregivers_raw[i]
        u = User(
            email=f"caregiver{i}@caregap.demo",
            hashed_password=demo_hashed_pw,
            role="caregiver",
            is_active=True,
            is_verified=True,
            created_at=now - timedelta(days=60 - i * 2)
        )
        db.add(u)
        db.flush()
        
        cg = CaregiverProfile(
            user_id=u.id,
            full_name=c_raw[0],
            mobile_number=c_raw[1],
            date_of_birth=c_raw[2],
            city=c_raw[3],
            state=c_raw[4],
            pin_code=c_raw[5],
            caregiver_category=c_raw[6],
            years_experience=c_raw[7],
            monthly_salary=c_raw[8],
            employment_type=c_raw[9],
            employer_name=c_raw[10],
            employment_start_date="2023-06-01",
            bank_verification_status="verified" if i % 4 != 0 else "pending",
            bank_name=c_raw[11],
            bank_account_last4=c_raw[12],
            ifsc_code=c_raw[13],
            verification_documents=[{"type": "Govt ID", "status": "verified"}],
            created_at=now - timedelta(days=60 - i * 2)
        )
        db.add(cg)
        caregiver_profiles.append(cg)
    db.commit()

    # 5. CREATE EMPLOYMENT & SALARY RECORDS
    for idx, cp in enumerate(caregiver_profiles):
        emp_agency = employer_profiles[idx % len(employer_profiles)]
        is_term = idx in [3, 8]  # Caregivers 3 & 8 have terminated records for Option B testing
        
        emp_rec = EmploymentRecord(
            caregiver_id=cp.id,
            employer_id=emp_agency.id,
            employer_name=emp_agency.organization_name,
            role_title=f"{cp.caregiver_category} Specialist",
            start_date="2023-01-15",
            end_date="2026-09-30" if is_term else None,
            is_current=not is_term,
            status="terminated" if is_term else "active",
            termination_date="2026-09-30" if is_term else None,
            termination_reason="Patient recovered / household care contract discontinued" if is_term else None,
            employer_verified=True,
            created_at=now - timedelta(days=50)
        )
        db.add(emp_rec)
        db.flush()

        # Add 3 recent salary slips for each caregiver
        for m in [8, 9, 10]:
            sal_rec = SalaryRecord(
                caregiver_id=cp.id,
                employment_record_id=emp_rec.id,
                month=m,
                year=2026,
                declared_salary=cp.monthly_salary,
                verified_salary=cp.monthly_salary,
                is_verified=True,
                verified_by_employer_id=emp_agency.id,
                created_at=now - timedelta(days=(11 - m) * 30)
            )
            db.add(sal_rec)
    db.commit()

    # 6. CREATE ACTIVE PROTOTYPE POLICIES
    plans = [plus_plan, basic_plan, premium_plan]
    policies = []
    
    for idx, cp in enumerate(caregiver_profiles):
        selected_plan = plans[idx % len(plans)]
        pol_num = f"CG-POL-2026-{idx+1:04d}"
        
        pol = Policy(
            policy_number=pol_num,
            caregiver_id=cp.id,
            plan_id=selected_plan.id,
            coverage_type=selected_plan.coverage_option,
            status="active",
            start_date=now - timedelta(days=45),
            renewal_date=now + timedelta(days=320),
            waiting_period_ends_at=now - timedelta(days=38),
            monthly_premium=selected_plan.monthly_premium,
            max_monthly_benefit=cp.monthly_salary,
            declared_monthly_salary=cp.monthly_salary,
            terms_accepted=True,
            created_at=now - timedelta(days=45)
        )
        db.add(pol)
        db.flush()
        policies.append(pol)

        # Coverages
        if selected_plan.coverage_option in ["OPTION_A", "COMBINED", "COMBINED_PREMIUM"]:
            cov_a = PolicyCoverage(
                policy_id=pol.id,
                coverage_type="OPTION_A",
                benefit_percentage=100.0,
                max_duration_days=selected_plan.max_option_a_duration_days,
                current_utilized_days=0,
                coverage_amount=cp.monthly_salary,
                terms={"waiting_period_days": selected_plan.option_a_waiting_period_days}
            )
            db.add(cov_a)
            
        if selected_plan.coverage_option in ["COMBINED", "COMBINED_PREMIUM"]:
            cov_b = PolicyCoverage(
                policy_id=pol.id,
                coverage_type="OPTION_B",
                benefit_percentage=100.0,
                max_duration_days=selected_plan.max_option_b_duration_days,
                current_utilized_days=0,
                coverage_amount=cp.monthly_salary,
                terms={"waiting_period_days": selected_plan.option_b_waiting_period_days}
            )
            db.add(cov_b)

        # AI Risk Assessment Record
        score = 20 + (idx * 3) % 40
        ra = RiskAssessment(
            caregiver_id=cp.id,
            policy_id=pol.id,
            risk_category="LOW" if score < 35 else "MODERATE",
            risk_score=score,
            risk_factors=[
                f"{cp.years_experience} years verifiable caregiver service history",
                "Continuous agency-affiliated employment stability",
                "Regular monthly bank deposit records verified"
            ],
            recommendations=[
                "Maintain active dual-shield protection for comprehensive medical and job loss cover.",
                "Ensure timely quarterly salary slip updates to protect benefit levels."
            ],
            explanation=f"Evaluated as {'LOW' if score < 35 else 'MODERATE'} risk ({score}/100) based on steady employment history. Demonstrative prototype decision indicator.",
            assessed_by_ai=True,
            human_reviewed=True if idx < 5 else False,
            created_at=now - timedelta(days=44)
        )
        db.add(ra)
    db.commit()

    # 7. CREATE 10+ SAMPLE CLAIMS ACROSS DIFFERENT WORKFLOW STATUSES
    claim_scenarios = [
        # (caregiver_idx, policy_idx, type, status, duration, desc, reason, fraud)
        (0, 0, "OPTION_A", "UNDER_REVIEW", 21, "Caregiver suffered wrist fracture during patient mobility assistance.", None, False),
        (1, 1, "OPTION_A", "APPROVED", 14, "Severe viral fever and typhoid requiring complete bed rest.", None, False),
        (2, 2, "OPTION_A", "COMPLETED", 30, "Lower back lumbar disc strain during patient lifting.", None, False),
        (3, 3, "OPTION_B", "EMPLOYMENT_VERIFICATION", 30, None, "Patient family relocated abroad; care services concluded involuntarily.", False),
        (4, 4, "OPTION_A", "SUBMITTED", 10, "Post-surgical recovery following emergency appendectomy.", None, False),
        (5, 5, "OPTION_B", "UNDER_REVIEW", 30, None, "Elderly patient recovered fully and no longer needs full-time home assistant.", False),
        (6, 6, "OPTION_A", "DOCUMENT_VERIFICATION", 18, "Accidental slip injury during transit between patient households.", None, False),
        (7, 7, "OPTION_B", "APPROVED", 30, None, "Care agency downsizing territorial coverage in North Delhi.", False),
        (8, 8, "OPTION_B", "REJECTED", 30, None, "Voluntary resignation without qualifying cause.", False),
        (9, 9, "OPTION_A", "UNDER_REVIEW", 45, "Severe knee ligament tear requiring immobilization.", None, True), # Fraud flag demonstration
        (10, 10, "OPTION_B", "COMPLETED", 30, None, "Patient deceased; service contract involuntarily closed.", False)
    ]

    for c_idx, (cg_i, pol_i, c_type, c_status, dur, desc, t_reason, is_fraud) in enumerate(claim_scenarios):
        cg = caregiver_profiles[cg_i]
        pol = policies[pol_i]
        c_num = f"CG-CLM-2026-{c_idx+1:04d}"
        
        daily = cg.monthly_salary / 30.0
        calc_amt = round(daily * dur, 2)

        claim = Claim(
            claim_number=c_num,
            policy_id=pol.id,
            caregiver_id=cg.id,
            claim_type=c_type,
            incident_date="2026-10-05" if c_type == "OPTION_A" else None,
            incident_description=desc,
            interruption_start_date="2026-10-06" if c_type == "OPTION_A" else None,
            expected_recovery_date="2026-10-27" if c_type == "OPTION_A" else None,
            termination_date="2026-09-30" if c_type == "OPTION_B" else None,
            termination_reason=t_reason,
            employer_id=employer_profiles[cg_i % len(employer_profiles)].id,
            employer_name=employer_profiles[cg_i % len(employer_profiles)].organization_name,
            last_working_date="2026-09-30" if c_type == "OPTION_B" else "2026-10-05",
            previous_monthly_salary=cg.monthly_salary,
            claimed_salary=cg.monthly_salary,
            calculated_benefit_amount=calc_amt,
            approved_benefit_amount=calc_amt if c_status in ["APPROVED", "COMPLETED"] else None,
            benefit_duration_days=dur,
            status=c_status,
            employer_verified=True if c_status in ["UNDER_REVIEW", "APPROVED", "COMPLETED"] else False,
            admin_notes="Demonstration claim verified against prototype benefit rules." if c_status == "APPROVED" else None,
            rejection_reason="Exclusion triggered: Voluntary job resignation does not qualify under Option B continuity rules." if c_status == "REJECTED" else None,
            fraud_flag=is_fraud,
            fraud_reasons=["Claimed duration exceeds normal statistical recovery profile for reported minor diagnosis."] if is_fraud else [],
            ai_summary=f"Automated check complete. Type: {c_type}, Calculated Benefit: ₹{calc_amt:,.0f}.",
            decision_date=now - timedelta(days=2) if c_status in ["APPROVED", "REJECTED", "COMPLETED"] else None,
            created_at=now - timedelta(days=20 - c_idx)
        )
        db.add(claim)
        db.flush()

        # Add claim documents
        if c_type == "OPTION_A":
            doc = ClaimDocument(
                claim_id=claim.id,
                document_type="medical_certificate",
                file_name="Medical_Certificate_Disability_Proof.pdf",
                file_path="/uploads/sample_medical_certificate.pdf",
                file_size=245000,
                mime_type="application/pdf",
                extracted_data={"doctor_name": "Dr. S. Nair, MD", "diagnosis": desc[:30], "duration_days": dur},
                ai_validation_status="valid",
                ai_validation_notes="Document verified: Registered medical stamp and diagnosis timeline consistent."
            )
            db.add(doc)
        else:
            doc = ClaimDocument(
                claim_id=claim.id,
                document_type="termination_letter",
                file_name="Employment_Discontinuation_Notice.pdf",
                file_path="/uploads/sample_termination_notice.pdf",
                file_size=180000,
                mime_type="application/pdf",
                extracted_data={"notice_date": "2026-09-30", "reason": t_reason or "Care conclusion"},
                ai_validation_status="valid",
                ai_validation_notes="Termination reason validated against household record."
            )
            db.add(doc)

        # Add sample review
        if c_status in ["APPROVED", "REJECTED", "COMPLETED"]:
            rev = ClaimReview(
                claim_id=claim.id,
                reviewer_id=admin_user.id,
                review_type="admin_review",
                status=c_status,
                comments=f"Claim reviewed and {c_status.lower()} in demo environment.",
                flags=[]
            )
            db.add(rev)

    # 8. CREATE SAMPLE NOTIFICATIONS FOR USERS
    notifs = [
        (caregiver_user.id, "Welcome to CareGap AI", "Your caregiver account is active. Explore Option A and Option B income safety nets.", "system"),
        (caregiver_user.id, "Policy Active: CareGap Plus Dual Shield", "Your policy CG-POL-2026-0001 is now active. You are protected up to ₹20,000/month.", "policy"),
        (caregiver_user.id, "Claim Under Review", "Claim CG-CLM-2026-0001 is undergoing final adjuster review.", "claim"),
        (employer_user.id, "Employment Verification Request", "Caregiver Suresh Kumar filed an income protection record requiring agency confirmation.", "verification"),
        (admin_user.id, "Fraud Alert Flagged", "Claim CG-CLM-2026-0010 flagged for statistical duration anomaly.", "system")
    ]
    for uid, title, msg, ntype in notifs:
        n = Notification(
            user_id=uid,
            title=title,
            message=msg,
            notification_type=ntype,
            is_read=False,
            created_at=now - timedelta(days=2)
        )
        db.add(n)

    # 9. INITIAL AUDIT LOGS
    db.add(AuditLog(
        user_id=admin_user.id,
        action="DATABASE_SEEDED",
        entity_type="system",
        entity_id="init",
        details={"caregivers_count": 15, "employers_count": 4, "claims_count": 11}
    ))

    db.commit()
    print("Database seeding completed successfully with 15 caregivers, 4 agencies, 3 plans, and 11 claims!")

