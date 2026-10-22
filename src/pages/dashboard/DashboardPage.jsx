import { useCallback, useEffect, useState } from 'react';
import { App, Button, Dropdown, Select } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { DASHBOARD_STATS } from '../../data/dashboardData.js';
import { newIntimationColumns, pendingAllocationColumns } from '../../components/dashboard/dashboardColumns.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import TableCard from '../../components/common/TableCard.jsx';
import { STAGE_ROUTES } from '../../components/claim/ClaimShell.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { errText } from '../../utils/format.js';

const DASHBOARD_RANGES = [
    { label: 'View I Last 24 Hours', value: '24h', caption: 'In Last 24 Hours' },
    { label: 'View I Last 7 Days', value: '7d', caption: 'In Last 7 Days' },
    { label: 'View I Last 30 Days', value: '30d', caption: 'In Last 30 Days' },
];
const PRIORITIES = ['High', 'Medium', 'Low'];
const SOURCES = ['Call Center', 'Direct', 'Chatbot', 'Website', 'App'];

function ViewAll({ active, onClick }) {
    return (
        <button type="button" onClick={onClick} className="text-[12px] font-semibold text-[#1450d8] hover:underline">
            {active ? 'Show Range Only' : 'View All'}
        </button>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { can, selectClaim } = useAppState();
    const [range, setRange] = useState(DASHBOARD_RANGES[0].value);
    const [all, setAll] = useState(false);
    const [filters, setFilters] = useState({ priority: null, source: null });
    const [intimationPage, setIntimationPage] = useState(1);
    const [allocationPage, setAllocationPage] = useState(1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams({ range, page: intimationPage, allocationPage });
        if (all) q.set('all', '1');
        if (filters.priority) q.set('priority', filters.priority);
        if (filters.source) q.set('source', filters.source);
        try {
            setData(await api.get(`/dashboard?${q}`));
        } catch (err) {
            message.error(errText(err));
        } finally {
            setLoading(false);
        }
    }, [range, all, filters, intimationPage, allocationPage, message]);

    useEffect(() => {
        load();
    }, [load]);

    /** Opens a claim on the screen of its next step. */
    const openClaim = (row) => {
        selectClaim(row.id);
        if (row.status === 'Draft') return navigate(`${ROUTES.intimation}?claim=${encodeURIComponent(row.id)}`);
        const target = STAGE_ROUTES[row.stage];
        const module = {
            [ROUTES.handlerAllocation]: MODULES.handler,
            [ROUTES.surveyorAssignment]: MODULES.surveyor,
            [ROUTES.claimDetails]: MODULES.details,
            [ROUTES.aiIla]: MODULES.aiIla,
            [ROUTES.handlerIla]: MODULES.handlerIla,
            [ROUTES.paymentRecommendation]: MODULES.payment,
            [ROUTES.surveyPaybill]: MODULES.paybill,
        }[target];
        if (target && can(module)) return navigate(target);
        return navigate(can(MODULES.details) ? ROUTES.claimDetails : ROUTES.communicationHistory);
    };

    const caption = DASHBOARD_RANGES.find((r) => r.value === range).caption;
    const stats = DASHBOARD_STATS.map((s) => ({
        ...s,
        caption: s.key === 'newIntimations' ? caption : s.caption,
        value: data ? new Intl.NumberFormat('en-IN').format(data.stats[s.key].value) : '—',
        trend: data?.stats[s.key].trend,
    }));

    const filterItems = [
        { type: 'group', label: 'Priority', children: PRIORITIES.map((p) => ({ key: `priority:${p}`, label: p })) },
        { type: 'group', label: 'Source', children: SOURCES.map((p) => ({ key: `source:${p}`, label: p })) },
        { type: 'divider' },
        { key: 'clear', label: 'Clear Filters' },
    ];
    const onFilter = ({ key }) => {
        setIntimationPage(1);
        if (key === 'clear') return setFilters({ priority: null, source: null });
        const [k, v] = key.split(':');
        return setFilters((f) => ({ ...f, [k]: f[k] === v ? null : v }));
    };
    const activeFilters = [filters.priority, filters.source].filter(Boolean);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-end">
                {can(MODULES.intimation, 'create') ? (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`${ROUTES.intimation}?new=1`)}>
                        Intimate New Claim
                    </Button>
                ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.key} stat={stat} />
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Select
                    value={range}
                    onChange={(v) => {
                        setRange(v);
                        setIntimationPage(1);
                    }}
                    options={DASHBOARD_RANGES}
                    className="w-[210px]"
                />
                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: filterItems,
                        onClick: onFilter,
                        selectable: true,
                        multiple: true,
                        selectedKeys: [filters.priority && `priority:${filters.priority}`, filters.source && `source:${filters.source}`].filter(Boolean),
                    }}
                >
                    <button type="button" className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1450d8] text-white">
                            <FilterOutlined />
                        </span>
                        Quick Filters{activeFilters.length ? ` (${activeFilters.join(', ')})` : ''}
                    </button>
                </Dropdown>
            </div>

            <TableCard
                title={all ? 'All Intimations' : `New Intimations (${caption.replace('In ', '')})`}
                extra={
                    <ViewAll
                        active={all}
                        onClick={() => {
                            setAll((v) => !v);
                            setIntimationPage(1);
                        }}
                    />
                }
                columns={newIntimationColumns(openClaim)}
                dataSource={data?.intimations.rows ?? []}
                rowKey="id"
                loading={loading}
                page={data?.intimations.page ?? 1}
                totalPages={data?.intimations.totalPages ?? 1}
                onPageChange={setIntimationPage}
            />

            <TableCard
                title={`Pending Allocation (${data?.allocation.total ?? 0})`}
                columns={pendingAllocationColumns(openClaim)}
                dataSource={data?.allocation.rows ?? []}
                rowKey="id"
                loading={loading}
                page={data?.allocation.page ?? 1}
                totalPages={data?.allocation.totalPages ?? 1}
                onPageChange={setAllocationPage}
            />
        </div>
    );
}
