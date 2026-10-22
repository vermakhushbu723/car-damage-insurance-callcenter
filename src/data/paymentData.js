/** Payment Recommendation screen (amounts, payees and approver come from GET /claims/:id/payment). */

export const PAYMENT_TYPE_OPTIONS = [
    { label: 'Full Payment', value: 'full' },
    { label: 'Partial Payment', value: 'partial' },
];

export const PAYMENT_MODE_OPTIONS = [
    { label: 'NEFT/RTGS', value: 'neft' },
    { label: 'IMPS', value: 'imps' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'UPI', value: 'upi' },
];

export const PAYMENT_PRIORITY_OPTIONS = [
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
];
