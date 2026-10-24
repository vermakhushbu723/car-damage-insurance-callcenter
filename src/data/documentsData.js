/** Documents DMS screen. `type` = document type of the API (PUT /claims/:id/documents/:type). */

export const DMS_TABS = [
    { key: 'documents', label: 'Documents', icon: 'file' },
    { key: 'survey', label: 'Survey', icon: 'book' },
    { key: 'assessment', label: 'Assesment', icon: 'experiment' },
    { key: 'decision', label: 'Decisson', icon: 'info' },
];

export const DOCUMENT_TYPES = [
    { key: 'dl', type: 'dl', code: 'DL', label: 'Driving License', icon: 'id-card' },
    { key: 'rc', type: 'rc', code: 'RC', label: 'Registration Certificate', icon: 'file-text' },
    { key: 'ev', type: 'estimate', code: 'EV', label: 'Estimated Value', icon: 'calculator' },
    { key: 'po', type: 'policy-copy', code: 'PO', label: 'Policy', icon: 'file-protect' },
    { key: 'cf', type: 'claim-form', code: 'CF', label: 'Claim Form', icon: 'form' },
    { key: 'photos', type: 'vehicle-photos', code: 'PHOTOS', label: 'Vehicle Photos', icon: 'picture' },
    { key: 'kyc', type: 'kyc', code: 'KYC', label: 'KYC (Aadhar / PAN)', icon: 'idcard-two' },
    { key: 'sr', type: 'surveyor-report', code: 'SR', label: 'Surveyor Report', icon: 'file-done' },
    { key: 'other', type: 'other', code: 'OTHER', label: 'Documents', icon: 'folder' },
];
