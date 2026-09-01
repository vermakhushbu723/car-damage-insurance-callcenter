/** Surveyor Assignment screen. */

export const SURVEY_TABS = [
    { key: 'spot', label: 'Spot Survey Allocation', hint: 'Allocation A Surveyor For Spot Survey. The Survey Link Will Be Sent To The Assigned Surveyor.' },
    { key: 'final', label: 'Final Survey Allocation', hint: 'Allocation A Surveyor For Final Survey. The Survey Link Will Be Sent To The Assigned Surveyor.' },
];

export const SURVEYOR_TYPE_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Internal Surveyor', value: 'internal' },
    { label: 'External Surveyor', value: 'external' },
];

export const CITY_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Noida', value: 'noida' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Ghaziabad', value: 'ghaziabad' },
];

export const STATE_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Uttar Pradesh', value: 'up' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Haryana', value: 'haryana' },
];

export const SURVEYORS = Array.from({ length: 6 }, (_, index) => ({
    key: String(index + 1),
    name: 'Suresh  Sharma',
    surveyorId: 'SUR-1001',
    type: 'Internal Surveyor',
    location: 'Noida,UP',
    currentLoad: '12/25',
    availability: 'Availability',
}));

export const SELECTED_SURVEYOR = {
    name: 'Suresh Sharma',
    type: 'Internal Surveyor',
    surveyorId: 'SUR-1001',
    phone: '+91 1234567890',
    email: 'Suresh.Sharma@Ibima.Com',
    address: 'Suresh.Sharma@Ibima.Com',
    stats: [
        { key: 'load', label: 'Current Load', value: '12/25' },
        { key: 'experience', label: 'Experience', value: '08 Years' },
        { key: 'rating', label: 'Rating', value: '4.6/5' },
    ],
};

export const ASSIGNMENT_HISTORY = [
    {
        key: 'auto',
        title: 'Auto Allocation',
        tone: 'green',
        time: '01 May 2025, 11:05 AM',
        detail: 'System Tried To Auto Allocate Surveyor Based On Location',
    },
    {
        key: 'manual',
        title: 'Manually Assigned',
        tone: 'blue',
        time: '01 May 2025, 11:05 AM',
        detail: 'Assigned To Suresh Sharma (SUR-1001) By Rajesh Kumar',
    },
];

export const SURVEYOR_TOTAL_PAGES = 58;
