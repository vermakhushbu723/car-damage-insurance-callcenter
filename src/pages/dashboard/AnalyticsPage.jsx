import { useCallback, useEffect, useState } from 'react';
import { App, Badge, Select, Table, Tooltip } from 'antd';
import { BellOutlined, FilterOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { DASHBOARD_STATS } from '../../data/dashboardData.js';
import { newIntimationColumns, pendingAllocationColumns } from '../../components/dashboard/dashboardColumns.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import TableCard from '../../components/common/TableCard.jsx';
import Pager from '../../components/common/Pager.jsx';
import QuickFiltersModal, { EMPTY_FILTERS, filterParams } from '../../components/dashboard/QuickFiltersModal.jsx';
import { STAGE_ROUTES } from '../../components/claim/ClaimShell.jsx';
import ROUTES from '../../constants/routes.js';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { errText } from '../../utils/format.js';

const STATUS_COLORS = { new: '#16c60c', pending: '#f59e0b', link: '#7c3aed', allocated: '#1468f2' };
const SOURCE_COLORS = { 'Call Center': '#1468f2', Website: '#16c60c', 'Mobile App': '#7c3aed', Email: '#f59e0b', Others: '#22d3ee' };

/** Area line chart of intimations per day. */
function TrendChart({ points }) {
    const W = 560;
    const H = 260;
    const pad = { l: 36, r: 12, t: 12, b: 28 };
    const max = Math.max(4, ...points.map((p) => p.count));
    const top = Math.ceil(max / 5) * 5;
    const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, points.length - 1);
    const y = (v) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.count).toFixed(1)}`).join(' ');
    const area = `${line} L${x(points.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
    const ticks = Array.from({ length: 6 }, (_, i) => (top / 5) * i);
    const every = Math.ceil(points.length / 7);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[260px] w-full">
            <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1468f2" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#1468f2" stopOpacity="0.08" />
                </linearGradient>
            </defs>
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
                    <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#0f172a">
                        {Math.round(t)}
                    </text>
                </g>
            ))}
            <path d={area} fill="url(#trend-fill)" />
            <path d={line} fill="none" stroke="#1468f2" strokeWidth="2" />
            {points.map((p, i) => (
                <g key={p.date}>
                    <circle cx={x(i)} cy={y(p.count)} r="4" fill="#1468f2">
                        <title>{`${dayjs(p.date).format('DD MMM')}: ${p.count}`}</title>
                    </circle>
                    {i % every === 0 || i === points.length - 1 ? (
                        <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#0f172a">
                            {dayjs(p.date).format('DD MMM')}
                        </text>
                    ) : null}
                </g>
            ))}
        </svg>
    );
}

