/** Every path in the app lives here so links never go stale. */
export const ROUTES = {
    dashboard: '/',

    // My Claims
    allClaims: '/claims/all',
    newAssigned: '/claims/new-assigned',
    claimDetails: '/claims/details',
    aiIla: '/claims/ai-ila',
    handlerIla: '/claims/handler-ila',
    flaPending: '/claims/fla',
    paymentRecommendation: '/claims/payment-recommendation',

    // Claim Processing
    intimation: '/claim-processing/intimation',
    handlerAllocation: '/claim-processing/handler-allocation',
    surveyorAssignment: '/claim-processing/surveyor-assignment',
    surveyPaybill: '/claim-processing/survey-paybill',
    issueLetter: '/claim-processing/issue-letter',

    // Rest of the rail
    documentsDms: '/documents-dms',
    communication: '/communication',
    communicationHistory: '/communication/history',
    workshop: '/workshop',
    reports: '/reports',
    myAccount: '/my-account',
};

export default ROUTES;
