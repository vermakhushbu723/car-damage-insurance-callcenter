// Sample content of the National Manager screens, copied from the Figma frames.
// These screens have no API behind them yet: pages that use this file show the
// "Sample data" tag (see NmTitle). Replace each export with an API call as the
// matching backend route is built.

export const DASHBOARD_KPIS = [
    { title: 'Total Intimation', value: '2,450', delta: '12%', note: 'VS Last 7 Days', tone: 'blue' },
    { title: 'Todays Intimation', value: '245', delta: '9%', note: 'VS Yesterday', tone: 'purple' },
    { title: 'Pending Survey', value: '812', delta: '9%', note: 'VS Yesterday', tone: 'amber' },
    { title: 'Pending For ILA', value: '812', delta: '9%', note: 'VS Yesterday', tone: 'orange' },
    { title: 'Sattled Claims', value: '1245', delta: '9%', note: 'VS Yesterday', tone: 'green' },
    { title: 'TAT Breached', value: '112', delta: '9%', note: 'VS Yesterday', tone: 'red' },
    { title: 'Bill Received', value: '85', delta: '9%', note: 'VS Yesterday', tone: 'teal' },
    { title: 'Fraud Triggered', value: '286', delta: '9%', note: 'VS Yesterday', tone: 'rose' },
];

const DONUT = ['#2563eb', '#7c3aed', '#f59e0b', '#0891b2', '#4f46e5', '#0284c7', '#d97706', '#ea580c', '#16a34a'];
const donut = (rows) => rows.map(([label, value, note], i) => ({ label, value, note, color: DONUT[i % DONUT.length] }));

export const CLAIM_STAGE_CHART = {
    total: '2,450',
    rows: donut([
        ['Intimation', 245, '245(56%)'],
        ['Link Sent', 320, '320(44%)'],
        ['Doc Pending', 410, '410(66%)'],
        ['Survey', 532, '532(03%)'],
        ['AI ILA', 410, '410(03%)'],
        ['ILA', 310, '310(03%)'],
        ['FLA', 120, '120(03%)'],
        ['Recommendation', 50, '50(03%)'],
        ['Settlement', 50, '50(03%)'],
    ]),
};

export const USER_SUMMARY_CHART = {
    total: '245',
    rows: donut([
        ['HO Admin', 6, '6'],
        ['NM', 2, '2'],
        ['RM', 12, '12'],
        ['SM', 25, '25'],
        ['Handler', 98, '98'],
        ['CSM', 45, '45'],
        ['TCT', 28, '28'],
        ['Sr TCT', 18, '18'],
        ['Audit', 11, '11'],
    ]),
};

export const TAT_BREACH_CHART = {
    total: '112',
    rows: donut([
        ['Intimation', 12, '12(56%)'],
        ['Survey', 30, '30(44%)'],
        ['AI ILA', 20, '20(66%)'],
        ['ILA', 25, '25(03%)'],
        ['FLA', 15, '15(03%)'],
        ['Recommendation', 8, '8(03%)'],
    ]),
};

export const CLAIMS_TREND = {
    labels: ['02 May', '03 May', '04 May', '05 May', '06 May', '07 May', '08 May', '09 May', '10 May'],
    series: [
        { color: '#1d4ed8', points: [200, 300, 220, 360, 320, 410, 500] },
        { color: '#f59e0b', points: [90, 130, 110, 180, 160, 230, 280] },
        { color: '#16a34a', points: [50, 60, 50, 65, 80, 110, 105] },
    ],
};

export const CLAIMS_BY_REGION = [
    { label: 'North Region', value: 620 },
    { label: 'South Region', value: 540 },
    { label: 'East Region', value: 430 },
    { label: 'West Region', value: 380 },
    { label: 'Central Region', value: 260 },
    { label: 'North East Region', value: 200 },
];

export const TOP_HANDLERS = [
    { rank: '01', code: 'CH-1001', name: 'Ankit Singh', load: 68 },
    { rank: '02', code: 'CH-1001', name: 'Ankit Singh', load: 68 },
    { rank: '04', code: 'CH-1001', name: 'Ankit Singh', load: 68 },
    { rank: '05', code: 'CH-1001', name: 'Ankit Singh', load: 68 },
];

