/** KPI tiles on the intimation dashboard; `key` = field of GET /dashboard `stats`. */
export const DASHBOARD_STATS = [
    {
        key: 'totalIntimation',
        title: 'Total Intimation',
        caption: 'All Time Registered',
        tone: 'blue',
        icon: 'file',
    },
    {
        key: 'newIntimations',
        title: 'New Intimations',
        caption: 'In Last 24 Hours',
        tone: 'green',
        icon: 'file-add',
    },
    {
        key: 'pendingAllocation',
        title: 'Pending Allocation',
        caption: 'Awaiting Handler Assignment',
        tone: 'orange',
        icon: 'pending',
    },
    {
        key: 'linkSent',
        title: 'Link Sent',
        caption: 'Survey Links Sent',
        tone: 'purple',
        icon: 'send',
    },
];

export const PRIORITY_TONES = {
    High: 'bg-red-100 text-red-600',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-emerald-100 text-emerald-700',
};

