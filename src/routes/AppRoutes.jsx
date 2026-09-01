import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
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
    [ROUTES.handlerIla]: <LiabilityAssessmentPage />,
    [ROUTES.paymentRecommendation]: <PaymentRecommendationPage />,
    [ROUTES.surveyPaybill]: <SurveyPaybillPage />,
    [ROUTES.issueLetter]: <IssueLetterPage />,
    [ROUTES.documentsDms]: <DocumentsDmsPage />,
    [ROUTES.communication]: <ClaimCommunicationPage />,
    [ROUTES.communicationHistory]: <CommunicationHistoryPage />,
};

/**
 * One shell for the whole app. Routes are generated from the sidebar config,
 * so the menu and the router can never fall out of sync.
 */
export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                {flattenNav().map((item) => (
                    <Route
                        key={item.key}
                        path={item.path}
                        element={PAGES[item.path] || <PlaceholderPage title={item.label} />}
                    />
                ))}
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
        </Routes>
    );
}