export const APPROVAL_TYPES = [
    'CLOSE PROXIMITY APPROVAL',
    'WITHDRAW APPROVAL',
    'VEHICLE THEFT APPROVAL',
    'TOTAL LOSS APPROVAL',
    'RESUBMITTED CLAIM APPROVAL',
    'NO CLAIM APPROVAL',
    'SALVAGE APPROVAL',
    'WAIVER APPROVAL',
    'LOSS RESERVE APPROVAL',
    'LOSS PAYMENT APPROVAL',
    'LOSS ESTIMATE APPROVAL',
    'FRAUD APPROVAL',
    'EXPENSES PAYMENT APPROVAL',
    'ACCEPTANCE PAYMENT APPROVAL',
];

export const APPROVAL_KPIS = [
    { title: 'Total Pending', value: '247', delta: '12%', tone: 'blue', icon: 'pending' },
    { title: 'ILA Approval', value: '98', delta: '8%', tone: 'purple', icon: 'ila' },
    { title: 'FLA Approval', value: '64', delta: '6%', tone: 'green', icon: 'fla' },
    { title: 'Payment Approval', value: '45', delta: '10%', tone: 'blue', icon: 'payment', bad: true },
    { title: 'Fraud/Exception', value: '40', delta: '18%', tone: 'red', icon: 'fraud', bad: true },
];

export const APPROVAL_ROWS = ['kurnool', 'bhuneshwar', 'kurnool', 'bhuneshwar', 'kurnool', 'bhuneshwar'].map((branch, i) => ({
    id: `ABCD12345${i + 1}`,
    claimNo: 'ABCD123456',
    branch,
    approvalStatus: 'Pending For Approval',
    claimStatus: 'Open',
    paymentMode: 'RTGS/NEFT',
    amount: '89,75000',
    interest: '00',
    nol: 'OD - Accident - External Means - 01',
    paymentType: 'FLA',
    tat: '2 Days',
    sentAt: '12 Aug 2026, 10:29 AM',
}));

export const INBOX_TILES = [
    { label: 'New Intimation', value: '08', color: '#2563eb' },
    { label: 'Survey', value: '16', color: '#7c3aed' },
    { label: 'ILA', value: '11', color: '#f59e0b' },
    { label: 'Approval', value: '07', color: '#0891b2' },
    { label: 'Settelment', value: '05', color: '#16a34a' },
    { label: 'Closed', value: '15', color: '#64748b' },
];

export const USER_KPIS = [
    { title: 'Total Users', value: '13,480', tone: 'blue' },
    { title: 'Active Users', value: '11,020', tone: 'green' },
    { title: 'Inactive Users', value: '420', tone: 'amber' },
    { title: 'Pending Users', value: '140', tone: 'red' },
];

export const USERS = [
    ['ABG Insurance', 'Manager', 'Active', 'Mumbai HQ'],
    ['ABG Insurance', 'Surveyor', 'Pending', 'Delhi Branch'],
    ['XYZ Surveyors', 'Surveyor', 'Suspended', 'Banglore'],
    ['Global Insurance', 'Admin', 'Active', 'Pune Branch'],
    ['Tayl Assistants', 'Surveyor', 'Pending', 'Kolkata Branch'],
    ['ABG Insurance', 'Manager', 'Suspended', 'Mumbai HQ'],
    ['ABG Insurance', 'Surveyor', 'Active', 'Delhi Branch'],
    ['XYZ Surveyors', 'Surveyor', 'Pending', 'Banglore'],
].map(([organization, role, status, branch], i) => ({
    id: i + 1,
    name: 'Neha Verma',
    organization,
    role,
    status,
    branch,
    lastLogin: '12 Aug 2024,  10:29 AM',
}));

export const ROLE_TABS = [
    'National Manager',
    'Regional Manager',
    'State Manager',
    'Claim Handler',
    'Call Center',
    'Internal Surveyor',
    'External Surveyor',
    'Investigator',
    'TCT',
    'Sr. TCT',
    'Audit',
];

export const PERMISSION_MODULES = [
    'Dashboard',
    'Claim Intimation',
    'Handler Allocation',
    'Surveyor Assignment',
    'Claim Details',
    'AI ILA',
    'Handler ILA',
    'FLA',
    'Payment Recommendation',
    'Approval',
    'Survey Fee Bill',
    'Document/DMS',
    'Requirement Letters',
    'Communication History',
    'Fraud Triggers',
    'TAT & SLA',
    'Workshop Empanelment',
    'Vendor Empanelment',
    'Reports & Analytics',
    'Data Download',
    'Users & Roles',
    'System Configuration',
    'Audit Logs',
];

export const PERMISSION_ACTIONS = ['View', 'Edit', 'Create', 'Approve/Action', 'Download'];

