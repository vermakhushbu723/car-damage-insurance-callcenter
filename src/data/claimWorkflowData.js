/** Header blocks shared by every claim-processing screen. */

export const CLAIM_IDENTITY = [
    { key: 'assistClaimId', label: 'Assist Claim ID', value: 'BIM-250501-1021', muted: true, copy: true },
    { key: 'claimNo', label: 'Claim No', value: 'CLM-250501-1021', muted: true },
    { key: 'insuredName', label: 'Insured Name', value: 'Amit Verma' },
    { key: 'policyNo', label: 'Policy No', value: '1234567890' },
    { key: 'productType', label: 'Product Type', value: 'Private Car Package' },
    { key: 'claimType', label: 'Claim Type', value: 'Motor OD' },
    { key: 'natureOfLoss', label: 'Nature Of Loss', value: 'Accidental Damage' },
];

export const CLAIM_META = [
    {
        key: 'tat',
        label: 'TAT',
        value: '2D 06H 24M',
        note: 'SLA Risk',
        icon: 'clock',
        tone: 'red',
        valueTone: 'text-red-500',
    },
    {
        key: 'stage',
        label: 'Current Stage',
        value: 'Claim Details',
        note: 'In Progress',
        icon: 'file',
        tone: 'blue',
        valueTone: 'text-[#1450d8]',
    },
    { key: 'workshop', label: 'Workshop', value: 'ABC Motors', icon: 'shop', tone: 'orange' },
    { key: 'loss-location', label: 'Loss Location', value: 'Noida', note: 'Pin: 201301', icon: 'pin', tone: 'violet' },
    {
        key: 'fraud',
        label: 'Fraud Trigger',
        value: '2 Triggers',
        note: 'Risk: High',
        icon: 'alert',
        tone: 'red',
        valueTone: 'text-red-500',
    },
    {
        key: 'amount',
        label: 'Claim Amount',
        value: '1,25,500',
        note: 'As On 01 May 2025',
        icon: 'rupee',
        tone: 'green',
    },
];

/** Ordered lifecycle – a page marks everything up to its own stage as done. */
export const CLAIM_STAGES = [
    { key: 'intimation', label: 'Intimation', time: '01 May, 10:45 AM', icon: 'check' },
    { key: 'handler-allocation', label: 'Handler Allocation', time: '01 May, 10:50 AM', icon: 'user' },
    { key: 'surveyor-assignment', label: 'Surveyor Assignment', time: '01 May, 10:55 AM', icon: 'search' },
    { key: 'claim-details', label: 'Claim Details', time: '01 May, 11:00 AM', icon: 'file' },
    { key: 'ai-ila', label: 'AI ILA', time: '01 May, 11:05 AM', icon: 'sparkle' },
    { key: 'fla', label: 'FLA', time: '01 May, 11:10 AM', icon: 'shield' },
    { key: 'payment-recommendation', label: 'Payment Recommendation', time: '01 May, 11:15 AM', icon: 'wallet' },
    { key: 'survey-paybill', label: 'Survey Paybill', time: '01 May, 11:15 AM', icon: 'card' },
];

export const CLAIM_ACTION_BUTTONS = [
    { key: 'common-links', label: 'Common Links', icon: 'link', className: 'bg-[#5b6b84] hover:bg-[#4c5b71]' },
    { key: 'remarks', label: 'Remarks', icon: 'grid', className: 'bg-[#7c3aed] hover:bg-[#6d28d9]' },
    {
        key: 'communication-history',
        label: 'Communication History',
        icon: 'file',
        className: 'bg-[#1450d8] hover:bg-[#0f3fb0]',
    },
    { key: 'audit-trail', label: 'Claim Audit Trail', icon: 'audit', className: 'bg-[#5b6be8] hover:bg-[#4a5ad6]' },
];

export const META_TONES = {
    red: 'bg-red-100 text-red-500',
    blue: 'bg-blue-100 text-[#1450d8]',
    orange: 'bg-orange-100 text-orange-500',
    violet: 'bg-violet-100 text-violet-500',
    green: 'bg-emerald-100 text-emerald-600',
};
