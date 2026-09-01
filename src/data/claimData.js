/** The claim the communication-history screen is opened for. */
export const CLAIM_SUMMARY = {
    claimId: 'CLM-250501-1021',
    insuredName: 'Amit Verma',
    vehicleNo: 'DL 01 AB 1234',
    claimType: 'Own Damage',
    intimationDate: '01 May 2025, 10:45 AM',
    currentStage: 'Intimation Stage',
    policyNumber: '123456789012',
    intimatedBy: 'Amit Verma (Insured)',
    mobileNo: '9876543210',
};

/**
 * Two-column read-out used on the Issue Letter screen.
 * Order is row-major: left cell, right cell, left cell, ...
 */
export const CLAIM_SUMMARY_GRID = [
    { key: 'claimId', label: 'Claim ID', value: CLAIM_SUMMARY.claimId, highlight: true },
    { key: 'intimationDate', label: 'Intimation Date', value: '01 May 2025 10:45 AM' },
    { key: 'insuredName', label: 'Insured Name', value: CLAIM_SUMMARY.insuredName },
    { key: 'claimType', label: 'Claim Type', value: CLAIM_SUMMARY.claimType },
    { key: 'policyNumber', label: 'Policy Number', value: CLAIM_SUMMARY.policyNumber },
    { key: 'intimatedBy', label: 'Intimated By', value: CLAIM_SUMMARY.intimatedBy },
    { key: 'vehicleNo', label: 'Vehicle No.', value: CLAIM_SUMMARY.vehicleNo },
    { key: 'mobileNo', label: 'Mobile No.', value: CLAIM_SUMMARY.mobileNo },
];

/** Rows of the "Claim Summary" side card – rendered from this list. */
export const CLAIM_SUMMARY_ROWS = [
    { key: 'claimId', label: 'Claim ID', value: CLAIM_SUMMARY.claimId, highlight: true },
    { key: 'insuredName', label: 'Insured Name', value: CLAIM_SUMMARY.insuredName },
    { key: 'vehicleNo', label: 'Vehicle No.', value: CLAIM_SUMMARY.vehicleNo },
    { key: 'claimType', label: 'Claim Type', value: CLAIM_SUMMARY.claimType },
    { key: 'intimationDate', label: 'Intimation Date', value: CLAIM_SUMMARY.intimationDate },
    { key: 'currentStage', label: 'Current Stage', value: CLAIM_SUMMARY.currentStage, tag: true },
];

export const CLAIM_NOTE =
    'All communication, letters and replies related to this claim are shown here in chronological order.';

export const QUICK_ACTIONS = [
    { key: 'issue-letter', label: 'Issue Letter', icon: 'file', tone: 'violet' },
    { key: 'send-email', label: 'Send Email', icon: 'mail', tone: 'amber' },
    { key: 'send-sms', label: 'Send SMS', icon: 'message', tone: 'blue' },
    { key: 'add-note', label: 'Add Note', icon: 'note', tone: 'green' },
];
