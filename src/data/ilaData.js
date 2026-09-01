/** Everything the AI Loss Assessment (ILA) screen needs, as data. */

export const SEVERITY_TONES = {
    none: { dot: 'bg-emerald-500', fill: 'rgba(16,185,129,0.18)', stroke: '#10b981', text: 'text-emerald-600' },
    minor: { dot: 'bg-amber-400', fill: 'rgba(251,191,36,0.22)', stroke: '#fbbf24', text: 'text-amber-500' },
    moderate: { dot: 'bg-orange-500', fill: 'rgba(249,115,22,0.22)', stroke: '#f97316', text: 'text-orange-500' },
    severe: { dot: 'bg-red-500', fill: 'rgba(239,68,68,0.25)', stroke: '#ef4444', text: 'text-red-500' },
};

/** Survey images in the strip under the analysis viewer. */
export const SURVEY_IMAGES = [
    { key: 'IMG_001', label: 'IMG_001 - Front', view: 'front', flagged: true },
    { key: 'IMG_002', label: 'IMG_002 - Front Left', view: 'front-left', flagged: true },
    { key: 'IMG_003', label: 'IMG_003 - Front Right', view: 'front-right', flagged: true },
    { key: 'IMG_004', label: 'IMG_004 - Left Side', view: 'left', flagged: true },
    { key: 'IMG_005', label: 'IMG_005 - Right Side', view: 'right', flagged: false },
    { key: 'IMG_006', label: 'IMG_006 - Rear', view: 'rear', flagged: true },
    { key: 'IMG_007', label: 'IMG_007 - Rear Left', view: 'rear-left', flagged: true },
    { key: 'IMG_008', label: 'IMG_008 - Odometer', view: 'odometer', flagged: false },
];

/** Boxes drawn over the survey image, positioned in % of the frame. */
export const DAMAGE_OVERLAYS = {
    IMG_001: [
        { key: 'bumper', index: 1, label: 'Crack · Front Bumper', severity: 'severe', x: 8, y: 62, w: 34, h: 26 },
        { key: 'headlight', index: 2, label: 'Broken · L. Headlight', severity: 'severe', x: 20, y: 40, w: 26, h: 16 },
        { key: 'hood', index: 3, label: 'Paint · Hood', severity: 'minor', x: 18, y: 20, w: 44, h: 18 },
        { key: 'fender', index: 4, label: 'Dent · L. Fender', severity: 'moderate', x: 44, y: 52, w: 28, h: 26 },
    ],
};

export const DAMAGE_MODES = [
    { key: 'none', label: 'None', className: 'bg-emerald-500' },
    { key: 'repair', label: 'Repair', className: 'bg-orange-500' },
    { key: 'replace', label: 'Replace', className: 'bg-red-500' },
];

/** Donut gauges of the insights panel. */
export const AI_INSIGHT_DONUTS = [
    { key: 'confidence', label: 'AI Confidence', value: 95, display: '95%', tone: '#1450d8' },
    { key: 'damage-score', label: 'Damage Score', value: 68, display: '68/100', tone: '#f59e0b' },
    { key: 'fraud', label: 'Fraud Probability', value: 6, display: '06%', tone: '#94a3b8' },
    { key: 'image-quality', label: 'Image Quality', value: 94, display: '94%', tone: '#10b981' },
];

