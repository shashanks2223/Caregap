import os
import json
import warnings
from typing import Dict, Any, List, Optional
from app.core.config import settings

warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.client_ready = False
        self._genai = None

    def _ensure_client(self):
        if not self.client_ready and self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai = genai
                self.client_ready = True
            except Exception as e:
                print(f"Warning: Gemini API initialization error: {e}")

    def assess_risk(
        self,
        category: str,
        employment_type: str,
        years_experience: float,
        monthly_salary: float,
        employment_duration_months: int,
        declared_risks: List[str],
        coverage_type: str
    ) -> Dict[str, Any]:
        """
        Assess caregiver income risk profile using Gemini API or heuristic fallback.
        Explicitly structured as prototype decision-support indicators.
        """
        self._ensure_client()
        if self.client_ready and self._genai:
            prompt = f"""
You are an underwriting assistant for an academic prototype insurtech platform called CareGap AI.
Evaluate the income continuity and financial stability risk for a professional caregiver:
- Caregiver Category: {category}
- Employment Type: {employment_type}
- Experience: {years_experience} years
- Monthly Salary: ₹{monthly_salary}
- Current Employment Tenure: {employment_duration_months} months
- Declared Occupational Risks: {", ".join(declared_risks) if declared_risks else "None"}
- Desired Coverage: {coverage_type}

Provide a structured JSON output with EXACTLY these keys:
{{
  "risk_category": "LOW" | "MODERATE" | "HIGH",
  "risk_score": <integer between 10 and 90>,
  "risk_factors": [<list of 2-4 key observable stability factors>],
  "recommendations": [<list of 2-3 recommendations>],
  "explanation": "<concise 2-sentence rationale>"
}}
Return ONLY valid JSON.
"""
            try:
                model = self._genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                data = json.loads(text.strip())
                data["assessed_by_ai"] = True
                data["is_prototype_indicator"] = True
                return data
            except Exception as e:
                print(f"Gemini API call failed, falling back to heuristic: {e}")

        # Heuristic Decision-Support Fallback
        score = 25
        factors = []
        recommendations = []

        if years_experience >= 3:
            factors.append(f"Strong industry track record with {years_experience} years experience.")
            score -= 5
        else:
            factors.append("Early career phase with under 3 years experience.")
            score += 10

        if employment_duration_months >= 12:
            factors.append(f"Stable continuous tenure of {employment_duration_months} months with current employer.")
            score -= 5
        else:
            factors.append("Current employment tenure is under 1 year.")
            score += 10

        if declared_risks:
            factors.append(f"Occupational exposure noted: {', '.join(declared_risks)}.")
            score += len(declared_risks) * 7

        if employment_type in ["Freelance/Independent", "Part-Time Multiple Homes"]:
            factors.append("Multi-home or independent arrangement carries variable monthly hour risk.")
            score += 12
            recommendations.append("Consider Option B Employment Continuity Protection to guard against household cancellation.")
        else:
            recommendations.append("Active agency affiliation provides base institutional employment consistency.")

        score = max(15, min(85, score))
        if score < 35:
            cat = "LOW"
        elif score < 65:
            cat = "MODERATE"
        else:
            cat = "HIGH"

        recommendations.append("Combined Option A & B protection provides comprehensive dual income safety net.")

        return {
            "risk_category": cat,
            "risk_score": score,
            "risk_factors": factors,
            "recommendations": recommendations,
            "explanation": f"Profile evaluated as {cat} risk ({score}/100) based on tenure and employment structure. This prototype indicator is for demonstration decision-support only.",
            "assessed_by_ai": False,
            "is_prototype_indicator": True
        }

    def analyze_claim(
        self,
        claim_type: str,
        claimed_salary: float,
        documents_uploaded: List[str],
        incident_or_term_reason: str,
        interruption_days: int
    ) -> Dict[str, Any]:
        """
        AI Claim Assistant: analyze document checklist, summarize info, and identify inconsistencies.
        """
        missing_docs = []
        if claim_type == "OPTION_A":
            required = ["Medical Incapacity Certificate", "Salary Proof or Bank Record"]
            for req in required:
                if not any(req.lower() in d.lower() for d in documents_uploaded):
                    missing_docs.append(req)
        else:
            required = ["Employment Termination Letter", "Last 3 Months Salary Proof"]
            for req in required:
                if not any(req.lower() in d.lower() for d in documents_uploaded):
                    missing_docs.append(req)

        inconsistencies = []
        consistency_score = 95
        if not documents_uploaded:
            inconsistencies.append("No verification documents attached to this claim filing.")
            consistency_score -= 30

        if claim_type == "OPTION_B" and "resigned" in incident_or_term_reason.lower():
            inconsistencies.append("Termination description contains 'resigned' which requires human scrutiny against voluntary job loss exclusion.")
            consistency_score -= 40

        admin_summary = (
            f"Caregiver filed {claim_type} for ₹{claimed_salary:,.0f} salary protection "
            f"({interruption_days} days interruption). Attached documents: {len(documents_uploaded)}. "
            f"Missing required documentation: {', '.join(missing_docs) if missing_docs else 'None'}. "
            f"Consistency score: {consistency_score}%."
        )

        return {
            "missing_documents": missing_docs,
            "consistency_score": consistency_score,
            "inconsistencies": inconsistencies,
            "admin_summary": admin_summary,
            "recommended_decision_support": "Ready for Human Review" if not missing_docs else "Request Additional Documentation"
        }

    def chat_response(
        self,
        message: str,
        user_context: Optional[Dict[str, Any]] = None,
        available_plans: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        CareGap AI Assistant Chatbot with context awareness and fallback.
        """
        self._ensure_client()
        user_context = user_context or {}
        user_role = user_context.get("role", "visitor")
        user_name = user_context.get("name", "Caregiver")
        active_policy = user_context.get("active_policy", "None")

        plans_text = ""
        if available_plans:
            plans_text = "\n".join([
                f"- {p.get('name')}: {p.get('plan_code')}, ₹{p.get('monthly_premium')}/mo, Covers: {p.get('coverage_option')}"
                for p in available_plans
            ])

        if self.client_ready and self._genai:
            system_instruction = f"""
You are "CareGap AI Assistant", an empathetic, highly knowledgeable insurtech support guide for CareGap AI.
You help professional caregivers and healthcare assistants understand income protection options.
Context:
- User Name: {user_name}
- User Role: {user_role}
- Active Policy: {active_policy}
- Available Plans:
{plans_text}

Rules:
1. Clearly explain Option A (Personal Illness / Injury), Option B (Involuntary Job Loss / Patient Continuity), and Placement Gap Protection (if a caregiver signed up but has not been provided with a job for 15 days, they receive 15 days of salary).
2. Never fabricate insurance terms; refer strictly to the platform's illustrative prototype plans (Basic ₹199, Plus ₹349, Premium ₹499).
3. If asked about claims, explain the step-by-step process: Submit -> Document Verification -> Review -> Decision.
4. Keep answers concise, helpful, and professional with bullet points where appropriate.
"""
            try:
                model = self._genai.GenerativeModel("gemini-1.5-flash", system_instruction=system_instruction)
                resp = model.generate_content(message)
                return {
                    "reply": resp.text.strip(),
                    "suggested_actions": ["View Protection Plans", "Estimate My Premium", "Track Claim Status"],
                    "referenced_plans": [p.get("name") for p in (available_plans or [])]
                }
            except Exception as e:
                print(f"Gemini Chatbot API error, using fallback: {e}")

        # Deterministic Knowledge Base Fallback
        msg_lower = message.lower()
        if "15 day" in msg_lower or "placement" in msg_lower or "not provided" in msg_lower or "no job" in msg_lower or "bench" in msg_lower:
            reply = (
                "**15-Day Job Placement Gap Protection:**\n\n"
                "If you have signed up and verified your profile but have **not been provided with a caregiving placement for 15 days**, you are entitled to **15 days of salary compensation** (half a month's wage replacement)!\n\n"
                "• **Eligibility**: Enrolled caregiver with no assigned job for 15+ consecutive days post-registration.\n"
                "• **Compensation**: `(Monthly Salary / 30) × 15 days` (e.g. ₹18,000 salary = ₹9,000 benefit).\n"
                "• **How to claim**: Open 'Submit Claim' and choose the '15-Day Placement Gap' claim form."
            )
            actions = ["Submit Placement Gap Claim", "Explore Plus Plan (A+B)"]
        elif "option a" in msg_lower or "illness" in msg_lower or "accident" in msg_lower or "injury" in msg_lower:
            reply = (
                "**Option A: Personal Income Protection** safeguards you against temporary income loss when you are "
                "medically unable to work due to covered illness or accidental injury.\n\n"
                "• **Coverage**: Up to 100% of your declared monthly salary (e.g. ₹18,000/mo)\n"
                "• **Max Duration**: Up to 60 days of income replacement\n"
                "• **Waiting Period**: 7 days illustrative waiting period\n"
                "• **Required Document**: Doctor's medical certificate and hospital discharge/prescription proof."
            )
            actions = ["Calculate Option A Premium", "Submit Medical Claim"]
        elif "option b" in msg_lower or "job loss" in msg_lower or "termination" in msg_lower or "layoff" in msg_lower or "continuity" in msg_lower:
            reply = (
                "**Option B: Employment Continuity Protection** assists caregivers when a family or agency involuntarily "
                "ends your contract (e.g., patient recovered, patient deceased, or family relocated).\n\n"
                "• **Coverage**: Monthly income replacement while you transition to a new caregiving position\n"
                "• **Eligibility**: Involuntary displacement after minimum 3 months qualifying service\n"
                "• **Waiting Period**: 14 days\n"
                "• **Required Document**: Termination confirmation or employer discharge record."
            )
            actions = ["Explore Plus Plan (A+B)", "Verify Employment Status"]
        elif "claim" in msg_lower:
            reply = (
                "**CareGap AI Claim Process** is designed to be fast and transparent:\n\n"
                "1. **Submission**: Choose Option A (Illness/Injury) or Option B (Job Loss) and upload your document.\n"
                "2. **AI Document Verification**: Our AI extracts dates, hospital details, and identifies missing records.\n"
                "3. **Employer/Agency Check**: For job loss claims, the agency quickly confirms the end-of-contract.\n"
                "4. **Approval & Disbursal**: Once reviewed, your income protection benefit is credited to your verified bank account."
            )
            actions = ["Submit a Claim", "Check Claim Status"]
        elif "price" in msg_lower or "premium" in msg_lower or "cost" in msg_lower or "plan" in msg_lower:
            reply = (
                "Here are our illustrative prototype protection plans:\n\n"
                "• **Basic Plan (₹199/month)**: Covers Option A (Personal Illness / Injury Protection)\n"
                "• **Plus Plan (₹349/month)**: Comprehensive Option A + Option B (Illness + Involuntary Job Loss)\n"
                "• **Premium Plan (₹499/month)**: Option A + Option B + Zero deductible & extended 90-day coverage\n\n"
                "You can also use our **AI Premium Recommendation Engine** to calculate personalized rates based on your experience and salary!"
            )
            actions = ["Estimate My Premium", "Compare Plans"]
        else:
            reply = (
                f"Hello {user_name}! I am your **CareGap AI Assistant**.\n\n"
                "I can assist you with:\n"
                "• Understanding **Option A** (Personal Illness/Injury) and **Option B** (Involuntary Job Loss)\n"
                "• Getting instant **illustrative premium estimates**\n"
                "• Navigating the **claim filing and tracking** process\n"
                "• Verifying your eligibility requirements\n\n"
                "How can I help protect your income today?"
            )
            actions = ["Explore Protection Plans", "Estimate My Premium", "How Claims Work"]

        return {
            "reply": reply,
            "suggested_actions": actions,
            "referenced_plans": ["Basic Plan", "Plus Plan", "Premium Plan"]
        }

gemini_service = GeminiService()
