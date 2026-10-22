import { fmtDateTime } from '../utils/format.js';

/** Rows of the "Claim Summary" side card, from the active claim. */
export const claimSummaryRows = (claim) => [
    { key: 'claimId', label: 'Claim ID', value: claim?.claimNo ?? '—', highlight: true },
    { key: 'insuredName', label: 'Insured Name', value: claim?.insuredName || '—' },
    { key: 'vehicleNo', label: 'Vehicle No.', value: claim?.vehicleNo || '—' },
    { key: 'claimType', label: 'Claim Type', value: claim?.claimType || '—' },
    { key: 'intimationDate', label: 'Intimation Date', value: claim?.submittedAt ? fmtDateTime(claim.submittedAt) : 'Not submitted' },
    { key: 'currentStage', label: 'Current Stage', value: claim?.stageLabel ?? '—', tag: true },
];

export const CLAIM_NOTE =
    'All communication, letters and replies related to this claim are shown here in chronological order.';

export const QUICK_ACTIONS = [
    { key: 'issue-letter', label: 'Issue Letter', icon: 'file', tone: 'violet' },
    { key: 'send-email', label: 'Send Email', icon: 'mail', tone: 'amber' },
    { key: 'send-sms', label: 'Send SMS', icon: 'message', tone: 'blue' },
    { key: 'add-note', label: 'Add Note', icon: 'note', tone: 'green' },
];
