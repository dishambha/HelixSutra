const severityStyles = {
    high: {
        badge: 'bg-[#28276D]/10 text-[#28276D]',
        border: 'border-[#28276d26]',
        glow: 'shadow-[0_12px_40px_-20px_rgba(40,39,109,0.4)]',
    },
    medium: {
        badge: 'bg-[#1DB4C4]/15 text-[#28276D]',
        border: 'border-[#1DB4C4]/40',
        glow: 'shadow-[0_12px_40px_-20px_rgba(29,180,196,0.35)]',
    },
    low: {
        badge: 'bg-[#1DB4C4]/10 text-[#28276D]',
        border: 'border-[#1DB4C4]/30',
        glow: 'shadow-[0_12px_40px_-20px_rgba(29,180,196,0.25)]',
    },
};

const riskColors = {
    safe: 'text-[#28276D] bg-[#1DB4C4]/15 border-[#1DB4C4]/40',
    adjust: 'text-[#28276D] bg-[#28276D]/8 border-[#28276d26]',
    toxic: 'text-[#28276D] bg-[#28276D]/15 border-[#28276d33]',
};

function StatCard({ title, value, helper, badge, border }) {
    return (
        <div className={`p-4 rounded-xl border bg-white shadow-sm ${border ?? 'border-[#28276d1a]'}`}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#28276D]/60">{title}</p>
                    <p className="text-lg font-extrabold text-[#28276D] mt-1 leading-tight">{value ?? '—'}</p>
                    {helper && <p className="text-xs text-[#28276D]/70 mt-1">{helper}</p>}
                </div>
                {badge}
            </div>
        </div>
    );
}

export default function AnalysisMeta({ data, activeRisk }) {
    if (!data) return null;

    const { patient_id, drug, timestamp, risk_assessment, pharmacogenomic_profile } = data;
    const severityKey = risk_assessment?.severity?.toLowerCase?.();
    const severityStyle = severityStyles[severityKey] ?? severityStyles.medium;
    const formattedTs = timestamp ? new Date(timestamp).toLocaleString() : 'Awaiting analysis';
    const riskLabel = risk_assessment?.risk_label ?? 'Pending';
    const confidence = risk_assessment?.confidence_score;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                title="Patient"
                value={patient_id}
                helper={pharmacogenomic_profile?.primary_gene ? `Primary gene · ${pharmacogenomic_profile.primary_gene}` : 'No gene detected yet'}
                badge={
                    pharmacogenomic_profile?.diplotype ? (
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-[#1DB4C4]/10 text-[#28276D] border border-[#1DB4C4]/30">
                            {pharmacogenomic_profile.diplotype}
                        </span>
                    ) : null
                }
            />

            <StatCard
                title="Drug Analyzed"
                value={drug ?? '—'}
                helper={formattedTs}
                badge={
                    severityKey ? (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border ${severityStyle.badge} ${severityStyle.border}`}>
                            {risk_assessment?.severity}
                        </span>
                    ) : null
                }
            />

            <div className="space-y-3">
                <StatCard
                    title="Risk Label"
                    value={riskLabel}
                    helper={confidence != null ? `${Math.round(confidence * 100)}% confidence` : undefined}
                    badge={
                        activeRisk ? (
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border ${riskColors[activeRisk] ?? 'bg-[#1DB4C4]/10 text-[#28276D] border-[#28276d1a]'}`}>
                                {activeRisk}
                            </span>
                        ) : null
                    }
                    border={`${severityStyle.border} ${severityStyle.glow}`}
                />
                {pharmacogenomic_profile?.phenotype && (
                    <div className="px-3 py-2 rounded-lg bg-[#1DB4C4]/10 border border-[#28276d1a] text-xs text-[#28276D]">
                        <span className="font-semibold text-[#28276D]">Phenotype:</span> {pharmacogenomic_profile.phenotype}
                    </div>
                )}
            </div>
        </div>
    );
}