export const BRANCH_KPIS = [
    { title: 'Total Organizations', value: '32', tone: 'blue' },
    { title: 'Active', value: '216', tone: 'green' },
    { title: 'Pending', value: '32', tone: 'amber' },
    { title: 'Suspended', value: '14', tone: 'red' },
];

export const BRANCHES = [
    ['Mumbai HO', 'ABG Insurance', 'Mumbai', 'Active', 'T20'],
    ['Delhi Branch', 'ABG Insurance', 'New Delhi', 'Pending', 'A1'],
    ['Banglore Branch', 'XYZ Surveyors', 'Banglore', 'Suspended', 'B2'],
    ['Pune Branch', 'Global Insurance', 'Pune', 'Active', 'J6'],
    ['Kolkata Branch', 'Tayl Assistants', 'Kolkata', 'Pending', 'J8'],
    ['Mumbai HO', 'ABG Insurance', 'Mumbai', 'Suspended', 'T20'],
    ['Delhi Branch', 'ABG Insurance', 'New Delhi', 'Active', 'A1'],
    ['Banglore Branch', 'XYZ Surveyors', 'Banglore', 'Pending', 'B2'],
].map(([name, organization, city, status, klass], i) => ({ id: i + 1, name, organization, city, status, klass }));

export const AUDIT_KPIS = [
    { title: 'Total Events', value: '2,841', delta: '6.8%', note: 'Vs Last 30 Days', tone: 'blue' },
    { title: 'Users Activity', value: '1,396', delta: '10.2%', note: 'Vs Last 30 Days', tone: 'purple' },
    { title: 'Configuration Changes', value: '327', delta: '12.5%', note: 'Vs Last 30 Days', tone: 'amber' },
    { title: 'Security Events', value: '18', delta: '9.4%', note: 'Vs Last 30 Days', tone: 'teal' },
    { title: 'Failed Action', value: '42', delta: '14.2%', note: 'Vs Last 30 Days', tone: 'green' },
];

export const AUDIT_ROWS = [
    ['Updated ILA', 'Updated', 'Claims', 'Success'],
    ['Allocation Load', 'Created', 'Users', 'Success'],
    ['User Managment', 'Downloaded', 'Reports', 'Success'],
    ['Updated ILA', 'Login', 'System', 'Success'],
    ['Allocation Load', 'Exported', 'Data', 'Success'],
    ['User Managment', 'Updated', 'Claims', 'Failed'],
].map(([update, reference, module, status], i) => ({
    id: `AUD-284${i + 1}`,
    date: '04 Sep 2026,',
    time: '10:42 AM',
    user: 'Raj Kumar',
    role: 'National Manager',
    update,
    reference,
    ip: '192.168.1.45 / Windows',
    module,
    status,
}));

export const AUDIT_BY_MODULE = [
    { label: 'UserManagment', value: 1214 },
    { label: 'Claim Configuration', value: 684 },
    { label: 'Fraud & Controls', value: 421 },
    { label: 'Branches / Offices', value: 268 },
];

export const SECURITY_SUMMARY = [
    ['Successful Logins', '1,182'],
    ['Failed Logins', '24'],
    ['Password Resets', '18'],
    ['Permission Denied', '11'],
];

export const FRAUD_KPIS = [
    { title: 'Active Trigger', value: '126', tone: 'blue' },
    { title: 'Auto Router', value: '386', tone: 'green' },
    { title: 'Critical Open', value: '862', tone: 'amber' },
    { title: 'Audit Queue', value: '24', tone: 'red' },
    { title: 'Auto Cleared', value: '18', tone: 'purple' },
];

export const ROUTING_MATRIX = [
    { id: 'critical', severity: 'Critical', score: '50', action: 'Hold Claim', recipient: 'Audit + Sr.TCT', hold: 'Yes' },
    { id: 'high', severity: 'High', score: '30-49', action: 'Route Review', recipient: 'NM/Audit', hold: 'No' },
    { id: 'medium', severity: 'Medium', score: '15-20', action: 'Handler Review', recipient: 'Handler', hold: 'No' },
    { id: 'low', severity: 'Low', score: '1-14', action: 'Log & Monitor', recipient: 'System', hold: 'No' },
];

export const OPEN_TRIGGERS = [
    { claim: 'CLM-10284', trigger: 'Duplicate Document', route: 'Audit' },
    { claim: 'CLM-10172', trigger: 'Damage Mismatch', route: 'Handler review' },
    { claim: 'CLM-10091', trigger: 'Multiple claim', route: 'Audit' },
];

