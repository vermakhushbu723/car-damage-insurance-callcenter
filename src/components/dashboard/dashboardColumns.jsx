import { PRIORITY_TONES } from '../../data/dashboardData.js';
import { fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const headerClass = 'text-[11.5px] font-semibold text-slate-900';
const cellClass = 'text-[11.5px] text-slate-700';

const text = (title, dataIndex, extra = {}) => ({
    title: <span className={headerClass}>{title}</span>,
    dataIndex,
    key: dataIndex,
    render: (value) => <span className={cellClass}>{value || '—'}</span>,
    ...extra,
});

/** Claim ID cell: opens the claim. */
const claimIdColumn = (onOpen) => ({
    title: <span className={headerClass}>Claim ID</span>,
    key: 'claimId',
    render: (_v, row) => (
        <button type="button" onClick={() => onOpen(row)} className="text-left text-[11.5px] font-semibold text-[#1450d8] hover:underline">
            {row.claimNo}
            {row.status === 'Draft' ? (
                <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">Draft</span>
            ) : null}
        </button>
    ),
});

/** Columns for "New Intimations". */
export const newIntimationColumns = (onOpen) => [
    claimIdColumn(onOpen),
    {
        ...text('Intimation Time', 'intimatedAt'),
        render: (_v, row) => <span className={cellClass}>{row.status === 'Draft' ? 'Not submitted' : fmtDateTime(row.submittedAt)}</span>,
    },
    text('Customer Name', 'insuredName'),
    text('Vehicle No', 'vehicleNo'),
    text('Mobile No', 'mobile'),
    text('Location', 'location'),
    text('Source', 'source'),
    {
        title: <span className={headerClass}>Priorty</span>,
        dataIndex: 'priority',
        key: 'priority',
        align: 'center',
        render: (priority) => (
            <span className={cn('inline-flex min-w-[68px] justify-center rounded-md px-3 py-1 text-[11px] font-semibold', PRIORITY_TONES[priority])}>
                {priority}
            </span>
        ),
    },
];

/** Columns for the "Pending Allocation" table. */
export const pendingAllocationColumns = (onOpen) => [
    claimIdColumn(onOpen),
    { ...text('Intimation Time', 'submittedAt', { align: 'center' }), render: (v) => <span className={cellClass}>{fmtDateTime(v)}</span> },
    text('Customer Name', 'insuredName', { align: 'center' }),
    {
        title: <span className={headerClass}>TAT Left</span>,
        dataIndex: 'tatLeft',
        key: 'tatLeft',
        align: 'center',
        render: (value) => (
            <span
                className={cn(
                    'inline-flex rounded-md px-3 py-1 text-[11px] font-semibold',
                    String(value).startsWith('Overdue') ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                )}
            >
                {value}
            </span>
        ),
    },
];
