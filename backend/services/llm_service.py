import os
import json
from typing import Dict
from openai import OpenAI


class PharmaGuardLLMService:
    """
    Generates clinical explanations using Groq LLM.
    IMPORTANT:
    - Rule engine determines medical logic.
    - LLM ONLY explains biological reasoning.
    - Safe JSON parsing with fallback handling.
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable not set.")

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
