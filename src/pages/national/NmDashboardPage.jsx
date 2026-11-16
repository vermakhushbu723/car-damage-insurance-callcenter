import { useCallback, useEffect, useState } from 'react';
import { App, DatePicker } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import Pager from '../../components/common/Pager.jsx';
import {
    BarRow,
    Card,
    DonutCard,
    FieldLabel,
    KpiCard,
    NmButton,
    NmSearch,
    NmSelect,
    NmTable,
    StatusPill,
    TrendCard,
} from '../../components/national/NmUi.jsx';
import { NM_ROUTES } from '../../constants/nationalManager.js';
import { api } from '../../api/client.js';
import {
    CLAIM_STAGE_CHART,
    CLAIMS_BY_REGION,
    CLAIMS_TREND,
    DASHBOARD_KPIS,
    TAT_BREACH_CHART,
    TOP_HANDLERS,
    USER_SUMMARY_CHART,
} from '../../data/nationalManagerData.js';
import { errText } from '../../utils/format.js';
import { INDIA_STATES } from '../../data/indiaLocations.js';
import { fmtDate, tatSince, useOpenClaim } from './nmClaims.js';

const REGIONS = ['All Regions', 'North Region', 'South Region', 'East Region', 'West Region', 'Central Region', 'North East Region'];
const MAX_REGION = Math.max(...CLAIMS_BY_REGION.map((r) => r.value));

/** NATIONAL MANAGER DASHBOARD. Assigned Claims is live; the tiles and charts are Figma samples. */
export default function NmDashboardPage() {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const openClaim = useOpenClaim();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [regionView, setRegionView] = useState('All Regions');

    const load = useCallback(async () => {
        const q = new URLSearchParams({ page, pageSize: 7 });
        if (search) q.set('search', search);
        try {
            setData(await api.get(`/claims?${q}`));
        } catch (err) {
            message.error(errText(err));
        }
    }, [page, search, message]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const columns = [
        { key: 'id', title: 'CLAIM ID', render: (r) => <b>{r.claimNo || r.id}</b> },
        { key: 'policyNo', title: 'POLICY NO', render: (r) => r.policyNo || '—' },
        { key: 'insuredName', title: 'CUSTOMER NAME', render: (r) => r.insuredName || '—' },
        { key: 'vehicleNo', title: 'VEHICLE NO', render: (r) => r.vehicleNo || '—' },
        { key: 'location', title: 'LOCATION', render: (r) => r.location || '—' },
        { key: 'lossDate', title: 'INTIMATED ON', render: (r) => fmtDate(r.intimatedAt) },
        { key: 'priority', title: 'PRIORITY', render: (r) => <StatusPill value={r.priority || 'Low'} className="min-w-16 rounded-full py-0.5" /> },
        { key: 'stage', title: 'STATUS', render: (r) => <StatusPill value={r.stageLabel} tone="blue" className="rounded-full py-0.5 whitespace-nowrap" /> },
        { key: 'tat', title: 'TAT', render: (r) => tatSince(r.intimatedAt) },
        {
            key: 'view',
            title: 'OPTION',
            render: (r) => (
                <button type="button" onClick={() => openClaim(r)} className="inline-flex items-center gap-1 rounded-full bg-[#dbe6fb] px-3 py-0.5 text-[#0b4fc9]">
                    View <EyeOutlined />
                </button>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end gap-3">
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 ring-1 ring-amber-200">Tiles &amp; charts: sample data</span>
                <NmButton onClick={load} className="px-10">
                    Refresh <ReloadOutlined />
                </NmButton>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-8">
                {DASHBOARD_KPIS.map((k) => (
                    <KpiCard key={k.title} {...k} />
                ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
                <DonutCard title="Claim Stage" data={CLAIM_STAGE_CHART} />
                <TrendCard title="Claims Trend (Last 7 Days)" data={CLAIMS_TREND} />
                <Card
                    title="Claims By Region"
                    action={<NmSelect value={regionView} onChange={setRegionView} options={REGIONS} className="!w-32" />}
                >
                    <ul className="m-0 list-none space-y-3.5 px-4 pt-1 pb-2">
                        {CLAIMS_BY_REGION.map((r) => (
                            <BarRow key={r.label} {...r} max={MAX_REGION} />
                        ))}
                    </ul>
                    <button type="button" onClick={() => navigate(NM_ROUTES.tatMonitor)} className="px-4 pb-3 text-[12px] font-semibold text-[#0b4fc9] hover:underline">
                        View Regionwise Report
                    </button>
                </Card>
            </div>

            <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-5">
                <FieldLabel label="Date Range">
                    <DatePicker.RangePicker className="w-full" format="DD MMM YYYY" />
                </FieldLabel>
                <FieldLabel label="Region">
                    <NmSelect options={REGIONS} placeholder="All Regions" />
                </FieldLabel>
                <FieldLabel label="State">
                    <NmSelect showSearch options={INDIA_STATES} placeholder="Select State" />
                </FieldLabel>
                <FieldLabel label="Branch">
                    <NmSelect options={[]} placeholder="Select Branch" />
                </FieldLabel>
                <NmSearch
                    value={search}
                    onChange={(v) => {
                        setSearch(v);
                        setPage(1);
                    }}
                    placeholder="Search by claim ID Policy No....."
                />
            </div>

            <Card
                title="Assigned Claims"
                action={
                    <button type="button" onClick={() => navigate(NM_ROUTES.claimProcess)} className="text-[13px] font-semibold text-[#0b4fc9] hover:underline">
                        View All
                    </button>
                }
            >
                <div className="[&_th]:!bg-[#bcd0f3] [&_th]:text-center [&_td]:text-center">
                    <NmTable columns={columns} rows={data?.rows ?? []} empty={data ? 'No claims found' : 'Loading…'} minWidth={1040} />
                </div>
                <Pager current={data?.page ?? 1} total={data?.totalPages ?? 1} onChange={setPage} />
            </Card>

            <div className="grid gap-3 xl:grid-cols-3">
                <DonutCard title="User Summery" data={USER_SUMMARY_CHART} />
                <DonutCard title="TAT Breach Summary" data={TAT_BREACH_CHART} />
                <Card title="Top Handlers By Workload" action={<NmSelect value="This Week" options={['This Week', 'This Month']} className="!w-28" />}>
                    <ul className="m-0 list-none space-y-3 px-4 pt-1 pb-3">
                        {TOP_HANDLERS.map((h) => (
                            <li key={h.rank} className="grid grid-cols-[32px_1fr_1fr_auto] items-center gap-3 text-[12px] text-slate-800">
                                <span className="grid h-7 w-8 place-items-center rounded-md bg-[#0b4fc9] font-semibold text-white">{h.rank}</span>
                                <span>{h.code}</span>
                                <span>{h.name}</span>
                                <span className="font-medium">{h.load}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="m-0 px-4 pb-3 text-right">
                        <button type="button" onClick={() => navigate(NM_ROUTES.users)} className="text-[12px] font-semibold text-[#0b4fc9] hover:underline">
                            View Regionwise Report
                        </button>
                    </p>
                </Card>
            </div>
        </div>
    );
}
