import {
    AppstoreOutlined,
    AuditOutlined,
    BankOutlined,
    CheckSquareOutlined,
    ClockCircleOutlined,
    DeploymentUnitOutlined,
    InboxOutlined,
    KeyOutlined,
    SafetyCertificateOutlined,
    SearchOutlined,
    SettingOutlined,
    TeamOutlined,
    ToolOutlined,
    UserSwitchOutlined,
} from '@ant-design/icons';

import { can } from '../auth/session.js';
import { landingFor } from './navigation.js';
import ROUTES from './routes.js';

/**
 * National Manager (Figma: NATIONAL MANAGER SCREENS AS FOR SERVICE PROVIDER).
 * Same portal and login as the call center; these screens appear when the
 * signed-in user's active role is the one below (see `isNationalManager`).
 */
export const NM_ROLE_KEY = 'national-manager';
export const isNationalManager = (user) => user?.roleKey === NM_ROLE_KEY;

/** Where `user` lands after picking a role: that role's dashboard. */
export const landingForUser = (user) => (isNationalManager(user) ? ROUTES.dashboard : landingFor((m) => can(user, m)));

/** Claim Handler (Figma: CHM DASHBOARDS SCREENS AS FOR SERVICE PROVIDER). */
export const CH_ROLE_KEY = 'claim-handler';
export const isClaimHandler = (user) => user?.roleKey === CH_ROLE_KEY;

/** State / Regional Claim Managers (Figma: SCM/RCM DASHBOARD SCREENS AS FOR SERVICE PROVIDER). */
export const APPROVER_ROLE_KEYS = ['state-manager', 'regional-manager'];
export const isApprover = (user) => APPROVER_ROLE_KEYS.includes(user?.roleKey);

export const NM_ROUTES = {
    dashboard: ROUTES.dashboard,
    approvals: '/nm/approvals',
    inbox: '/nm/inbox',
    searchClaims: '/nm/search-claims',
    claimProcess: '/nm/claim-process',
    users: '/nm/users',
    roles: '/nm/roles',
    branches: '/nm/branches',
    surveyors: '/nm/surveyors',
    workshop: '/nm/workshop',
    tatMonitor: '/nm/tat-monitor',
    fraud: '/nm/fraud-triggers',
    audit: '/nm/audit-quality',
    system: '/nm/system-configuration',
};

/** The rail of the National Manager, section by section. */
export const NM_NAV = [
    {
        section: 'MAIN',
        items: [
            { key: 'nm-dashboard', label: 'Dashboard', icon: AppstoreOutlined, path: NM_ROUTES.dashboard },
            { key: 'nm-approvals', label: 'My Approvals', icon: CheckSquareOutlined, path: NM_ROUTES.approvals },
            { key: 'nm-inbox', label: 'Inbox', icon: InboxOutlined, path: NM_ROUTES.inbox },
            { key: 'nm-search', label: 'Search Claims', icon: SearchOutlined, path: NM_ROUTES.searchClaims },
            { key: 'nm-process', label: 'Claim Process', icon: DeploymentUnitOutlined, path: NM_ROUTES.claimProcess },
        ],
    },
    {
        section: 'MANAGEMENT',
        items: [
            { key: 'nm-users', label: 'Users', icon: TeamOutlined, path: NM_ROUTES.users },
            { key: 'nm-roles', label: 'Roles & Permission', icon: KeyOutlined, path: NM_ROUTES.roles },
            { key: 'nm-branches', label: 'Branch /Offices', icon: BankOutlined, path: NM_ROUTES.branches },
            { key: 'nm-surveyors', label: 'Surveyors', icon: UserSwitchOutlined, path: NM_ROUTES.surveyors },
            { key: 'nm-workshop', label: 'Workshop', icon: ToolOutlined, path: NM_ROUTES.workshop },
        ],
    },
    {
        section: 'REPORTS & ANALYTICS',
        items: [
            { key: 'nm-tat', label: 'TAT  Monitor', icon: ClockCircleOutlined, path: NM_ROUTES.tatMonitor },
            { key: 'nm-fraud', label: 'Fraud Triggers', icon: SafetyCertificateOutlined, path: NM_ROUTES.fraud },
            { key: 'nm-audit', label: 'Audit & Quality', icon: AuditOutlined, path: NM_ROUTES.audit },
        ],
    },
    {
        section: 'SYSTEM',
        items: [{ key: 'nm-system', label: 'System Configuration', icon: SettingOutlined, path: NM_ROUTES.system }],
    },
];

/** Claim Process tiles, in the Service Provider journey (Figma: Claim Journey - As Service Provider). */
export const NM_PROCESS_TABS = [
    { key: 'intimation', label: 'Intimations', stages: ['intimation'], pendingFor: 'Handler Allocation', color: '#0b4fc9' },
    { key: 'handler-allocation', label: 'Handler allocation', stages: ['handler-allocation'], pendingFor: 'Claim Details', color: '#0f766e' },
    { key: 'claim-details', label: 'Claim Details', stages: ['claim-details'], pendingFor: 'AI ILA', color: '#0284c7' },
    { key: 'ai-ila', label: 'AI ILA', stages: ['ai-ila'], pendingFor: 'Handler ILA', color: '#9333ea' },
    { key: 'handler-ila', label: 'Handler ILA', stages: ['fla'], pendingFor: 'FLA', color: '#059669' },
    { key: 'fla', label: 'FLA', stages: ['payment-recommendation'], pendingFor: 'Fee Bill', color: '#d97706' },
    { key: 'fee-bill', label: 'Fee Bill', stages: ['survey-paybill'], pendingFor: 'Submitted to insurer', color: '#475569' },
];
