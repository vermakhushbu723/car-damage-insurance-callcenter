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
    { key: 'dashboard', label: 'Dashboard', icon: AppstoreOutlined, path: ROUTES.dashboard },
    {
        key: 'my-claims',
        label: 'My Claims',
        icon: DeploymentUnitOutlined,
        children: [
            { key: 'all-claims', label: 'All Claims', path: ROUTES.allClaims },
            { key: 'new-assigned', label: 'New/Assigned', path: ROUTES.newAssigned },
            { key: 'claim-details', label: 'Claim Details', path: ROUTES.claimDetails },
            { key: 'ai-ila', label: 'AI ILA Pending', path: ROUTES.aiIla },
            { key: 'handler-ila', label: 'Handler ILA Pending', path: ROUTES.handlerIla },
            { key: 'fla-pending', label: 'FLA Pending', path: ROUTES.flaPending },
            { key: 'payment-recommendation', label: 'Payment Recommendation', path: ROUTES.paymentRecommendation },
        ],
    },
    {
        key: 'claim-processing',
        label: 'Claim Processing',
        icon: LoadingOutlined,
        children: [
            { key: 'intimation', label: 'Intimation', path: ROUTES.intimation },
            { key: 'handler-allocation', label: 'Handler Allocation', path: ROUTES.handlerAllocation },
            { key: 'surveyor-assignment', label: 'Surveyor Assignment', path: ROUTES.surveyorAssignment },
            { key: 'survey-paybill', label: 'Survey Paybill', path: ROUTES.surveyPaybill },
            { key: 'issue-letter', label: 'Issue Letter', path: ROUTES.issueLetter },
        ],
    },
    { key: 'documents-dms', label: 'Documents DMS', icon: FileTextOutlined, path: ROUTES.documentsDms },
    { key: 'communication', label: 'Communication', icon: CustomerServiceOutlined, path: ROUTES.communication },
    { key: 'workshop', label: 'Workshop', icon: ShopOutlined, path: ROUTES.workshop },
    { key: 'reports', label: 'Report & Analytics', icon: BarChartOutlined, path: ROUTES.reports },
    { key: 'my-account', label: 'My Account', icon: UserOutlined, path: ROUTES.myAccount },
];

/** Reachable from the claim action bar rather than the rail. */
export const EXTRA_ROUTES = [
    { key: 'communication-history', label: 'Communication History', path: ROUTES.communicationHistory },
];

/** Flattened nav – handy for route generation. */
export const flattenNav = (items = SIDE_NAV_ITEMS) => [
    ...items.flatMap((item) => (item.children ? item.children : [item])),
    ...EXTRA_ROUTES,
];

export const CURRENT_USER = {
    name: 'User Name',
    sidebarName: 'Rajesh Kumar',
    role: 'CSM',
};

