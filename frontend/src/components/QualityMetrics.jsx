const METRIC_LABELS = {
    vcf_parsing_success: {
        label: 'VCF Parsing',
        detail: 'File parsed and normalized',
    },
    gene_detected: {
        label: 'Gene Detected',
        detail: 'Primary gene found in VCF',
    },
    rule_engine_applied: {
        label: 'Rule Engine Applied',
        detail: 'CPIC / PharmGKB rules evaluated',
    },
    llm_explanation_generated: {
        label: 'AI Explanation',
        detail: 'Narrative generation executed',
    },
};

function MetricRow({ label, detail, ok }) {
    return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#28276d14] bg-[#1DB4C4]/10">
            <div>
                <p className="text-sm font-semibold text-[#28276D]">{label}</p>
                {detail && <p className="text-xs text-[#28276D]/70">{detail}</p>}
            </div>
            <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                    ok
                        ? 'bg-[#1DB4C4] text-white border-[#1DB4C4]'
                        : 'bg-[#28276D]/10 text-[#28276D] border-[#28276d26]'
                }`}
            >
                {ok ? 'Pass' : 'Fail'}
            </span>
        </div>
    );
}

export default function QualityMetrics({ metrics }) {
    if (!metrics) return null;

    return (
        <div className="bg-white rounded-2xl border border-[#28276d1a] shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#28276D]/60 uppercase tracking-widest">Quality Metrics</p>
                <span className="text-[11px] text-[#28276D]/60">System safeguards</span>
            </div>
            {Object.entries(metrics).map(([key, val]) => {
                const meta = METRIC_LABELS[key] ?? { label: key.replace(/_/g, ' '), detail: '' };
                return <MetricRow key={key} label={meta.label} detail={meta.detail} ok={Boolean(val)} />;
            })}
        </div>
    );
}
