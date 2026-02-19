import { useState } from 'react';
import Header from './components/Header';
import GeneticInput from './components/GeneticInput';
import ClinicalSummary, { getActiveRisk } from './components/ClinicalSummary';
import RiskCards from './components/RiskCards';
import VariantsTable from './components/VariantsTable';
import AnalysisMeta from './components/AnalysisMeta';
import QualityMetrics from './components/QualityMetrics';
import { analyzeGenomicData } from './api/pharmaguard';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (vcfFile, medications) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setUploadProgress(0);

    try {
      const data = await analyzeGenomicData(vcfFile, medications, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
      setResult(data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const activeRisk = getActiveRisk(result);
  const variants = result?.pharmacogenomic_profile?.detected_variants ?? [];

  return (
    <div className="min-h-screen bg-white text-[#28276D] font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#28276D]">
            Patient Analysis Configuration
          </h1>
          <p className="mt-2 text-[#28276D]/70 max-w-2xl">
            Upload genetic markers and specify medications to generate a personalized pharmacogenomic risk profile.
          </p>
        </div>

        {/* Upload Progress */}
        {isLoading && uploadProgress > 0 && (
          <div className="mb-6 p-4 bg-[#1DB4C4]/10 border border-[#1DB4C4]/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#28276D]">Uploading VCF file...</span>
              <span className="text-sm font-bold text-[#28276D]">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-white border border-[#1DB4C4]/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1DB4C4] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <GeneticInput onSubmit={handleSubmit} isLoading={isLoading} />

            {/* How it works */}
            <div className="flex items-start gap-4 p-5 bg-[#1DB4C4]/10 rounded-2xl border border-[#1DB4C4]/30">
              <svg className="w-5 h-5 text-[#28276D] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-bold text-[#28276D]">How it works</h4>
                <p className="text-xs text-[#28276D]/70 mt-1 leading-relaxed">
                  Our engine cross-references patient VCF files against PharmGKB and CPIC clinical guidelines to predict phenotype responses for specific drug classes, including NSAIDs, Anticoagulants, and Opioids.
                </p>
              </div>
            </div>

            <QualityMetrics metrics={result?.quality_metrics} />
          </div>

          {/* Right Column: Results Overview */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#28276D]">Analysis Overview</h2>
              <span className="text-xs font-medium text-[#28276D]/60 uppercase tracking-widest">
                {result ? `Patient · ${result.patient_id?.slice(-8)}` : 'Preview Mode'}
              </span>
            </div>

            <AnalysisMeta data={result} activeRisk={activeRisk} />

            {/* Clinical Summary Card */}
            <ClinicalSummary data={result} error={error} />

            {/* Risk Cards */}
            <RiskCards activeRisk={activeRisk} />

            {/* Variants Table  */}
            {variants.length > 0 && <VariantsTable variants={variants} />}

            {/* Drug info banner (when result present) */}
            {result && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-[#1DB4C4]/8 rounded-xl border border-[#1DB4C4]/30">
                <svg className="w-8 h-8 text-[#28276D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <div>
                  <p className="text-[11px] text-[#28276D]/70 font-semibold uppercase tracking-widest">Drug Analyzed</p>
                  <p className="text-sm font-bold text-[#28276D]">{result.drug}</p>
                </div>
                <div className="sm:ml-auto sm:text-right text-[#28276D] text-sm font-semibold">
                  <p className="text-[11px] text-[#28276D]/70 font-semibold uppercase tracking-widest">Timestamp</p>
                  <p className="text-xs font-semibold text-[#28276D]">{new Date(result.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-[#28276d1a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[#28276D]/70">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium">HIPAA Compliant Data Processing</span>
          </div>
          <div className="text-xs">© 2025 PharmaGuard Precision Medicine. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
