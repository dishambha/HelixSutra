export default function VariantsTable({ variants = [] }) {
    if (!variants || variants.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-[#28276d1a] shadow-sm overflow-hidden">
            <div className="border-b border-[#28276d14] px-6 py-4 bg-[#1DB4C4]/10 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#28276D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <h3 className="font-bold text-[#28276D]">Detected Variants</h3>
                <span className="ml-auto bg-white text-[#28276D] text-xs font-bold px-2 py-0.5 rounded-full border border-[#28276d1a]">
                    {variants.length}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#1DB4C4]/10 border-b border-[#28276d14]">
                            <th className="text-left px-6 py-3 text-xs font-bold text-[#28276D]/70 uppercase tracking-widest">Gene</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-[#28276D]/70 uppercase tracking-widest">Star Allele</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-[#28276D]/70 uppercase tracking-widest">rsID</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-[#28276D]/70 uppercase tracking-widest hidden md:table-cell">Chromosome</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-[#28276D]/70 uppercase tracking-widest hidden lg:table-cell">Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((v, i) => (
                            <tr
                                key={i}
                                className="border-b border-[#28276d0f] hover:bg-[#1DB4C4]/8 transition-colors"
                            >
                                <td className="px-6 py-3.5">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1DB4C4]/15 text-[#28276D] text-xs font-bold">
                                        {v.primary_gene}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[#28276D] font-semibold">
                                    {v.star_allele}
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[#28276D]/80 text-xs">
                                    {v.rsid}
                                </td>
                                <td className="px-6 py-3.5 text-[#28276D]/80 text-xs hidden md:table-cell">
                                    {v.chromosome}
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[#28276D]/70 text-xs hidden lg:table-cell">
                                    {v.position}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
