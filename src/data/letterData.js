/** Everything the Issue Letter screen needs, as data. */

export const LETTER_TYPE_OPTIONS = [
    { label: 'Vehicle Not in Workshop', value: 'vehicle-not-in-workshop' },
    { label: 'Documents Required', value: 'documents-required' },
];

export const REQUESTING_ON_OPTIONS = [
    { label: 'Intimation Stage', value: 'intimation-stage' },
    { label: 'Survey Stage', value: 'survey-stage' },
    { label: 'Assessment Stage', value: 'assessment-stage' },
    { label: 'Approval Stage', value: 'approval-stage' },
];

export const PRIORITY_OPTIONS = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];

export const PRIORITY_TONES = {
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-emerald-600',
};

export const REASON_OPTIONS = [
    { label: 'Vehicle not in workshop at the time of intimation', value: 'vehicle-not-in-workshop' },
    { label: 'Required documents not submitted', value: 'documents-not-submitted' },
    { label: 'Incomplete claim form', value: 'incomplete-claim-form' },
    { label: 'Additional information required for assessment', value: 'additional-information' },
];

/**
 * The checklist changes with the letter type – the "vehicle not in workshop"
 * letter asks for details, the "documents required" letter asks for papers.
 */
export const REQUIREMENTS_BY_LETTER_TYPE = {
    'vehicle-not-in-workshop': [
        { key: 'reason', label: 'Vehicle is not in workshop - Reason', checked: true },
        { key: 'location', label: 'Vehicle location details', checked: true },
        { key: 'arrival-date', label: 'Expected date of vehicle arrival at workshop', checked: true },
        { key: 'photographs', label: 'Photographs of vehicle at current location', checked: true },
        { key: 'workshop-contact', label: 'Contact details of preferred workshop', checked: true },
        { key: 'owner-confirmation', label: "Owner's confirmation", checked: true },
        { key: 'any-other', label: 'Any other relevant information', checked: false },
        { key: 'others', label: 'Others (Please specify)', checked: false },
    ],
    'documents-required': [
        {
            key: 'workshop-location',
            label: 'Vehicle is not in workshop - Share reason or workshop location',
            checked: true,
        },
        { key: 'claim-form', label: 'Claim Form', checked: true },
        { key: 'driving-license', label: 'Driving License', checked: true },
        { key: 'registration-certificate', label: 'Registration Certificate', checked: true },
        { key: 'fitness-certificate', label: 'Fitness Certificate', checked: false },
        { key: 'permit', label: 'Permit', checked: true },
        { key: 'load-challan', label: 'Load Challan', checked: false },
        { key: 'fir', label: 'FIR', checked: true },
        { key: 'police-chargesheet', label: 'Police Chargesheet/FR Copy', checked: false },
        { key: 'injury-details', label: 'Injury Details', checked: false },
        { key: 'mlc-copy', label: 'MLC Copy', checked: true },
        { key: 'others', label: 'Others (Please specify)', checked: false },
    ],
};

export const SEND_VIA_CHANNELS = [
    { key: 'sms', label: 'SMS', icon: 'mobile', checked: true },
    { key: 'email', label: 'Email', icon: 'mail', checked: true },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', checked: false },
];

export const CONTACT_DETAILS = [
    { key: 'mobile', label: 'Mobile No.', value: '9876543210' },
    { key: 'email', label: 'Email ID', value: 'amit.verma@email.com' },
];

/** No letter has been issued for this claim yet. */
export const LETTER_HISTORY = [];

export const LETTER_META = {
    letterNo: 'LET-250501-045',
    title: 'LETTER FOR INFORMATION / DOCUMENTS REQUIRED',
    team: 'Claims Team',
    sender: 'Ibima Assist',
    footNote: 'This is a system generated letter. No signature is required.',
};

export const REMARKS_LIMIT = 200;
export const INSTRUCTIONS_LIMIT = 150;

export const DEFAULT_LETTER_FORM = {
    letterType: 'vehicle-not-in-workshop',
    requestingOn: 'intimation-stage',
    priority: 'high',
    issueDate: '2025-05-01',
    responseDueBy: '2025-05-08',
    responseDueDays: 7,
    reason: 'vehicle-not-in-workshop',
    remarks: 'As per telephonic discussion, the vehicle is not available at any workshop. Please provide details.',
    instructions: 'Please share the details at the earliest to avoid delay in claim process.',
};

/** Label lookup used by the preview. */
export const labelOf = (options, value) => options.find((option) => option.value === value)?.label || '';

/**
 * Builds the letter body from the current form state, so the preview always
 * matches what the agent has selected.
 */
export const buildLetterBody = ({ claim, form, requirements }) => ({
    subject: `${labelOf(REASON_OPTIONS, form.reason)} – Information Requested`,
    intro: `This is in reference to the motor claim intimation (Claim ID: ${claim.claimId}) reported on ${claim.intimationDate.split(',')[0]}.`,
    lead:
        form.letterType === 'documents-required'
            ? 'In order to process your claim further, please provide the following documents:'
            : 'As per the information provided, the vehicle is not available at any workshop. In order to process your claim further, please provide the following information / documents:',
    items: requirements.filter((item) => item.checked).map((item) => item.label),
    deadline: form.responseDueBy,
    warning: 'Failure to provide the requested information may lead to delay in claim processing.',
    queries: 'For any queries, please contact us.',
});
