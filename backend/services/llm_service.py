import os
import json
from typing import Dict
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class PharmaGuardLLMService:
    """
    Generates clinical explanations using Groq LLM.
    IMPORTANT:
    - Rule engine determines medical logic.
    - LLM ONLY explains biological reasoning.
    - Safe JSON parsing with fallback handling.
    """

    def __init__(self):
        # Load environment variables at initialization
        load_dotenv()
        # Accept multiple key names to avoid deployment typos
        api_key_candidates = ["GROQ_API_KEY", "GROQ_KEY", "GROQAPI_KEY"]
        api_key = next((os.getenv(key) for key in api_key_candidates if os.getenv(key)), None)

        if not api_key:
            # Keep running with a graceful fallback when the key is missing
            self.client = None
            self.client_error = "GROQ API key missing. Set GROQ_API_KEY in the environment."
            return

        self.client_error = None
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )

    def generate_explanation(self, rule_engine_output: Dict) -> Dict:
        """
        Takes rule engine result and returns structured explanation JSON.
        """

        drug = rule_engine_output.get("drug")
        evaluations = rule_engine_output.get("evaluations", [])

        clinical_facts = json.dumps(evaluations, indent=2)

        # If the key is missing, return a safe fallback instead of throwing
        if not self.client:
            return {
                "drug": drug,
                "clinical_explanation": "LLM disabled: missing GROQ API key (set GROQ_API_KEY).",
                "mechanism": "LLM unavailable due to configuration.",
                "confidence": "Low",
                "error": self.client_error,
            }

        prompt = f"""
You are a clinical pharmacogenomics expert.

STRICT RULES:
- Do NOT modify risk labels.
- Do NOT modify recommendations.
- Do NOT invent new genes.
- Only explain the biological reasoning.
- Return VALID JSON only (no markdown, no extra text).

Drug: {drug}

Clinical Rule Engine Output:
{clinical_facts}

Return EXACT JSON format:

{{
  "drug": "{drug}",
  "clinical_explanation": "<clear but concise explanation>",
  "mechanism": "<biological mechanism explanation>",
  "confidence": "High"
}}
"""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Active Groq model
                temperature=0.2,
                messages=[
                    {"role": "system", "content": "You are an expert in pharmacogenomics."},
                    {"role": "user", "content": prompt}
                ],
            )

            content = response.choices[0].message.content.strip()

            # Remove markdown code blocks if model accidentally adds them
            if content.startswith("```"):
                content = content.replace("```json", "").replace("```", "").strip()

            try:
                return json.loads(content)

            except json.JSONDecodeError:
                # Fallback: Return explanation as raw text safely
                return {
                    "drug": drug,
                    "clinical_explanation": content,
                    "mechanism": "Unable to parse structured mechanism separately.",
                    "confidence": "Medium"
                }

        except Exception as e:
            # Full fail-safe for API errors
            return {
                "drug": drug,
                "clinical_explanation": "LLM generation failed.",
                "mechanism": "Error during explanation generation.",
                "confidence": "Low",
                "error": str(e)
            }