export const SAFEGUARDS = [
    'Critical Trigger Blocks Auto Approval',
    'High trigger requires review action',
    'Every routing action is logged',
    'Override requires reason',
];

export const FRAUD_RULES = [
    { id: 'r1', rule: 'Multiple Claims Same Vehicle', stage: 'Intimation', severity: 'High', score: 35, condition: 'Three claims in 90 days', action: 'Root to audit' },
    { id: 'r2', rule: 'Damage Mismatch', stage: 'AI ILA', severity: 'High', score: 30, condition: 'AI Damage differs from declared loss', action: 'Angular review' },
    { id: 'r3', rule: 'High Amount Expectation', stage: 'Recommendation', severity: 'Medium', score: 20, condition: 'Recommmendation exist threshold', action: 'Senior approval' },
    { id: 'r4', rule: 'Duplicate Document', stage: 'Claim Details', severity: 'Critical', score: 50, condition: 'Same document Hash used in another claim', action: 'Hold claim' },
];

export const RULE_DESIGN = [
    'Use objective evidence and configurable thresholds.',
    'Separate trigger score from final claim decision.',
    'Critical triggers can block auto approval.',
    'Every trigger and override is auditable.',
];

export const TRIGGER_HISTORY = [
    { id: 1, at: '27 sep 17:48', claim: 'CLM - 10284', trigger: 'Duplicate document', score: 50, route: 'Audit', reviewer: 'Sr TCT', status: 'Open' },
    { id: 2, at: '27 sep 17:48', claim: 'CLM-10283', trigger: 'Damage mismatch', score: 30, route: 'Handler review', reviewer: 'Amit das', status: 'Under review' },
    { id: 3, at: '27 sep 17:48', claim: 'CLM-10282', trigger: 'Multiple claims', score: 35, route: 'Audit', reviewer: 'Audit queue', status: 'Escalated' },
    { id: 4, at: '27 sep 17:48', claim: 'CLM-10281', trigger: 'High amount', score: 20, route: 'Senior approval', reviewer: 'RCM West', status: 'Cleared' },
];

export const API_INTEGRATIONS = [
    { name: 'Policy/LOS API', line1: 'Policy - Customer & Claim Data', line2: 'RESET API - Production', type: 'Reset API', status: 'Connected' },
    { name: 'Vehicle/RC Verification', line1: 'Vehicle & Registration Verification', line2: 'Last sync Today 10:45 AM', type: 'API', status: 'Connected' },
    { name: 'Communication Gateway', line1: 'SMS/Email/Whatsapp', line2: 'Response Time 2.4 sec', type: 'Gateway', status: 'Warning' },
];

export const COMPLIANCE_ROWS = [
    { at: '20 September 2026 10:24 AM', user: 'Super Admin', activity: 'Updated API Configuration', module: 'API Integration', status: 'Success' },
    { at: '20 September 2026 10:24 AM', user: 'System', activity: 'Security Patch', module: 'System Update', status: 'Success' },
    { at: '20 September 2026 10:24 AM', user: 'Super Admin', activity: 'Change Retention policy', module: 'Compilance', status: 'Approval Log' },
];

export const SURVEYORS = [
    { id: 1, name: 'Amit Das', code: 'SV-1021', type: 'Internal Surveyor', branch: 'Mumbai HQ', status: 'Active', open: 12 },
    { id: 2, name: 'Neha Verma', code: 'SV-1022', type: 'External Surveyor', branch: 'Delhi Branch', status: 'Pending', open: 4 },
    { id: 3, name: 'Rohit Jain', code: 'SV-1023', type: 'External Surveyor', branch: 'Banglore', status: 'Suspended', open: 0 },
    { id: 4, name: 'Priya Singh', code: 'SV-1024', type: 'Internal Surveyor', branch: 'Pune Branch', status: 'Active', open: 9 },
];

export const TAT_ROWS = [
    { stage: 'Intimation', target: '30 min', breached: 12, onTrack: 233 },
    { stage: 'Survey', target: '24 hrs', breached: 30, onTrack: 502 },
    { stage: 'AI ILA', target: '3 hrs', breached: 20, onTrack: 390 },
    { stage: 'ILA', target: '24 hrs', breached: 25, onTrack: 285 },
    { stage: 'FLA', target: '48 hrs', breached: 15, onTrack: 105 },
    { stage: 'Recommendation', target: '24 hrs', breached: 8, onTrack: 42 },
];
