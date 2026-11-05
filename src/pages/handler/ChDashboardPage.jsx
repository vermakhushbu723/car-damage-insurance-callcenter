import { useEffect, useState } from 'react';
import { App, Tooltip } from 'antd';
import {
    AlertOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
    FieldTimeOutlined,
    FileDoneOutlined,
    FolderOutlined,
    HourglassOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Pager from '../../components/common/Pager.jsx';
import QuickFiltersModal, { EMPTY_FILTERS, filterParams } from '../../components/dashboard/QuickFiltersModal.jsx';
import { PRIORITY_TONES } from '../../data/dashboardData.js';
import ROUTES from '../../constants/routes.js';
import { api } from '../../api/client.js';
import { errText, fmtDate } from '../../utils/format.js';
import cn from '../../utils/cn.js';
import { tatSince, useOpenClaim } from '../national/nmClaims.js';

const PAGE_SIZE = 7;
const ILA_STAGES = 'ai-ila,fla';

// Bill Received, TAT Breach and Fraud Triggered have no API yet: Figma's values, marked sample.
const SAMPLE_TILES = [
    { title: 'Bill Received', value: '76', note: 'Successfully Approved', trend: '-9', down: true, color: '#3cb371', text: 'text-[#27a35f]', Icon: FileDoneOutlined },
    { title: 'TAT Breach', value: '9', note: 'SLA Breached', trend: '3', color: '#bb0606', text: 'text-[#bb0606]', Icon: FieldTimeOutlined },
    { title: 'Fraud Triggered', value: '89', note: 'Ready For Disbursement', trend: '14', color: '#bb0606', text: 'text-[#bb0606]', Icon: AlertOutlined },
];

const STATUS_TONES = {
    Assigned: 'bg-[#d3c6f5] text-[#5b21b6]',
    'In Review': 'bg-[#c5daff] text-[#1668e3]',
    'Pending ILA': 'bg-[#fde3c4] text-[#ea8a0c]',
};

/** Status shown to the handler, from the claim's next step. */
const statusOf = (stage) => {
    if (stage === 'handler-allocation' || stage === 'surveyor-assignment') return 'Assigned';
    if (stage === 'ai-ila' || stage === 'fla') return 'Pending ILA';
    return 'In Review';
};

function Tile({ title, value, note, trend, down, color, text, Icon, sample = false }) {
    return (
        <div className="relative flex min-w-0 items-center gap-3 rounded-lg bg-white p-3.5 shadow-[0_1px_5px_rgba(15,23,42,0.14)]">
            <span className="grid h-13 w-13 shrink-0 place-items-center rounded-full text-[23px] text-white" style={{ background: color }}>
                <Icon />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-1">
                    <span className={cn('truncate text-[14px] font-semibold', text)}>{title}</span>
                    <Tooltip title={sample ? 'Sample value: not connected to the backend yet' : note}>
                        <InfoCircleOutlined className="shrink-0 text-[13px] text-slate-700" />
                    </Tooltip>
                </span>
                <span className="block text-[25px] leading-tight font-bold text-slate-900">{value}</span>
                <span className="block truncate text-[11.5px] font-medium text-slate-800">{note}</span>
                {sample ? (
                    <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-700">
                        {down ? <ArrowDownOutlined className="text-red-600" /> : <ArrowUpOutlined className="text-emerald-700" />}
                        <b className={down ? 'font-medium text-red-600' : 'font-medium text-emerald-700'}>{trend}</b> VS Yesterday
                        <span className="ml-auto rounded bg-amber-50 px-1 text-[9.5px] font-semibold text-amber-700">Sample</span>
                    </span>
                ) : null}
            </span>
        </div>
    );
}

const Pill = ({ tone, children }) => (
    <span className={cn('inline-flex min-w-[78px] justify-center rounded-md px-2.5 py-1 text-[12.5px] font-medium whitespace-nowrap', tone)}>{children}</span>
);

/** Claim Handler Dashboard (Processing): the signed-in handler's own claims. */
export default function ChDashboardPage() {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const openClaim = useOpenClaim();
    const [params, setParams] = useSearchParams();
    const filtersOpen = params.get('quickFilters') === '1';
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [options, setOptions] = useState(null);
    const [page, setPage] = useState(1);
    const [list, setList] = useState(null);
    const [ilaPending, setIlaPending] = useState(null);

    const closeFilters = () => setParams({}, { replace: true });

    useEffect(() => {
        api.get('/dashboard')
            .then((d) => setOptions(d.filterOptions))
            .catch((err) => message.error(errText(err)));
    }, [message]);

    useEffect(() => {
        let stale = false;
        const base = { assigned: '1', status: 'Open', ...filterParams(filters) };
        Promise.all([
            api.get(`/claims?${new URLSearchParams({ ...base, page, pageSize: PAGE_SIZE })}`),
            api.get(`/claims?${new URLSearchParams({ ...base, stage: ILA_STAGES, pageSize: 1 })}`),
        ])
            .then(([rows, ila]) => {
                if (stale) return;
                setList(rows);
                setIlaPending(ila.total);
            })
            .catch((err) => !stale && message.error(errText(err)));
        return () => {
            stale = true;
        };
    }, [filters, page, message]);

    const heads = ['Claim ID', 'Policy Number', 'Customer Name', 'Vehicle No', 'Insurer', 'Loss Date', 'Priority', 'Status', 'TAT'];

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <Tile title="Assigned Claims" value={list?.total ?? '—'} note="Total Workload" color="#0f62fe" text="text-[#0f62fe]" Icon={FolderOutlined} />
                <Tile title="ILA Pending" value={ilaPending ?? '—'} note="Awaiting Finalization" color="#f0a500" text="text-[#f0a500]" Icon={HourglassOutlined} />
                {SAMPLE_TILES.map((t) => (
                    <Tile key={t.title} {...t} sample />
                ))}
            </div>

            <section className="rounded-lg bg-white shadow-[0_1px_5px_rgba(15,23,42,0.14)]">
                <header className="flex items-center justify-between px-5 py-4">
                    <h2 className="m-0 text-[18px] font-semibold text-slate-900">Assigned Claims</h2>
                    <button type="button" onClick={() => navigate(ROUTES.viewClaim)} className="text-[14px] font-semibold text-[#1668e3] hover:underline">
                        View All
                    </button>
                </header>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse text-left">
                        <thead>
                            <tr>
                                {heads.map((h) => (
                                    <th key={h} className="px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap text-slate-900">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(list?.rows ?? []).map((r) => {
                                const status = statusOf(r.stage);
                                return (
                                    <tr key={r.id} onClick={() => openClaim(r)} className="cursor-pointer border-t border-slate-200 hover:bg-slate-50">
                                        <td className="px-4 py-2.5 text-[13.5px] text-slate-800">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openClaim(r);
                                                }}
                                                className="hover:text-[#1668e3] hover:underline"
                                            >
                                                {r.claimNo || r.id}
                                            </button>
                                        </td>
                                        <td className="px-4 py-2.5 text-[13.5px] text-slate-800">{r.policyNo || '—'}</td>
                                        <td className="px-4 py-2.5 text-[13.5px] text-slate-800">{r.insuredName || '—'}</td>
                                        <td className="px-4 py-2.5 text-[13.5px] whitespace-nowrap text-slate-800">{r.vehicleNo || '—'}</td>
                                        <td className="px-4 py-2.5 text-[13.5px] text-slate-800">{r.insurerName || '—'}</td>
                                        <td className="px-4 py-2.5 text-[13.5px] whitespace-nowrap text-slate-800">{fmtDate(r.lossDate)}</td>
                                        <td className="px-4 py-2.5">
                                            <Pill tone={PRIORITY_TONES[r.priority] ?? 'bg-slate-100 text-slate-600'}>{r.priority || '—'}</Pill>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <Pill tone={STATUS_TONES[status]}>{status}</Pill>
                                        </td>
                                        <td className="px-4 py-2.5 text-[13.5px] whitespace-nowrap text-slate-800">{tatSince(r.intimatedAt)}</td>
                                    </tr>
                                );
                            })}
                            {list && list.rows.length === 0 ? (
                                <tr>
                                    <td colSpan={heads.length} className="border-t border-slate-200 px-4 py-10 text-center text-[13px] text-slate-500">
                                        No claims assigned to you
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-slate-200">
                    <Pager current={list?.page ?? 1} total={list?.totalPages ?? 1} onChange={setPage} />
                </div>
            </section>

            <QuickFiltersModal
                open={filtersOpen}
                value={filters}
                options={options}
                onClose={closeFilters}
                onApply={(f) => {
                    setFilters(f);
                    setPage(1);
                    closeFilters();
                }}
            />
        </div>
    );
}
