/** Handler Allocation screen. */

export const CURRENT_HANDLER = {
    name: 'Rahul Kumar',
    role: 'Claims Handler',
    team: 'Noida Claims Team',
    location: 'Noida, Uttar Pradesh - 201301',
    workshop: 'ABC Motors, Noida',
    assignedOn: '01 May 2025, 10:47 AM',
    assignmentMethod: 'Auto(Based On LOS Location, PIN, Workshop)',
};

export const REASSIGNMENT_REASONS = [
    { label: 'Workload Balancing', value: 'workload' },
    { label: 'Handler On Leave', value: 'leave' },
    { label: 'Location Mismatch', value: 'location' },
    { label: 'Escalation', value: 'escalation' },
];

export const REASSIGNMENT_REMARKS = [
    { label: 'Reassigned On Request', value: 'on-request' },
    { label: 'Reassigned By Supervisor', value: 'supervisor' },
    { label: 'Other', value: 'other' },
];

export const HANDLER_FILTERS = [
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'pin', label: 'PIN' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'team', label: 'Team' },
    { key: 'availability', label: 'Availability' },
];

export const FILTER_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Noida', value: 'noida' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Ghaziabad', value: 'ghaziabad' },
];

export const AVAILABLE_HANDLERS = Array.from({ length: 3 }, (_, index) => ({
    key: String(index + 1),
    name: 'Suresh Sharma',
    handler: 'Letter Sent',
    handlerNote: 'Acknowledge Letter',
    location: 'Noida',
    locationNote: '(UP)',
    currentLoad: '18/30',
    status: 'Available',
}));
