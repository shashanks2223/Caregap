# CareGap AI – REST API Documentation

Base URL: `/api`  
Interactive OpenAPI Documentation: `http://localhost:8000/docs`  
Alternative ReDoc: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account with default role profile initialization.
- **Request Body:**
  ```json
  {
    "email": "user@caregap.demo",
    "password": "Password123!",
    "role": "caregiver" // "caregiver" | "employer" | "admin"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "role": "caregiver",
    "user_id": 1,
    "email": "user@caregap.demo"
  }
  ```

### `POST /api/auth/login`
Authenticates existing credentials and returns a signed JWT.
- **Request Body:**
  ```json
  {
    "email": "caregiver@caregap.demo",
    "password": "CareGap@2026!"
  }
  ```

### `GET /api/auth/me`
Retrieves authenticated user identity and role. Requires Bearer Token.

---

## 2. Caregiver Endpoints (`/api/caregivers`)

### `GET /api/caregivers/profile`
Retrieves the logged-in caregiver's profile.

### `PUT /api/caregivers/profile`
Updates demographic, contact, and category details.
- **Request Body:**
  ```json
  {
    "full_name": "Pooja Sharma",
    "mobile_number": "9820123456",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pin_code": "400050",
    "caregiver_category": "Elderly Care",
    "years_experience": 4.5,
    "monthly_salary": 20000.0,
    "employment_type": "Full-Time Agency"
  }
  ```

### `POST /api/caregivers/verify-bank`
Simulates instant bank account verification (never stores netbanking credentials).
- **Parameters:** `bank_name`, `bank_account_last4`, `ifsc_code`.

---

## 3. Insurance Plans & Pricing (`/api/plans`, `/api/premiums`)

### `GET /api/plans`
Lists all active insurance plans (Basic, Plus, Elite).

### `PUT /api/plans/{plan_id}` (Admin only)
Configures dynamic plan prices, durations, and waiting periods.

### `POST /api/premiums/calculate`
Calculates transparent deterministic premium quotes.
- **Request Body:**
  ```json
  {
    "monthly_salary": 20000,
    "caregiver_category": "Elderly Care",
    "employment_type": "Full-Time Agency",
    "years_experience": 3.5,
    "coverage_type": "COMBINED",
    "declared_risks": ["Night Shift Patient Care"]
  }
  ```
- **Response:**
  ```json
  {
    "monthly_salary": 20000,
    "coverage_type": "COMBINED",
    "base_premium": 349.0,
    "tenure_discount": 17.45,
    "final_monthly_premium": 349.0,
    "max_monthly_benefit": 20000.0,
    "is_prototype": true
  }
  ```

---

## 4. Policy Management (`/api/policies`)

### `GET /api/policies`
Returns policies associated with the authenticated caregiver.

### `POST /api/policies/purchase`
Activates an illustrative prototype policy.
- **Request Body:**
  ```json
  {
    "plan_id": 2,
    "coverage_type": "COMBINED",
    "terms_accepted": true
  }
  ```

### `GET /api/policies/{policy_id}/download-summary`
Generates a downloadable policy certificate summary with academic disclaimer.

---

## 5. Claims Management (`/api/claims`, `/api/claim-documents`)

### `POST /api/claims/submit-option-a`
Filing an illness or accidental injury income replacement claim.
- **Fields:** `policy_id`, `incident_date`, `incident_description`, `interruption_start_date`, `expected_recovery_date`, `claimed_salary`.

### `POST /api/claims/submit-option-b`
Filing an involuntary job loss continuity claim.
- **Fields:** `policy_id`, `termination_date`, `termination_reason`, `employer_name`, `last_working_date`, `claimed_salary`.

### `POST /api/claim-documents/upload/{claim_id}`
Uploads supporting medical certificate or termination notice (multipart/form-data).

### `POST /api/claims/evaluate-eligibility/{claim_id}`
Executes deterministic automated eligibility checks against policy parameters.

### `PUT /api/claims/{claim_id}/status` (Admin only)
Updates adjudication status (`UNDER_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`).

---

## 6. AI Assistant (`/api/ai-assistant`, `/api/risk-assessment`)

### `POST /api/risk-assessment/evaluate`
Generates structured underwriting decision-support indicators using Google Gemini.

### `POST /api/ai-assistant/chat`
Contextual conversational Q&A referencing user policies and database plans.

