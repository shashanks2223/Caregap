# CareGap AI – System Architecture Documentation

## 1. Executive Architecture Overview

CareGap AI is an academic prototype insurance technology (insurtech) platform designed to provide dual income protection for professional caregivers, elder assistants, and home health nurses in India.

The system addresses two specific financial vulnerabilities:
1. **Option A (Personal Medical Incapacity):** Replaces income lost due to temporary physical illness or accidental injury.
2. **Option B (Employment Continuity):** Replaces income when an attendant experiences involuntary contract discontinuation (e.g. patient recovery, relocation, or bereavement).

---

## 2. High-Level Component Topology

```
+-------------------------------------------------------------------------+
|                              USER CLIENTS                               |
|   Caregiver Portal       |   Agency / Employer    |   Underwriter Admin |
|   (React 18 + Vite)      |   (Staff Verification) |   (Adjudication)    |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTPS / JSON / Bearer JWT
                                    v
+-------------------------------------------------------------------------+
|                       FASTAPI APPLICATION SERVER                        |
|                                                                         |
|  +--------------------+  +----------------------+  +-----------------+  |
|  | Authentication &   |  | Insurance Engine     |  | Claim Workflow  |  |
|  | RBAC Guards        |  | Deterministic Quotes |  | Adjudication    |  |
|  +--------------------+  +----------------------+  +-----------------+  |
|                                                                         |
|  +--------------------+  +----------------------+  +-----------------+  |
|  | Gemini AI Engine   |  | Eligibility Rules    |  | In-App Alert    |  |
|  | Risk & Chatbot     |  | Exclusion Checks     |  | Notification    |  |
|  +--------------------+  +----------------------+  +-----------------+  |
+-------------------------------------------------------------------------+
                    |                                  |
                    v                                  v
+--------------------------------------+   +------------------------------+
|     POSTGRESQL / SQLITE DATABASE     |   |    SECURE ENCRYPTED STORAGE  |
| 15 Normalised Tables & Audit Logs    |   | Medical & Termination Proofs |
+--------------------------------------+   +------------------------------+
```

---

## 3. Layered Design Breakdown

### A. Presentation Layer (Frontend)
- **Framework:** React 18, Vite, TypeScript.
- **Styling System:** Tailwind CSS with Insurtech Design System (Deep Navy `#142B45`, Primary Teal `#14B8A6`, Neutral Card `#FFFFFF`).
- **Data Visualizations:** Recharts for protected income coverage trajectories, claim duration utilization, and platform underwriting trends.
- **State & Identity:** Centralized `AuthContext` with automatic Bearer token injection and route-level RBAC guards (`<ProtectedRoute allowedRoles={['...']}>`).

### B. Application & API Layer (Backend)
- **Framework:** FastAPI (Python 3.12+).
- **Security:** Standard bcrypt salted password hashing and HS256 JSON Web Tokens with embedded role claims and expiration timestamps.
- **Modular Routers:** Segmented endpoints across `/api/auth`, `/api/caregivers`, `/api/employers`, `/api/plans`, `/api/policies`, `/api/claims`, `/api/ai-assistant`, and `/api/admin`.
- **Audit Subsystem:** Integrated `log_audit()` mechanism logging user identity, IP address, action string, and structured entity metadata.

### C. Artificial Intelligence Subsystem
- **Provider:** Google Gemini 1.5 Flash API via `google-generativeai` with automated graceful heuristic fallback.
- **Underwriting Assistance:** Structured JSON output (`risk_category`, `risk_score`, `risk_factors`, `recommendations`, `explanation`).
- **Claim Assistant:** Automated document consistency auditing and missing record alerts.
- **Contextual Chatbot:** Database-informed Q&A engine that references active user policies and live plan parameters without hallucinating terms.

### D. Data Persistence Layer
- **ORM:** SQLAlchemy 2.0 with unified declarative mapping.
- **Dialect Compatibility:** Dual-mode architecture supporting PostgreSQL 16 (for Docker and cloud production) and SQLite 3 (for zero-config local execution).
- **Referential Integrity:** Enforced foreign keys with cascading deletions on caregiver/user dependencies and `SET NULL` on audit/reviewer linkages.

---

## 4. Security & Role-Based Access Architecture

```
Role          Accessible Resources & Scopes
-----------------------------------------------------------------------------
Caregiver     - Own profile, salary history, and bank verification (masked)
              - Active policies and simulated certificates
              - Claim submission (Option A & Option B) and status tracking
              - AI insurance assistant chatbot

Employer      - Staff directory for affiliated caregivers
              - Monthly payroll verification
              - Involuntary termination confirmation for Option B claims
              * STRICT PRIVACY: Zero access to personal medical certificates

Admin         - Platform KPI metrics & Recharts analytics
              - Claim adjudication (Approve, Reject with reasons, Request docs)
              - Dynamic insurance plan parameter configuration
              - AI risk assessment sign-off queue
              - System-wide immutable audit trail
```

