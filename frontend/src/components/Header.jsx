export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#28276d1a] bg-white/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-[#28276D] p-1.5 rounded-lg flex items-center justify-center shadow-md shadow-[#28276d33]">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#28276D]">PharmaGuard</span>
                        <span className="ml-2 px-3 py-1 bg-[#1DB4C4]/15 text-[#28276D] text-xs font-semibold rounded-full border border-[#1DB4C4]/50">
                            Health Tech Track
                        </span>
                    </div>

                </div>
            </div>
        </header>
    );
}
