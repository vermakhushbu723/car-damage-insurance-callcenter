/** Handler Allocation screen (handlers themselves come from GET /handlers). */

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
