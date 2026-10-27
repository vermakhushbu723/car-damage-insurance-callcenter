import { useEffect, useState } from 'react';
import { App, Input, Select, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import Pager from '../../components/common/Pager.jsx';
import { STAGE_ROUTES } from '../../components/claim/ClaimShell.jsx';
import { CLAIM_STAGES } from '../../data/claimWorkflowData.js';
import { PRIORITY_TONES } from '../../data/dashboardData.js';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDateTime, formatINR } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-900">{label}</span>;
const cell = (v) => <span className="text-[11.5px] text-slate-700">{v || '—'}</span>;
const STAGE_OPTIONS = [{ label: 'All Stages', value: '' }, ...CLAIM_STAGES.map((s) => ({ label: s.label, value: s.key })), { label: 'Completed', value: 'completed' }];
const STATUS_OPTIONS = [
    { label: 'All Status', value: '' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Open', value: 'Open' },
    { label: 'Closed', value: 'Closed' },
];
const STAGE_TONE = { completed: 'bg-emerald-100 text-emerald-700', intimation: 'bg-slate-100 text-slate-600' };

/** My Claims lists; `view` is GET /claims?view= (the dashboard KPI tiles), "all" = View Claim. */
const VIEWS = {
    total: { title: 'Total Intimation', subtitle: 'All Time Registered Intimations' },
    new: { title: 'New Intimations', subtitle: 'Intimations Registered In The Last 24 Hours' },
    pending: { title: 'Pending Allocation', subtitle: 'Open Claims Awaiting Handler Assignment' },
    link: { title: 'Link Sent', subtitle: 'Claims Whose Survey Link Has Been Sent' },
    all: { title: 'View Claim', subtitle: 'Search Any Claim And Open It On Its Next Step' },
};

/** One My Claims list. Clicking a claim opens it on its next step. */
export default function ClaimsListPage({ view = 'all' }) {
    const config = VIEWS[view] ?? VIEWS.all;
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { selectClaim, can } = useAppState();
    const [search, setSearch] = useState('');
    const [stage, setStage] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            setLoading(true);
            const q = new URLSearchParams({ page, pageSize: 10 });
            if (search) q.set('search', search);
            if (stage) q.set('stage', stage);
            if (status) q.set('status', status);
            if (view !== 'all') q.set('view', view);
            api.get(`/claims?${q}`)
                .then(setData)
                .catch((err) => message.error(errText(err)))
                .finally(() => setLoading(false));
        }, 250);
        return () => clearTimeout(t);
    }, [search, stage, status, page, view, message]);

    useEffect(() => setPage(1), [search, stage, status, view]);

    const open = (row) => {
        selectClaim(row.id);
        if (row.status === 'Draft') return navigate(`${ROUTES.intimation}?claim=${encodeURIComponent(row.id)}`);
        const target = STAGE_ROUTES[row.stage];
        return navigate(target ?? (can(MODULES.details) ? ROUTES.claimDetails : ROUTES.communicationHistory));
    };

    const columns = [
        {
            title: header('Claim ID'),
            key: 'claimNo',
            render: (_v, row) => (
                <button type="button" onClick={() => open(row)} className="text-left text-[11.5px] font-semibold text-[#1450d8] hover:underline">
                    {row.claimNo}
                    <span className="block text-[10px] font-normal text-slate-400">{row.id}</span>
                </button>
            ),
        },
        { title: header('Intimation Time'), key: 'time', render: (_v, row) => cell(row.status === 'Draft' ? 'Not submitted' : fmtDateTime(row.submittedAt)) },
        { title: header('Customer Name'), dataIndex: 'insuredName', key: 'insuredName', render: cell },
        { title: header('Vehicle No'), dataIndex: 'vehicleNo', key: 'vehicleNo', render: cell },
        { title: header('Location'), dataIndex: 'location', key: 'location', render: cell },
        { title: header('Handler'), dataIndex: 'handlerName', key: 'handlerName', render: cell },
        {
            title: header('Current Stage'),
            key: 'stage',
            render: (_v, row) => (
                <span className={cn('inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold', STAGE_TONE[row.stage] ?? 'bg-blue-50 text-[#1450d8]')}>
                    {row.status === 'Draft' ? 'Draft' : row.stageLabel}
                </span>
            ),
        },
        ...(view === 'link' ? [{ title: header('Link Sent On'), dataIndex: 'linkSentAt', key: 'linkSentAt', render: (v) => cell(v && fmtDateTime(v)) }] : []),
        { title: header('Claim Amount'), dataIndex: 'amount', key: 'amount', align: 'right', render: (v) => cell(v ? `₹${formatINR(v)}` : '') },
        {
            title: header('Priorty'),
            dataIndex: 'priority',
            key: 'priority',
            align: 'center',
            render: (p) => <span className={cn('inline-flex min-w-[68px] justify-center rounded-md px-3 py-1 text-[11px] font-semibold', PRIORITY_TONES[p])}>{p}</span>,
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="mb-0.5 text-[20px] leading-7 font-bold text-[#1450d8]">{config.title}</h1>
                <p className="mb-0 text-[13.5px] font-bold text-slate-900">
                    {config.subtitle}
                </p>
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                <div className="grid grid-cols-1 gap-3 px-4 pt-4 pb-3 sm:grid-cols-3 sm:px-5">
                    <Input
                        allowClear
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Claim ID, Customer, Vehicle, Mobile, Policy"
                        suffix={<SearchOutlined className="text-slate-400" />}
                    />
                    <Select value={stage} options={STAGE_OPTIONS} onChange={setStage} />
                    <Select value={status} options={STATUS_OPTIONS} onChange={setStatus} />
                </div>
                <Table
                    columns={columns}
                    dataSource={data?.rows ?? []}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    size="middle"
                    locale={{ emptyText: 'No claims found.' }}
                />
                <div className="flex items-center justify-between px-5">
                    <span className="text-[11px] text-slate-500">{data ? `${data.total} claim(s)` : ''}</span>
                    <Pager current={data?.page ?? 1} total={data?.totalPages ?? 1} onChange={setPage} />
                </div>
            </section>
        </div>
    );
}
