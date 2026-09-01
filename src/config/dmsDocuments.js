/** Tiles rendered inside the "DMS Documents" panel on the intimation screen. */
export const DMS_DOCUMENTS = [
    { key: 'rc', label: 'RC Certificate', icon: 'file-protect', tone: 'blue' },
    { key: 'dl', label: 'DL Driving Licence', icon: 'id-card', tone: 'green' },
    { key: 'claim-form', label: 'Claim Form', icon: 'form', tone: 'indigo' },
    { key: 'policy-copy', label: 'Policy Copy', icon: 'file-text', tone: 'amber' },
    { key: 'estimate', label: 'Estimate', icon: 'calculator', tone: 'rose' },
    { key: 'vehicle-photos', label: 'Vehicle Photos', icon: 'picture', tone: 'slate' },
    { key: 'fir', label: 'FIR', icon: 'safety', tone: 'pink' },
    { key: 'permit', label: 'Permit', icon: 'edit', tone: 'blue' },
    { key: 'fitness', label: 'Fitness', icon: 'safety', tone: 'cyan' },
    { key: 'kyc', label: 'KYC Documents', icon: 'solution', tone: 'green' },
    { key: 'aadhar', label: 'Aadhar Documents', icon: 'idcard-two', tone: 'orange' },
    { key: 'other', label: 'Other Documents', icon: 'folder', tone: 'red' },
];

/** Tailwind classes per tone – kept out of the component for easy theming. */
export const DOCUMENT_TONES = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-500 border-slate-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
};

export const UPLOAD_HINT = {
    title: 'Upload More Document',
    subtitle: 'Drag & Drop Files Here Or Click To Browse.',
    support: 'Supports JPG, PNG, PDF (Max 10MB)',
};
