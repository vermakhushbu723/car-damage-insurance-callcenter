/** Static parts of the header shared by every claim-processing screen. */

/** Service Provider claim journey: Intimation > Handler Allocation > Claim Details > AI ILA > Handler ILA > FLA > Survey Fee Bill; done / time come from the claim. */
export const CLAIM_STAGES = [
    { key: 'intimation', label: 'Intimation', icon: 'check' },
    { key: 'handler-allocation', label: 'Handler Allocation', icon: 'user' },
    { key: 'claim-details', label: 'Claim Details', icon: 'search' },
    { key: 'ai-ila', label: 'AI ILA', icon: 'sparkle' },
    { key: 'handler-ila', label: 'Handler ILA', icon: 'file' },
    { key: 'fla', label: 'FLA', icon: 'shield' },
    { key: 'survey-paybill', label: 'Survey Fee Bill', icon: 'card' },
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
