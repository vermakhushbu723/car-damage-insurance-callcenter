/** Everything the AI Loss Assessment (ILA) screen needs, as data. */

export const SEVERITY_TONES = {
    none: { dot: 'bg-emerald-500', fill: 'rgba(16,185,129,0.18)', stroke: '#10b981', text: 'text-emerald-600' },
    minor: { dot: 'bg-amber-400', fill: 'rgba(251,191,36,0.22)', stroke: '#fbbf24', text: 'text-amber-500' },
    moderate: { dot: 'bg-orange-500', fill: 'rgba(249,115,22,0.22)', stroke: '#f97316', text: 'text-orange-500' },
    severe: { dot: 'bg-red-500', fill: 'rgba(239,68,68,0.25)', stroke: '#ef4444', text: 'text-red-500' },
};

export const DAMAGE_MODES = [
    { key: 'none', label: 'None', className: 'bg-emerald-500' },
    { key: 'repair', label: 'Repair', className: 'bg-orange-500' },
    { key: 'replace', label: 'Replace', className: 'bg-red-500' },
];

/* ---- Detected damage table ---- */

export const DAMAGE_TYPE_OPTIONS = [
    { label: 'Crack', value: 'Crack' },
    { label: 'Broken Part', value: 'Broken Part' },
    { label: 'Dent', value: 'Dent' },
    { label: 'Scratch', value: 'Scratch' },
    { label: 'Paint Damage', value: 'Paint Damage' },
];

export const SEVERITY_OPTIONS = [
    { label: 'Severe', value: 'Severe' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Minor', value: 'Minor' },
];

export const ACTION_OPTIONS = [
    { label: 'Repair', value: 'Repair' },
    { label: 'Replace', value: 'Replace' },
];

export const STATUS_OPTIONS = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approval', value: 'Approval' },
    { label: 'In Review', value: 'In Review' },
    { label: 'Rejected', value: 'Rejected' },
];

export const TABLE_TONES = {
    severity: { Severe: 'text-red-500', Moderate: 'text-orange-500', Minor: 'text-emerald-600' },
    action: { Repair: 'text-[#1450d8]', Replace: 'text-violet-600' },
    status: {
        Pending: 'text-amber-500',
        Approval: 'text-emerald-600',
        'In Review': 'text-[#1450d8]',
        Rejected: 'text-red-500',
    },
    damageType: {
        Crack: 'text-amber-600',
        'Broken Part': 'text-red-500',
        Dent: 'text-[#1450d8]',
        Scratch: 'text-violet-600',
        'Paint Damage': 'text-orange-500',
    },
};

/** Colours of the insight donuts (values come from GET /claims/:id/ai-ila). */
export const DONUT_TONES = { confidence: '#1450d8', 'damage-score': '#f59e0b', fraud: '#ef4444', images: '#10b981' };

export const TOOLKIT_ACTIONS = [
    { key: 'add-damage', label: 'Add Damages', icon: 'plus' },
    { key: 'delete', label: 'Delete', icon: 'delete' },
    { key: 'edit-annotation', label: 'Edit Annotation', icon: 'edit' },
    { key: 'merge-damages', label: 'Marge Damages', icon: 'merge' },
    { key: 'repair-replace', label: 'Repair - Replace', icon: 'swap' },
    { key: 'resize-box', label: 'Resize Box', icon: 'expand' },
];

/** Indian-format currency without decimals. */
export const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
