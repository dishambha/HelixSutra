from pydantic import BaseModel, Field
from typing import List, Optional


# -----------------------------
# Risk Assessment
# -----------------------------
class RiskAssessment(BaseModel):
    risk_label: str = Field(..., description="Safe | Adjust Dosage | Toxic | Ineffective | Unknown")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    severity: str = Field(..., description="none | low | moderate | high | critical")


# -----------------------------
# Detected Variant Model
# -----------------------------
class DetectedVariant(BaseModel):
    primary_gene: str
    star_allele: Optional[str] = None
    rsid: Optional[str] = None
    chromosome: Optional[str] = None
    position: Optional[str] = None
    raw_info: Optional[str] = None


# -----------------------------
# Pharmacogenomic Profile
# -----------------------------
class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str = Field(..., description="PM | IM | NM | RM | URM | Unknown")
    detected_variants: List[DetectedVariant]


# -----------------------------
# Clinical Recommendation
# -----------------------------
class ClinicalRecommendation(BaseModel):
    recommendation_text: str


# -----------------------------
# LLM Generated Explanation
# -----------------------------
class LLMGeneratedExplanation(BaseModel):
    summary: str
    mechanism: str
    confidence: str


# -----------------------------
# Quality Metrics
# -----------------------------
class QualityMetrics(BaseModel):
    vcf_parsing_success: bool
    gene_detected: bool
    rule_engine_applied: bool
    llm_explanation_generated: bool


# -----------------------------
# Final PharmaGuard Response
# -----------------------------
class PharmaGuardResponse(BaseModel):
    patient_id: str
    drug: str
    timestamp: str

    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMGeneratedExplanation
    quality_metrics: QualityMetrics
