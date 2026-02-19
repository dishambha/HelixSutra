const RISK_LABEL_MAP = {
    safe: 'safe',
    ineffective: 'adjust',
    'adjust dosage': 'adjust',
    toxic: 'toxic',
    'high risk': 'toxic',
    adverse: 'toxic',
    'poor metabolizer': 'adjust',
    'ultra-rapid': 'toxic',
    'normal metabolizer': 'safe',
};

function getRiskKey(label = '') {
    const lower = label.toLowerCase();
    for (const [key, val] of Object.entries(RISK_LABEL_MAP)) {
        if (lower.includes(key)) return val;
    }
    return null;
}

function Badge({ severity }) {
    const map = {
        high: 'bg-[#28276D]/10 text-[#28276D]',
        medium: 'bg-[#1DB4C4]/15 text-[#28276D]',
        low: 'bg-[#1DB4C4]/10 text-[#28276D]',
    };
    return (
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${map[severity] ?? map.medium}`}>
            {severity}
        </span>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-[#28276d14] last:border-0">
            <span className="text-xs text-[#28276D]/70 font-medium">{label}</span>
            <span className="text-sm font-semibold text-[#28276D]">{value ?? '—'}</span>
        </div>
    );
}

export function getActiveRisk(data) {
    if (!data) return null;
    const label = data?.risk_assessment?.risk_label ?? '';
    return getRiskKey(label);
}

export default function ClinicalSummary({ data, error }) {
    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-[#28276d1a] shadow-sm overflow-hidden">
                <div className="border-b border-[#28276d14] px-6 py-4 bg-[#1DB4C4]/10 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#28276D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-bold text-[#28276D]">Analysis Error</h3>
                </div>
                <div className="p-6">
                    <p className="text-[#28276D] text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-2xl border border-[#28276d1a] shadow-sm overflow-hidden">
                <div className="border-b border-[#28276d14] px-6 py-4 bg-[#1DB4C4]/10 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#28276D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-bold text-[#28276D]">Clinical Summary</h3>
                </div>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-[#1DB4C4]/10 rounded w-3/4" />
                        <div className="h-4 bg-[#1DB4C4]/10 rounded w-full" />
                        <div className="h-4 bg-[#1DB4C4]/10 rounded w-5/6" />
                        <div className="pt-4 border-t border-[#28276d14]">
                            <p className="text-[#28276D]/60 text-sm italic">
                                Complete the patient configuration on the left to populate the clinical findings, phenotype correlations, and dosing recommendations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { risk_assessment, pharmacogenomic_profile, clinical_recommendation, llm_generated_explanation, patient_id } = data;

    return (
        <div className="bg-white rounded-2xl border border-[#28276d1a] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-[#28276d14] px-6 py-4 bg-[#1DB4C4]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#28276D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-bold text-[#28276D]">Clinical Summary</h3>
                </div>
                <Badge severity={risk_assessment?.severity} />
            </div>

            <div className="p-6 space-y-6">
                {/* Risk Assessment */}
                <div>
                    <p className="text-xs font-bold text-[#28276D]/60 uppercase tracking-widest mb-3">Risk Assessment</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#1DB4C4]/10 border border-[#28276d14]">
                            <p className="text-xs text-[#28276D]/60 mb-1">Risk Label</p>
                            <p className="text-lg font-extrabold text-[#28276D]">{risk_assessment?.risk_label ?? '—'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#1DB4C4]/10 border border-[#28276d14]">
                            <p className="text-xs text-[#28276D]/60 mb-1">Confidence Score</p>
                            <div className="flex items-end gap-2">
                                <p className="text-lg font-extrabold text-[#28276D]">
                                    {risk_assessment?.confidence_score != null
                                        ? `${Math.round(risk_assessment.confidence_score * 100)}%`
                                        : '—'}
                                </p>
                            </div>
                            {risk_assessment?.confidence_score != null && (
                                <div className="mt-2 h-1.5 bg-white border border-[#1DB4C4]/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#1DB4C4] rounded-full transition-all"
                                        style={{ width: `${Math.round(risk_assessment.confidence_score * 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pharmacogenomic Profile */}
                <div>
                    <p className="text-xs font-bold text-[#28276D]/60 uppercase tracking-widest mb-3">Pharmacogenomic Profile</p>
                    <div className="rounded-xl border border-[#28276d14] overflow-hidden">
                        <InfoRow label="Patient ID" value={patient_id} />
                        <InfoRow label="Primary Gene" value={pharmacogenomic_profile?.primary_gene} />
                        <InfoRow label="Diplotype" value={pharmacogenomic_profile?.diplotype} />
                        <InfoRow label="Phenotype" value={pharmacogenomic_profile?.phenotype} />
                    </div>
                </div>

                {/* Clinical Recommendation */}
                {clinical_recommendation?.recommendation_text && (
                    <div className="p-4 rounded-xl bg-[#1DB4C4]/10 border border-[#1DB4C4]/30">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-[#28276D] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-xs font-bold text-[#28276D] uppercase tracking-widest mb-1">Clinical Recommendation</p>
                                <p className="text-sm text-[#28276D]">{clinical_recommendation.recommendation_text}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* LLM Explanation */}
                {llm_generated_explanation && (() => {
                    const llmFailed =
                        llm_generated_explanation.summary === 'LLM generation failed.' ||
                        llm_generated_explanation.mechanism === 'Error during explanation generation.';

                    return (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold text-[#28276D]/60 uppercase tracking-widest">AI Generated Explanation</p>
                                {llmFailed && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#28276D]/10 text-[#28276D] uppercase tracking-wider">
                                        Unavailable
                                    </span>
                                )}
                            </div>

                            {llmFailed ? (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1DB4C4]/10 border border-[#1DB4C4]/30">
                                    <svg className="w-5 h-5 text-[#28276D] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-semibold text-[#28276D]">LLM explanation could not be generated</p>
                                        <p className="text-xs text-[#28276D]/70 mt-1">
                                            The AI explanation service was unavailable during this analysis. The clinical recommendation above is based on validated CPIC/PharmGKB rule engine results and remains reliable.
                                        </p>
                                        {llm_generated_explanation.confidence && (
                                            <p className="text-xs text-[#28276D]/70 mt-2">
                                                Confidence: <span className="font-semibold text-[#28276D]">{llm_generated_explanation.confidence}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {llm_generated_explanation.summary && (
                                        <div className="p-3 rounded-lg bg-[#1DB4C4]/10 border border-[#28276d1a]">
                                            <p className="text-xs font-semibold text-[#28276D]/70 mb-1">Summary</p>
                                            <p className="text-sm text-[#28276D]">{llm_generated_explanation.summary}</p>
                                        </div>
                                    )}
                                    {llm_generated_explanation.mechanism && (
                                        <div className="p-3 rounded-lg bg-[#1DB4C4]/10 border border-[#28276d1a]">
                                            <p className="text-xs font-semibold text-[#28276D]/70 mb-1">Mechanism</p>
                                            <p className="text-sm text-[#28276D]">{llm_generated_explanation.mechanism}</p>
                                        </div>
                                    )}
                                    {llm_generated_explanation.confidence && (
                                        <p className="text-xs text-[#28276D]/70">
                                            Confidence: <span className="font-semibold text-[#28276D]">{llm_generated_explanation.confidence}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
