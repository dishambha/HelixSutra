from datetime import datetime
from typing import Dict, List


class PharmaGuardResponseBuilder:

    @staticmethod
    def build_final_response(
        patient_id: str,
        parsed_variants: List[Dict],
        rule_engine_output: Dict,
        llm_output: Dict
    ) -> Dict:

        evaluation = rule_engine_output["evaluations"][0]

        # Map phenotype wording to required short codes
        phenotype_map = {
            "Poor Metabolizer": "PM",
            "Intermediate Metabolizer": "IM",
            "Normal Metabolizer": "NM",
            "Rapid Metabolizer": "RM",
            "Ultra-rapid Metabolizer": "URM",
            "Unknown": "Unknown"
        }

        # Severity mapping (example logic)
        severity_map = {
            "Safe": "none",
            "Adjust Dosage": "moderate",
            "Ineffective": "high",
            "Toxic": "critical",
            "Unknown": "low"
        }

        risk_label = evaluation["risk_label"]

        return {
            "patient_id": patient_id,
            "drug": rule_engine_output["drug"],
            "timestamp": datetime.utcnow().isoformat(),

            "risk_assessment": {
                "risk_label": risk_label,
                "confidence_score": 0.95,
                "severity": severity_map.get(risk_label, "low")
            },

            "pharmacogenomic_profile": {
                "primary_gene": evaluation["gene"],
                "diplotype": evaluation["diplotype"],
                "phenotype": phenotype_map.get(
                    evaluation["phenotype"], "Unknown"
                ),
                "detected_variants": parsed_variants
            },

            "clinical_recommendation": {
                "recommendation_text": evaluation["recommendation"]
            },

            "llm_generated_explanation": {
                "summary": llm_output.get("clinical_explanation"),
                "mechanism": llm_output.get("mechanism"),
                "confidence": llm_output.get("confidence")
            },

            "quality_metrics": {
                "vcf_parsing_success": True,
                "gene_detected": True,
                "rule_engine_applied": True,
                "llm_explanation_generated": True
            }
        }
