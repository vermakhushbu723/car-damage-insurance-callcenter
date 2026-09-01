/** Survey Paybill screen. */

export const SURVEY_DETAILS = [
    { key: 'surveyorName', label: 'Surveyor Name', value: 'Suresh Sharma' },
    { key: 'surveyorId', label: 'Surveyor ID', value: 'SUR-1001' },
    { key: 'surveyorType', label: 'Surveyor Type', value: 'Final Loss Assessment' },
    { key: 'surveyorDate', label: 'Surveyor Date', value: '02 May 2025' },
    { key: 'surveyLocation', label: 'Survey Location', value: 'Noida, UP' },
    { key: 'surveyMode', label: 'Survey Mode', value: 'Physical Survey' },
    { key: 'claimHandler', label: 'Claim Handler', value: 'Rajesh Kumar (CH-2001)' },
    { key: 'distance', label: 'Distance Travelled', value: '35 KMs' },
];

export const BILL_DETAILS = [
    { key: 'billNo', label: 'Bill No:', value: 'BILL/2505/1021' },
    { key: 'billDate', label: 'Bill Date', value: '03 May 2025' },
    { key: 'billingPeriod', label: 'Billing Period', value: '01 May 2025 - 02 May 2025' },
    { key: 'billTo', label: 'Bill To (Insurance Company)', value: 'Demo Insurance Co.Ltd' },
    {
        key: 'billingAddress',
        label: 'Billing Address',
        value: 'Demo Insurance Co.Ltd,\nInsurance House, Sector-62\nNoida, UP-201301',
    },
];

/** Rate is editable; amount is rate × quantity. */
export const PAYBILL_LINES = [
    { key: 'surveyor-fee', label: 'Surveyor Fee (Bases)', rate: 1200, qty: 1, basis: 'Per Survey' },
    { key: 'distance', label: 'Distance Allowance', rate: 12, qty: 35, basis: '35 Kms' },
    { key: 'outstation', label: 'Outstation Allowance', rate: 300, qty: 1, basis: '01' },
    { key: 'report', label: 'Report Preparation', rate: 500, qty: 1, basis: '01' },
    { key: 'other', label: 'Other Expenses', rate: 100, qty: 1, basis: '01' },
];

export const GST_RATE = 0.18;

export const BANK_DETAILS = [
    { key: 'holder', label: 'Account Holder Name', value: 'Vroomsync Experties Pvt Ltd' },
    { key: 'bank', label: 'Bank Name', value: 'HDFC Bank Ltd' },
    { key: 'account', label: 'Account No', value: '502000123456789' },
    { key: 'ifsc', label: 'IFSC Code', value: 'HDFC0001234' },
    { key: 'accountType', label: 'Account Type', value: 'Current Type' },
    { key: 'branch', label: 'Branch', value: 'Noida-Sector 62' },
];

export const PAYBILL_DOCUMENTS = [
    { key: 'surveyor-report', name: 'Surveyor Report.PDF', uploadedOn: 'Uploaded On 02 May 2025, 12:45 PM' },
];

export const DEFAULT_PAYBILL_REMARK = 'Final Loss Assessment Survey Completed & Report Submited.';
export const REMARK_LIMIT = 500;
