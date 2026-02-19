import { useRef, useState } from 'react';

export default function GeneticInput({ onSubmit, isLoading }) {
    const fileInputRef = useRef(null);
    const [vcfFile, setVcfFile] = useState(null);
    const [medications, setMedications] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (file) => {
        if (file && (file.name.endsWith('.vcf') || file.name.endsWith('.gz'))) {
            setVcfFile(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleSubmit = () => {
        if (!vcfFile) return;
        onSubmit(vcfFile, medications);
    };

    return (
        <section className="bg-white p-4 sm:p-6 rounded-2xl border border-[#28276d1a] shadow-sm">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#28276D]">
                <span className="bg-[#1DB4C4]/15 p-1.5 rounded-lg">
                    <svg className="w-5 h-5 text-[#28276D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                </span>
                Genetic Input
            </h2>

            {/* VCF Upload Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center w-full h-44 sm:h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
          ${dragOver
                        ? 'border-[#1DB4C4] bg-[#1DB4C4]/10 scale-[1.01]'
                        : vcfFile
                            ? 'border-[#1DB4C4] bg-[#1DB4C4]/10'
                            : 'border-[#28276d33] bg-white hover:border-[#1DB4C4] hover:bg-[#1DB4C4]/5'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".vcf,.gz"
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                {vcfFile ? (
                    <div className="flex flex-col items-center gap-3 px-4 sm:px-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#1DB4C4]/15 flex items-center justify-center shadow">
                            <svg className="w-7 h-7 text-[#28276D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-[#28276D]">{vcfFile.name}</p>
                            <p className="text-xs text-[#28276D]/70 mt-1">{(vcfFile.size / 1024).toFixed(1)} KB · VCF File Ready</p>
                        </div>
                        <button
                            className="text-xs text-[#28276D]/60 hover:text-[#28276D] mt-1 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setVcfFile(null); }}
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6">
                        <div className="mb-4 p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-[#1DB4C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-[#28276D] mb-1">Patient Genetic Data (VCF Format)</p>
                        <p className="text-xs text-[#28276D]/70">Drag and drop your .vcf or .gz file here</p>
                        <p className="mt-3 text-[10px] text-[#28276D]/60 uppercase tracking-widest">or</p>
                        <div className="mt-3 px-4 py-2 bg-white border border-[#28276d33] rounded-lg text-sm font-semibold text-[#28276D] hover:shadow-md transition-shadow">
                            Browse Local Files
                        </div>
                    </div>
                )}
            </div>

            {/* Medication Input */}
            <div className="mt-6">
                <label className="block text-sm font-semibold text-[#28276D] mb-2">
                    Prescribed Medication(s)
                </label>
                <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#28276D]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <input
                        type="text"
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#1DB4C4]/5 border border-[#28276d1a] rounded-lg focus:ring-2 focus:ring-[#1DB4C4]/40 focus:border-[#1DB4C4] outline-none transition-all placeholder:text-[#28276D]/40 text-sm text-[#28276D]"
                        placeholder="e.g., Codeine, Warfarin, Plavix"
                    />
                </div>
                <p className="mt-2 text-xs text-[#28276D]/70">Separate multiple medications with commas.</p>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isLoading || !vcfFile}
                className={`mt-6 w-full font-bold py-3.5 sm:py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-white
          ${!vcfFile
                        ? 'bg-[#28276D]/30 cursor-not-allowed shadow-none'
                        : 'bg-[#1DB4C4] hover:bg-[#1DB4C4]/90 shadow-[#1DB4C4]/30 active:scale-[0.98]'
                    }`}
            >
                {isLoading ? (
                    <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <span>Generate Risk Analysis</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </>
                )}
            </button>

            {!vcfFile && (
                <p className="text-center text-xs text-[#28276D]/60 mt-3">Upload a VCF file to enable analysis</p>
            )}
        </section>
    );
}
