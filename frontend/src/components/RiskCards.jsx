const RISK_CONFIGS = {
    safe: {
        label: 'Safe',
        sub: 'Normal Metabolizer',
        color: 'teal',
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    adjust: {
        label: 'Adjust Dosage',
        sub: 'Intermediate / Poor',
        color: 'navy',
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    toxic: {
        label: 'Toxic / High Risk',
        sub: 'Ultra-rapid / Adverse',
        color: 'navyStrong',
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

const colorMap = {
    teal: {
        border: 'border-[#1DB4C4]/40',
        bg: 'bg-[#1DB4C4]/10',
        dot: 'bg-[#1DB4C4]',
        label: 'text-[#28276D]',
        sub: 'text-[#28276D]/70',
        ring: 'ring-2 ring-[#1DB4C4] ring-offset-2',
    },
    navy: {
        border: 'border-[#28276d26]',
        bg: 'bg-[#28276D]/8',
        dot: 'bg-[#28276D]',
        label: 'text-[#28276D]',
        sub: 'text-[#28276D]/70',
        ring: 'ring-2 ring-[#28276D] ring-offset-2',
    },
    navyStrong: {
        border: 'border-[#28276D]/40',
        bg: 'bg-[#28276D]/12',
        dot: 'bg-[#28276D]',
        label: 'text-[#28276D]',
        sub: 'text-[#28276D]/80',
        ring: 'ring-2 ring-[#28276D] ring-offset-2',
    },
};

function RiskCard({ config, active = false }) {
    const c = colorMap[config.color];
    return (
        <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300
      ${c.border} ${c.bg} ${active ? c.ring : ''}`}>
            <div className={`w-10 h-10 rounded-full ${c.dot} flex items-center justify-center mb-3 shadow-md ${active ? 'scale-110' : ''} transition-transform`}>
                {config.icon}
            </div>
            <span className={`font-bold text-sm ${c.label}`}>{config.label}</span>
            <p className={`text-[10px] uppercase font-bold mt-1 ${c.sub}`}>{config.sub}</p>
        </div>
    );
}

export default function RiskCards({ activeRisk }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(RISK_CONFIGS).map(([key, cfg]) => (
                <RiskCard key={key} config={cfg} active={activeRisk === key} />
            ))}
        </div>
    );
}
