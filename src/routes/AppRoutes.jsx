import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage.jsx';
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
import { flattenNav } from '../constants/navigation.js';
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
    [ROUTES.paymentRecommendation]: <PaymentRecommendationPage />,
    [ROUTES.surveyPaybill]: <SurveyPaybillPage />,
    [ROUTES.issueLetter]: <IssueLetterPage />,
    [ROUTES.documentsDms]: <DocumentsDmsPage />,
    [ROUTES.communication]: <ClaimCommunicationPage />,
    [ROUTES.communicationHistory]: <CommunicationHistoryPage />,
};

/** Signed-in users only; everyone else goes to /login and comes back after. */
function RequireAuth({ children }) {
    const { user } = useAppState();
    const location = useLocation();
    if (!user || user.mustChangePassword) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    return children;
}

/** The role must be allowed to view the page's module (Admin > Roles & Permissions). */
function Guard({ item, children }) {
    const { can } = useAppState();
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
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
        </Routes>
    );
}
