import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage.jsx';
import ClaimsListPage from '../pages/claims/ClaimsListPage.jsx';
import IntimationPage from '../pages/intimation/IntimationPage.jsx';
import HandlerAllocationPage from '../pages/claims/HandlerAllocationPage.jsx';
import SurveyorAssignmentPage from '../pages/claims/SurveyorAssignmentPage.jsx';
import ClaimDetailsPage from '../pages/claims/ClaimDetailsPage.jsx';
import AiIlaPage from '../pages/claims/AiIlaPage.jsx';
import LiabilityAssessmentPage from '../pages/claims/LiabilityAssessmentPage.jsx';
import PaymentRecommendationPage from '../pages/claims/PaymentRecommendationPage.jsx';
import SurveyPaybillPage from '../pages/claims/SurveyPaybillPage.jsx';
import IssueLetterPage from '../pages/letters/IssueLetterPage.jsx';
import DocumentsDmsPage from '../pages/documents/DocumentsDmsPage.jsx';
import ClaimCommunicationPage from '../pages/communication/ClaimCommunicationPage.jsx';
import CommunicationHistoryPage from '../pages/communication/CommunicationHistoryPage.jsx';
import PlaceholderPage from '../pages/placeholders/PlaceholderPage.jsx';
import NoAccess from '../pages/placeholders/NoAccess.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import { useAppState } from '../context/AppContext.jsx';
import { needsRolePick } from '../auth/session.js';
import { flattenNav } from '../constants/navigation.js';
import { NM_ROUTES, isApprover, isClaimHandler, isNationalManager } from '../constants/nationalManager.js';
import ApproverDashboardPage from '../pages/approver/ApproverDashboardPage.jsx';
import ChDashboardPage from '../pages/handler/ChDashboardPage.jsx';
import NmDashboardPage from '../pages/national/NmDashboardPage.jsx';
import NmApprovalsPage from '../pages/national/NmApprovalsPage.jsx';
import NmInboxPage from '../pages/national/NmInboxPage.jsx';
import NmSearchClaimsPage from '../pages/national/NmSearchClaimsPage.jsx';
import NmClaimProcessPage from '../pages/national/NmClaimProcessPage.jsx';
import { NmBranchesPage, NmRolesPage, NmSurveyorsPage, NmUsersPage } from '../pages/national/NmManagementPages.jsx';
import NmWorkshopPage from '../pages/national/NmWorkshopPage.jsx';
import { NmAuditPage, NmFraudPage, NmTatMonitorPage } from '../pages/national/NmReportsPages.jsx';
import NmSystemPage from '../pages/national/NmSystemPage.jsx';
import ROUTES from '../constants/routes.js';

/** Screens that are built. Everything else in the rail gets a placeholder. */
const PAGES = {
    [ROUTES.dashboard]: <DashboardPage />,
    [ROUTES.intimation]: <IntimationPage />,
    [ROUTES.handlerAllocation]: <HandlerAllocationPage />,
    [ROUTES.surveyorAssignment]: <SurveyorAssignmentPage />,
    [ROUTES.claimDetails]: <ClaimDetailsPage />,
    [ROUTES.aiIla]: <AiIlaPage />,
    [ROUTES.handlerIla]: <LiabilityAssessmentPage kind="liability" />,
    [ROUTES.flaPending]: <LiabilityAssessmentPage kind="fla" />,
    [ROUTES.analytics]: <AnalyticsPage />,
    [ROUTES.totalIntimation]: <ClaimsListPage view="total" />,
    [ROUTES.newIntimations]: <ClaimsListPage view="new" />,
    [ROUTES.pendingAllocation]: <ClaimsListPage view="pending" />,
    [ROUTES.linkSent]: <ClaimsListPage view="link" />,
    [ROUTES.viewClaim]: <ClaimsListPage view="all" />,
    [ROUTES.paymentRecommendation]: <PaymentRecommendationPage />,
    [ROUTES.surveyPaybill]: <SurveyPaybillPage />,
    [ROUTES.issueLetter]: <IssueLetterPage />,
    [ROUTES.documentsDms]: <DocumentsDmsPage />,
    [ROUTES.communication]: <ClaimCommunicationPage />,
    [ROUTES.communicationHistory]: <CommunicationHistoryPage />,
};

/** Screens of the National Manager role; any other role goes back to its own home. */
const NM_PAGES = {
    [NM_ROUTES.approvals]: <NmApprovalsPage />,
    [NM_ROUTES.inbox]: <NmInboxPage />,
    [NM_ROUTES.searchClaims]: <NmSearchClaimsPage />,
    [NM_ROUTES.claimProcess]: <NmClaimProcessPage />,
    [NM_ROUTES.users]: <NmUsersPage />,
    [NM_ROUTES.roles]: <NmRolesPage />,
    [NM_ROUTES.branches]: <NmBranchesPage />,
    [NM_ROUTES.surveyors]: <NmSurveyorsPage />,
    [NM_ROUTES.workshop]: <NmWorkshopPage />,
    [NM_ROUTES.tatMonitor]: <NmTatMonitorPage />,
    [NM_ROUTES.fraud]: <NmFraudPage />,
    [NM_ROUTES.audit]: <NmAuditPage />,
    [NM_ROUTES.system]: <NmSystemPage />,
};

function RequireNationalManager({ children }) {
    const { user } = useAppState();
    return isNationalManager(user) ? children : <Navigate to={ROUTES.dashboard} replace />;
}

/** Signed-in users only; everyone else goes to /login and comes back after. */
function RequireAuth({ children }) {
    const { user } = useAppState();
    const location = useLocation();
    if (!user || user.mustChangePassword || needsRolePick()) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    return children;
}

/** The role must be allowed to view the page's module (Admin > Roles & Permissions). */
function Guard({ item, children }) {
    const { can, user } = useAppState();
    // Same "/" for every role: the National Manager gets its own dashboard there.
    if (item.path === ROUTES.dashboard && isNationalManager(user)) return <NmDashboardPage />;
    if (item.path === ROUTES.dashboard && isClaimHandler(user) && can(item.module)) return <ChDashboardPage />;
    if (item.path === ROUTES.dashboard && isApprover(user) && can(item.module)) return <ApproverDashboardPage />;
    return can(item.module) ? children : <NoAccess title={item.label} />;
}

/**
 * One shell for the whole app. Routes are generated from the sidebar config,
 * so the menu and the router can never fall out of sync.
 */
export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                element={
                    <RequireAuth>
                        <AppLayout />
                    </RequireAuth>
                }
            >
                {flattenNav().map((item) => (
                    <Route
                        key={item.key}
                        path={item.path}
                        element={<Guard item={item}>{PAGES[item.path] || <PlaceholderPage title={item.label} />}</Guard>}
                    />
                ))}
                {Object.entries(NM_PAGES).map(([path, page]) => (
                    <Route key={path} path={path} element={<RequireNationalManager>{page}</RequireNationalManager>} />
                ))}
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
        </Routes>
    );
}
