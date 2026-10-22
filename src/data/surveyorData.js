/** Surveyor Assignment screen (surveyors come from GET /surveyors). */

export const SURVEY_TABS = [
    { key: 'spot', label: 'Spot Survey Allocation', hint: 'Allocation A Surveyor For Spot Survey. The Survey Link Will Be Sent To The Assigned Surveyor.' },
    { key: 'final', label: 'Final Survey Allocation', hint: 'Allocation A Surveyor For Final Survey. The Survey Link Will Be Sent To The Assigned Surveyor.' },
];

export const SURVEYOR_TYPE_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Internal Surveyor', value: 'internal' },
    { label: 'External Surveyor', value: 'external' },
];