export const AI_INSIGHT_ROWS = [
    { key: 'duplicate', label: 'Duplicate Images', value: '0 Of 8' },
    { key: 'previous-match', label: 'Previous Claim Match', value: 'No Matches', tone: 'text-emerald-600' },
    { key: 'processing-time', label: 'AI Processing Time', value: '4.2s' },
    { key: 'repair-duration', label: 'Est Repair Duration', value: '6-8 Days' },
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

export const DETECTED_PARTS = [
    {
        key: '01',
        part: 'Front Bumper',
        damageType: 'Crack',
        severity: 'Severe',
        action: 'Replace',
        cost: 48500,
        confidence: 96,
        status: 'Pending',
    },
    {
        key: '02',
        part: 'Left Headlight',
        damageType: 'Broken Part',
        severity: 'Severe',
        action: 'Replace',
        cost: 22800,
        confidence: 94,
        status: 'Approval',
    },
    {
        key: '03',
        part: 'Front Left Fender',
        damageType: 'Dent',
        severity: 'Moderate',
        action: 'Repair',
        cost: 12400,
        confidence: 88,
        status: 'Pending',
    },
    {
        key: '04',
        part: 'Hood',
        damageType: 'Paint Damage',
        severity: 'Minor',
        action: 'Repair',
        cost: 6800,
        confidence: 82,
        status: 'In Review',
    },
    {
        key: '05',
        part: 'Left Door',
        damageType: 'Scratch',
        severity: 'Minor',
        action: 'Repair',
        cost: 3200,
        confidence: 78,
        status: 'In Review',
    },
    {
        key: '06',
        part: 'Rear Right Quarter',
        damageType: 'Dent',
        severity: 'Moderate',
        action: 'Repair',
        cost: 14200,
        confidence: 91,
        status: 'Pending',
    },
    {
        key: '07',
        part: 'Rear Bumper',
        damageType: 'Scratch',
        severity: 'Minor',
        action: 'Repair',
        cost: 4100,
        confidence: 74,
        status: 'Pending',
    },
    {
        key: '08',
        part: 'Windshield',
        damageType: 'Crack',
        severity: 'Moderate',
        action: 'Replace',
        cost: 18900,
        confidence: 92,
        status: 'Approval',
    },
];

export const MODEL_NAME = 'ClaimVision-v4.2';

/* ---- Initial Loss Assessment card ---- */

export const ILA_SUMMARY = {
    badge: 'Within Policy',
    title: 'Initial Loss Assessment',
    total: 173200,
    vehicle: 'Maruti Swift (2021)',
    meta: '8 damaged parts · IDV ₹18,40,000',
    costs: [
        { key: 'repair', label: 'Repair Cost', value: 58700 },
        { key: 'replacement', label: 'Replacement Cost', value: 90200 },
        { key: 'labour', label: 'Labour Cost', value: 14500 },
        { key: 'paint', label: 'Paint Charges', value: 9800 },
    ],
    recommendation: {
        title: 'AI Recommendation Approve',
        detail: 'Consistent With Policy Schedule & Repair History',
    },
    fraud: {
        title: 'Fraud Analysis',
        detail: 'Low Risk (6%) - No Duplicate/Prior Match',
    },
};

/* ---- Continuous learning ---- */

export const FEEDBACK_STEPS = [
    { key: 'survey-images', step: 'STEP 1', title: 'Survey Images', detail: '8 Images - 24MB', state: 'done' },
    { key: 'ai-detection', step: 'STEP 2', title: 'AI Detection', detail: '24 Damages - 4.2s', state: 'done' },
    { key: 'ila-report', step: 'STEP 3', title: 'ILA Report', detail: 'Draft Generated', state: 'done' },
    { key: 'csm-review', step: 'STEP 4', title: 'CSM Review', detail: '3 Correction', state: 'active' },
    { key: 'feedback', step: 'STEP 5', title: 'Feedback', detail: 'Queued', state: 'pending' },
    { key: 'ai-retraining', step: 'STEP 6', title: 'AI Retraining', detail: 'Nightly Batch', state: 'pending' },
];

export const FEEDBACK_STATS = [
    { key: 'corrections', label: 'CORRECTIONS THIS WEEK', value: '128', delta: '+18%', direction: 'up' },
    { key: 'accuracy', label: 'MODEL ACCURACY', value: '94.6%', delta: '+0.4%', direction: 'up' },
    { key: 'review-time', label: 'AVG REVIEW TIME', value: '2m 14s', delta: '-12%', direction: 'down' },
    { key: 'auto-approvals', label: 'AUTO-APPROVALS', value: '72%', delta: '+6%', direction: 'up' },
];

export const PIPELINE_STATUS = { label: 'Pipeline healthy', version: 'v4.2 → v4.3 (78%)' };

export const TOOLKIT_ACTIONS = [
    { key: 'add-damage', label: 'Add Damages', icon: 'plus' },
    { key: 'delete', label: 'Delete', icon: 'delete' },
    { key: 'edit-annotation', label: 'Edit Annotation', icon: 'edit' },
    { key: 'merge-damages', label: 'Marge Damages', icon: 'merge' },
    { key: 'repair-replace', label: 'Repair - Replace', icon: 'swap' },
    { key: 'resize-box', label: 'Resize Box', icon: 'expand' },
];

export const DEFAULT_REVIEW_NOTE =
    'Hood Paint Damage Upgraded From Minor To Moderate. Rear Bumper Action Changed To Repair.';

/** Indian-format currency without decimals. */
export const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
