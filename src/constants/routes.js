/** Every path in the app lives here so links never go stale. */
export const ROUTES = {
    dashboard: '/',
    analytics: '/dashboard/analytics',

    // My Claims (same lists as the dashboard KPI tiles)
    totalIntimation: '/claims/total-intimation',
    newIntimations: '/claims/new-intimations',
    pendingAllocation: '/claims/pending-allocation',
    linkSent: '/claims/link-sent',
    viewClaim: '/claims/view',

    // Claim screens (opened from a claim, not from the rail)
    claimDetails: '/claims/details',
    aiIla: '/claims/ai-ila',
    handlerIla: '/claims/handler-ila',
    flaPending: '/claims/fla',
    paymentRecommendation: '/claims/payment-recommendation',

    // Claim processing steps
    intimation: '/claim-processing/intimation',
    handlerAllocation: '/claim-processing/handler-allocation',
    surveyorAssignment: '/claim-processing/surveyor-assignment',
    surveyPaybill: '/claim-processing/survey-paybill',
    issueLetter: '/claim-processing/issue-letter',

    // Rest of the rail
    documentsDms: '/documents-dms',
    communication: '/communication',
    communicationHistory: '/communication/history',
    reports: '/reports',
    myAccount: '/my-account',
};

export default ROUTES;
