import {
    AppstoreOutlined,
    BarChartOutlined,
    CustomerServiceOutlined,
    DeploymentUnitOutlined,
    FileTextOutlined,
    HomeOutlined,
    LoadingOutlined,
    ShopOutlined,
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
            { key: 'all-claims', label: 'All Claims', path: ROUTES.allClaims, module: M.dashboard },
            { key: 'new-assigned', label: 'New/Assigned', path: ROUTES.newAssigned, module: M.dashboard },
            { key: 'claim-details', label: 'Claim Details', path: ROUTES.claimDetails, module: M.details },
            { key: 'ai-ila', label: 'AI ILA Pending', path: ROUTES.aiIla, module: M.aiIla },
            { key: 'handler-ila', label: 'Handler ILA Pending', path: ROUTES.handlerIla, module: M.handlerIla },
            { key: 'fla-pending', label: 'FLA Pending', path: ROUTES.flaPending, module: M.fla },
            { key: 'payment-recommendation', label: 'Payment Recommendation', path: ROUTES.paymentRecommendation, module: M.payment },
        ],
    },
    {
        key: 'claim-processing',
        label: 'Claim Processing',
        icon: LoadingOutlined,
        children: [
            { key: 'intimation', label: 'Intimation', path: ROUTES.intimation, module: M.intimation },
            { key: 'handler-allocation', label: 'Handler Allocation', path: ROUTES.handlerAllocation, module: M.handler },
            { key: 'surveyor-assignment', label: 'Surveyor Assignment', path: ROUTES.surveyorAssignment, module: M.surveyor },
            { key: 'survey-paybill', label: 'Survey Paybill', path: ROUTES.surveyPaybill, module: M.paybill },
            { key: 'issue-letter', label: 'Issue Letter', path: ROUTES.issueLetter, module: M.letters },
        ],
    },
    { key: 'documents-dms', label: 'Documents DMS', icon: FileTextOutlined, path: ROUTES.documentsDms, module: M.dms },
    { key: 'communication', label: 'Communication', icon: CustomerServiceOutlined, path: ROUTES.communication, module: M.communication },
    { key: 'workshop', label: 'Workshop', icon: ShopOutlined, path: ROUTES.workshop, module: M.workshop },
    { key: 'reports', label: 'Report & Analytics', icon: BarChartOutlined, path: ROUTES.reports, module: M.reports },
    { key: 'my-account', label: 'My Account', icon: UserOutlined, path: ROUTES.myAccount },
];

/** Reachable from the claim action bar rather than the rail. */
export const EXTRA_ROUTES = [
    { key: 'communication-history', label: 'Communication History', path: ROUTES.communicationHistory, module: M.communication },
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
