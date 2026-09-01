import { PRIORITY_TONES } from '../../data/dashboardData.js';
import cn from '../../utils/cn.js';

const headerClass = 'text-[11.5px] font-semibold text-slate-900';
const cellClass = 'text-[11.5px] text-slate-700';

const text = (title, dataIndex, extra = {}) => ({
    title: <span className={headerClass}>{title}</span>,
    dataIndex,
    key: dataIndex,
    render: (value) => <span className={cellClass}>{value}</span>,
    ...extra,
});

/** Columns for "New Intimations (Last 24 Hours)". */
export const newIntimationColumns = [
    text('Claim ID', 'claimId'),
    text('Intimation Time', 'intimationTime'),
    text('Customer Name', 'customerName'),
    text('Vehicle No', 'vehicleNo'),
    text('Mobile No', 'mobileNo'),
    text('Location', 'location'),
    text('Source', 'source'),
    {
        title: <span className={headerClass}>Priorty</span>,
        dataIndex: 'priority',
        key: 'priority',
        align: 'center',
        render: (priority) => (
            <span
                className={cn(
                    'inline-flex min-w-[68px] justify-center rounded-md px-3 py-1 text-[11px] font-semibold',
                    PRIORITY_TONES[priority]
                )}
            >
                {priority}
            </span>
        ),
    },
];

/** Columns for the "Pending Allocation" table. */
export const pendingAllocationColumns = [
    text('Claim ID', 'claimId'),
    text('Intimation Time', 'intimationTime', { align: 'center' }),
    text('Customer Name', 'customerName', { align: 'center' }),
    {
        title: <span className={headerClass}>TAT Left</span>,
        dataIndex: 'tatLeft',
        key: 'tatLeft',
        align: 'center',
        render: (value) => (
            <span className="inline-flex rounded-md bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
                {value}
            </span>
        ),
    },
];
