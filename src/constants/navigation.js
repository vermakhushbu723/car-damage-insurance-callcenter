import {
    AppstoreOutlined,
    BarChartOutlined,
    CustomerServiceOutlined,
    DeploymentUnitOutlined,
    FileTextOutlined,
    HomeOutlined,
    UserOutlined,
} from '@ant-design/icons';

import ROUTES from './routes.js';

/**
 * Permission modules of Admin > Roles & Permissions. A menu entry shows only
 * when the signed-in user's role may at least view its module; the backend
 * enforces the same rule on every call.
 */
export const MODULES = {
    dashboard: 'Dashboard',
    intimation: 'Claim Intimation',
    handler: 'Handler Allocation',
    surveyor: 'Surveyor Assignment',
    details: 'Claim Details',
    aiIla: 'AI ILA',
    handlerIla: 'Handler ILA',
    fla: 'FLA',
    payment: 'Payment Recommendation',
    paybill: 'Survey Fee Bill',
    dms: 'Document/DMS',
    letters: 'Requirement Letters',
    communication: 'Communication History',
    workshop: 'Workshop Empanelment',
    reports: 'Reports & Analytics',
};
const M = MODULES;

/** Links in the blue application bar. */
export const TOP_NAV_ITEMS = [
    { key: 'home', label: 'Home', icon: HomeOutlined, path: ROUTES.dashboard },
    { key: 'training', label: 'Process & Training', icon: AppstoreOutlined, path: ROUTES.dashboard },
    { key: 'contact', label: 'Contact Us', icon: CustomerServiceOutlined, path: ROUTES.dashboard },
];

/**
 * The single navigation source for the whole app.
 * The sidebar renders it and `AppRoutes` builds its routes from it,
 * so a new entry here is a new working page.
 */
export const SIDE_NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: AppstoreOutlined, path: ROUTES.dashboard, module: M.dashboard },
    {
        key: 'my-claims',
        label: 'My Claims',
        icon: DeploymentUnitOutlined,
        children: [
            { key: 'total-intimation', label: 'Total Intimation', path: ROUTES.totalIntimation, module: M.dashboard },
            { key: 'new-intimations', label: 'New Intimations', path: ROUTES.newIntimations, module: M.dashboard },
            { key: 'pending-allocation', label: 'Pending Allocation', path: ROUTES.pendingAllocation, module: M.dashboard },
            { key: 'link-sent', label: 'Link Sent', path: ROUTES.linkSent, module: M.dashboard },
            { key: 'view-claim', label: 'View Claim', path: ROUTES.viewClaim, module: M.dashboard },
        ],
    },
    { key: 'documents-dms', label: 'Documents DMS', icon: FileTextOutlined, path: ROUTES.documentsDms, module: M.dms },
    { key: 'communication', label: 'Communication', icon: CustomerServiceOutlined, path: ROUTES.communication, module: M.communication },
    { key: 'reports', label: 'Report & Analytics', icon: BarChartOutlined, path: ROUTES.reports, module: M.reports },
    { key: 'my-account', label: 'My Account', icon: UserOutlined, path: ROUTES.myAccount },
];

/**
 * Not in the rail: the claim journey screens (opened from a claim, its stage
 * tracker or "Intimate New Claim") and pages reached from the claim action bar.
 */
export const EXTRA_ROUTES = [
    { key: 'analytics', label: 'Call Center / CSM Dashboard', path: ROUTES.analytics, module: M.dashboard },
    { key: 'communication-history', label: 'Communication History', path: ROUTES.communicationHistory, module: M.communication },
    { key: 'intimation', label: 'Intimation', path: ROUTES.intimation, module: M.intimation },
    { key: 'handler-allocation', label: 'Handler Allocation', path: ROUTES.handlerAllocation, module: M.handler },
    { key: 'surveyor-assignment', label: 'Surveyor Assignment', path: ROUTES.surveyorAssignment, module: M.surveyor },
    { key: 'claim-details', label: 'Claim Details', path: ROUTES.claimDetails, module: M.details },
    { key: 'ai-ila', label: 'AI ILA', path: ROUTES.aiIla, module: M.aiIla },
    { key: 'handler-ila', label: 'Handler ILA', path: ROUTES.handlerIla, module: M.handlerIla },
    { key: 'fla-pending', label: 'FLA', path: ROUTES.flaPending, module: M.fla },
    { key: 'payment-recommendation', label: 'Payment Recommendation', path: ROUTES.paymentRecommendation, module: M.payment },
    { key: 'survey-paybill', label: 'Survey Paybill', path: ROUTES.surveyPaybill, module: M.paybill },
    { key: 'issue-letter', label: 'Issue Letter', path: ROUTES.issueLetter, module: M.letters },
];

/** Flattened nav – handy for route generation. */
export const flattenNav = (items = SIDE_NAV_ITEMS) => [
    ...items.flatMap((item) => (item.children ? item.children : [item])),
    ...EXTRA_ROUTES,
];

/** Menu entries the user's role can open (groups without visible children disappear). */
export const navForUser = (canView) =>
    SIDE_NAV_ITEMS.map((item) => (item.children ? { ...item, children: item.children.filter((c) => canView(c.module)) } : item)).filter(
        (item) => (item.children ? item.children.length > 0 : canView(item.module))
    );

/** Where a role lands after sign-in / a role switch: its dashboard, else its first screen. */
export const landingFor = (canView) => {
    if (canView(MODULES.dashboard)) return ROUTES.dashboard;
    const claimScreens = EXTRA_ROUTES.filter((r) => r.path.startsWith('/claim') && canView(r.module));
    const first = [...claimScreens, ...navForUser(canView).flatMap((item) => (item.children ? item.children : [item]))][0];
    return first?.path ?? ROUTES.dashboard;
};
