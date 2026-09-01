import { useState } from 'react';
import { App, Button, Select } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import {
    DASHBOARD_STATS,
    NEW_INTIMATIONS,
    PENDING_ALLOCATION,
    TOTAL_PAGES,
} from '../../data/dashboardData.js';
import { newIntimationColumns, pendingAllocationColumns } from '../../components/dashboard/dashboardColumns.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import TableCard from '../../components/common/TableCard.jsx';
import ROUTES from '../../constants/routes.js';

const DASHBOARD_RANGES = [
    { label: 'View I Last 24 Hours', value: '24h' },
    { label: 'View I Last 7 Days', value: '7d' },
    { label: 'View I Last 30 Days', value: '30d' },
];

function ViewAll({ onClick }) {
    return (
        <button type="button" onClick={onClick} className="text-[12px] font-semibold text-[#1450d8] hover:underline">
            View All
        </button>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [range, setRange] = useState(DASHBOARD_RANGES[0].value);
    const [intimationPage, setIntimationPage] = useState(1);
    const [allocationPage, setAllocationPage] = useState(1);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-end">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(ROUTES.intimation)}
                >
                    Intimate New Claim
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {DASHBOARD_STATS.map((stat) => (
                    <StatCard key={stat.key} stat={stat} />
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Select
                    value={range}
                    onChange={setRange}
                    options={DASHBOARD_RANGES}
                    className="w-[210px]"
                />
                <button
                    type="button"
                    onClick={() => message.info('Quick filters')}
                    className="flex items-center gap-2 text-[12px] font-semibold text-slate-700"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1450d8] text-white">
                        <FilterOutlined />
                    </span>
                    Quick Filters
                </button>
            </div>

            <TableCard
                title="New Intimations (Last 24 Hours)"
                extra={<ViewAll onClick={() => message.info('Showing all intimations')} />}
                columns={newIntimationColumns}
                dataSource={NEW_INTIMATIONS}
                page={intimationPage}
                totalPages={TOTAL_PAGES}
                onPageChange={setIntimationPage}
            />

            <TableCard
                title="Pending Allocation"
                extra={<ViewAll onClick={() => message.info('Showing all pending allocations')} />}
                columns={pendingAllocationColumns}
                dataSource={PENDING_ALLOCATION}
                page={allocationPage}
                totalPages={TOTAL_PAGES}
                onPageChange={setAllocationPage}
            />
        </div>
    );
}
