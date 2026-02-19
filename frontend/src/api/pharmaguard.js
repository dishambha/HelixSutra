import axios from 'axios';

const BASE_URL = 'https://helixsutra.onrender.com';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
});

/**
 * Upload a VCF file + medications and get the pharmacogenomic risk profile.
 * POST /analyze
 * @param {File} vcfFile
 * @param {string} medications  comma-separated medication names
 * @param {function} onUploadProgress
 */
export async function analyzeGenomicData(vcfFile, medications, onUploadProgress) {
    const formData = new FormData();
    // Force the correct MIME type for VCF files (matches backend expectation)
    const vcfBlob = new Blob([vcfFile], { type: 'text/x-vcard' });
    formData.append('file', vcfBlob, vcfFile.name);
    formData.append('drug', medications.trim());

    const response = await api.post('/analyze', formData, {
        // Do NOT set Content-Type manually — axios/browser sets it with the correct multipart boundary
        onUploadProgress,
    });

    console.log('PharmaGuard /analyze response:', response.data);

    return response.data;
}

export default api;