/** Donut + legend ("1,245 Total Intimations"). */
function DonutCard({ title, items, colors, total, centerLabel }) {
    const r = 70;
    const c = 2 * Math.PI * r;
    const sum = items.reduce((s, i) => s + i.value, 0);
    let offset = 0;
    return (
        <section className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
            <h3 className="mb-3 text-[15px] font-bold text-slate-900">{title}</h3>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
                <svg viewBox="0 0 200 200" className="h-[170px] w-[170px] shrink-0">
                    <circle cx="100" cy="100" r={r} fill="none" stroke="#eef2f7" strokeWidth="34" />
                    {sum
                        ? items.map((i) => {
                              const len = (i.value / sum) * c;
                              const el = (
                                  <circle
                                      key={i.key}
                                      cx="100"
                                      cy="100"
                                      r={r}
                                      fill="none"
                                      stroke={colors[i.key]}
                                      strokeWidth="34"
                                      strokeDasharray={`${len} ${c - len}`}
                                      strokeDashoffset={-offset}
                                      transform="rotate(-90 100 100)"
                                  >
                                      <title>{`${i.label}: ${i.value}`}</title>
                                  </circle>
                              );
                              offset += len;
                              return el;
                          })
                        : null}
                    {centerLabel ? (
                        <>
                            <text x="100" y="100" textAnchor="middle" fontSize="26" fontWeight="700" fill="#0f172a">
                                {new Intl.NumberFormat('en-IN').format(total)}
                            </text>
                            <text x="100" y="122" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">
                                {centerLabel}
                            </text>
                        </>
                    ) : null}
                </svg>
                <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
                    {items.map((i) => (
                        <li key={i.key} className="flex items-center justify-between gap-3 text-[11.5px] text-slate-800">
                            <span className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ background: colors[i.key] }} />
                                {i.label}
                            </span>
                            <span>
                                {i.value} ({i.pct}%)
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default function AnalyticsPage() {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { user, selectClaim } = useAppState();
    const [days, setDays] = useState(7);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [pages, setPages] = useState({ intimation: 1, allocation: 1, link: 1 });
    const [dash, setDash] = useState(null);
    const [stats, setStats] = useState(null);

    const load = useCallback(async () => {
        const q = new URLSearchParams({ range: '24h', page: pages.intimation, allocationPage: pages.allocation, ...filterParams(filters) });
        try {
            const [d, a] = await Promise.all([api.get(`/dashboard?${q}`), api.get(`/dashboard/analytics?days=${days}&page=${pages.link}`)]);
            setDash(d);
            setStats(a);
        } catch (err) {
            message.error(errText(err));
        }
    }, [days, filters, pages, message]);

    useEffect(() => {
        load();
    }, [load]);

    const openClaim = (row) => {
        selectClaim(row.id);
        navigate(row.status === 'Draft' ? ROUTES.intimation : STAGE_ROUTES[row.stage] ?? ROUTES.claimDetails);
    };

    const kpis = DASHBOARD_STATS.map((s) => ({
        ...s,
        value: dash ? new Intl.NumberFormat('en-IN').format(dash.stats[s.key].value) : '—',
        trend: dash?.stats[s.key].trend,
    }));

    const linkColumns = [
        { title: <span className="text-[11.5px] font-semibold">Date</span>, dataIndex: 'date', key: 'date', render: (v) => <span className="text-[11.5px]">{dayjs(v).format('DD MMM YYYY')}</span> },
        { title: <span className="text-[11.5px] font-semibold">Link Sent</span>, dataIndex: 'sent', key: 'sent', align: 'center' },
        { title: <span className="text-[11.5px] font-semibold">Successfully Accessed</span>, dataIndex: 'accessed', key: 'accessed', align: 'center' },
        { title: <span className="text-[11.5px] font-semibold">Completed</span>, dataIndex: 'completed', key: 'completed', align: 'center' },
        {
            title: <span className="text-[11.5px] font-semibold">Access Rate</span>,
            dataIndex: 'accessRate',
            key: 'accessRate',
            align: 'center',
            render: (v) => (
                <span
                    className={`inline-flex min-w-[80px] justify-center rounded-md px-3 py-1 text-[11px] font-semibold ${
                        v >= 70 ? 'bg-emerald-100 text-emerald-700' : v >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                    }`}
                >
                    {v}%
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <header className="flex items-center gap-4 rounded-xl bg-[#83a2e3] px-5 py-3">
                <button type="button" aria-label="Back to dashboard" onClick={() => navigate(ROUTES.dashboard)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#1450d8]">
                    <MenuOutlined />
                </button>
                <h1 className="mb-0 flex-1 text-[16px] font-semibold text-white">call center / csm dashboard</h1>
                <Tooltip title="Quick Filters">
                    <button type="button" onClick={() => setFiltersOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#1450d8]">
                        <FilterOutlined />
                    </button>
                </Tooltip>
                <Tooltip title="Pending allocation">
                    <Badge count={dash?.stats.pendingAllocation.value ?? 0} size="small">
                        <button type="button" onClick={() => navigate(ROUTES.dashboard)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#1450d8]">
                            <BellOutlined />
                        </button>
                    </Badge>
                </Tooltip>
                <Tooltip title={user ? `${user.name} · ${user.roleName}` : ''}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#1450d8]">
                        <UserOutlined />
                    </span>
                </Tooltip>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((stat) => (
                    <StatCard key={stat.key} stat={stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <section className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="mb-0 text-[15px] font-bold text-slate-900">Intimation Trend</h3>
                        <Select
                            size="small"
                            value={days}
                            className="w-[140px]"
                            onChange={setDays}
                            options={[
                                { label: 'Last 7 Days', value: 7 },
                                { label: 'Last 30 Days', value: 30 },
                            ]}
                        />
                    </div>
                    {stats ? <TrendChart points={stats.trend} /> : null}
                </section>
                <div className="flex flex-col gap-4">
                    <DonutCard title="Intimation Status Over View" items={stats?.status ?? []} colors={STATUS_COLORS} total={stats?.total ?? 0} centerLabel="Total Intimations" />
                    <DonutCard title="Total Intimation Source" items={stats?.sources ?? []} colors={SOURCE_COLORS} total={stats?.total ?? 0} />
                </div>
            </div>

            <TableCard
                title="New Intimations (Last 24 Hours)"
                extra={
                    <button type="button" onClick={() => navigate(ROUTES.dashboard)} className="text-[12px] font-semibold text-[#1450d8] hover:underline">
                        View All
                    </button>
                }
                columns={newIntimationColumns(openClaim)}
                dataSource={dash?.intimations.rows ?? []}
                rowKey="id"
                page={dash?.intimations.page ?? 1}
                totalPages={dash?.intimations.totalPages ?? 1}
                onPageChange={(p) => setPages((x) => ({ ...x, intimation: p }))}
            />
            <TableCard
                title="Pending Allocation"
                columns={pendingAllocationColumns(openClaim)}
                dataSource={dash?.allocation.rows ?? []}
                rowKey="id"
                page={dash?.allocation.page ?? 1}
                totalPages={dash?.allocation.totalPages ?? 1}
                onPageChange={(p) => setPages((x) => ({ ...x, allocation: p }))}
            />
            <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-5">
                    <h2 className="text-[13.5px] font-bold text-slate-900">Survey Link Sent Summary</h2>
                    {stats && !stats.linkSummary.tracking ? <span className="text-[10.5px] text-amber-600">Link opens are not tracked (PUBLIC_URL not set)</span> : null}
                </header>
                <Table columns={linkColumns} dataSource={stats?.linkSummary.rows ?? []} rowKey="date" pagination={false} size="middle" locale={{ emptyText: 'No survey links sent yet.' }} />
                <Pager current={stats?.linkSummary.page ?? 1} total={stats?.linkSummary.totalPages ?? 1} onChange={(p) => setPages((x) => ({ ...x, link: p }))} />
            </section>

            <QuickFiltersModal
                open={filtersOpen}
                value={filters}
                options={dash?.filterOptions}
                onClose={() => setFiltersOpen(false)}
                onApply={(f) => {
                    setFilters(f);
                    setPages((x) => ({ ...x, intimation: 1 }));
                    setFiltersOpen(false);
                }}
            />
        </div>
    );
}
