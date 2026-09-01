/** Payment Recommendation screen. */

export const FINANCIAL_SUMMARY = [
    { key: 'estimated', label: 'Estimated Repair Cost (AI ILA)', value: '1,25,500.00' },
    { key: 'handler-ila', label: 'Handler ILA Amount', value: '1,18,750.00' },
    { key: 'approved-fla', label: 'Approved FLA Ammount', value: '1,10,000.00' },
    { key: 'deductions-head', label: 'Deductions', value: '' },
    { key: 'total-deductions', label: 'Total Deductions', value: '-20,000.00' },
];

export const NET_PAYABLE = { label: 'Net Payable Ammount', value: '90,000.00' };

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

export const PAYEE_TYPE_OPTIONS = [
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Insured', value: 'Insured' },
    { label: 'Surveyor', value: 'Surveyor' },
];

export const PAYEE_NAME_OPTIONS = [
    { label: 'ABC Motors, Noida', value: 'ABC Motors, Noida' },
    { label: 'Amit Verma', value: 'Amit Verma' },
    { label: 'Suresh Sharma', value: 'Suresh Sharma' },
];

export const PAYMENT_FOR_OPTIONS = [
    { label: 'Repair Expenses', value: 'Repair Expenses' },
    { label: 'Towing Charges', value: 'Towing Charges' },
    { label: 'Survey Fee', value: 'Survey Fee' },
];

export const PAYEE_ROWS = Array.from({ length: 3 }, (_, index) => ({
    key: String(index + 1),
    payeeType: 'Workshop',
    payeeName: 'ABC Motors, Noida',
    bankName: 'HDFC Bank Ltd.',
    bankBranch: 'Noida, Branch',
    ifsc: 'HDFC001234',
    accountNo: '123456789012345',
    paymentFor: 'Repair Expenses',
    amount: 75000,
    tds: 0,
}));

export const APPROVAL_INFO = {
    status: 'Pending For Approval From Next Level',
    rows: [
        { key: 'next-approver', label: 'Next Approver', value: 'State Manager' },
        { key: 'due-date', label: 'Due Date', value: '03 May 2025, 06:00 PM' },
        { key: 'approver-name', label: 'Approver Name', value: 'Vikram Singh (SM-1001)' },
    ],
};

export const TOTAL_PAYABLE = 90000;
