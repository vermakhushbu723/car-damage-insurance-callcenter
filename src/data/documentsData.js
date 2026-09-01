/** Documents DMS screen. */

export const DMS_CLAIM_BAR = [
    { key: 'claimId', label: 'Claim Id', value: '1234567890' },
    { key: 'status', label: '', value: 'Pending For ILA' },
    { key: 'policyNumber', label: 'Policy Number', value: 'POL1234567890' },
    { key: 'insured', label: 'Insured', value: 'Rajesh Kumat' },
    { key: 'vehicle', label: 'Vehicle', value: 'Maruti Suzuki Balino' },
    { key: 'regNo', label: 'Reg No', value: 'MH 01 J 1234' },
];

export const DMS_TABS = [
    { key: 'documents', label: 'Documents', icon: 'file' },
    { key: 'survey', label: 'Survey', icon: 'book' },
    { key: 'assessment', label: 'Assesment', icon: 'experiment' },
    { key: 'decision', label: 'Decisson', icon: 'info' },
];

/** `status`: uploaded | pending. */
export const DOCUMENT_TYPES = [
    { key: 'dl', code: 'DL', label: 'Driving License', icon: 'id-card', status: 'uploaded' },
    { key: 'rc', code: 'RC', label: 'Registration Certificate', icon: 'file-text', status: 'pending' },
    { key: 'ev', code: 'EV', label: 'Estimated Value', icon: 'calculator', status: 'uploaded' },
    { key: 'po', code: 'PO', label: 'Policy', icon: 'file-protect', status: 'pending' },
    { key: 'cf', code: 'CF', label: 'Claim Form', icon: 'form', status: 'uploaded' },
    { key: 'other', code: 'OTHER', label: 'Documents', icon: 'folder', status: 'none' },
];

export const UPLOADED_FILES = [
    { key: 'dl-pdf', name: 'DL_PDF', size: '1.2 MB', progress: 100 },
    { key: 'rc-pdf', name: 'RC_PDF', size: '1.2 MB', progress: 100 },
    { key: 'policy-pdf', name: 'Policy_PDF', size: '1.2 MB', progress: 100 },
];
