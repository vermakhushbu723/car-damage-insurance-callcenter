import { useEffect, useMemo, useState } from 'react';
import { App, Button, Input, Tabs } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';

import {
    COMMUNICATION_FILTERS,
    COMMUNICATION_HISTORY,
    buildCommunicationStats,
} from '../../data/communicationData.js';
import { CLAIM_SUMMARY } from '../../data/claimData.js';
import CommunicationStatsBar from '../../components/communication/CommunicationStatsBar.jsx';
import ClaimCommunicationTable from '../../components/communication/ClaimCommunicationTable.jsx';
import ClaimSummaryCard from '../../components/communication/ClaimSummaryCard.jsx';
import Pager from '../../components/common/Pager.jsx';
import { matchesSearch } from '../../utils/search.js';

const PAGE_SIZE = 3;

/**
 * Claim communication log – the wide layout with the periwinkle table band.
 * Same data as the Letters → Communication History screen, different design.
 */
export default function ClaimCommunicationPage() {
    const { message } = App.useApp();
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const stats = useMemo(() => buildCommunicationStats(COMMUNICATION_HISTORY), []);

    const filtered = useMemo(
        () =>
            COMMUNICATION_HISTORY.filter(COMMUNICATION_FILTERS[activeTab]).filter((row) =>
                matchesSearch(row, search)
            ),
        [activeTab, search]
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // A narrower result set must never leave the pager on a page that is gone.
    useEffect(() => setPage(1), [activeTab, search]);

    const counts = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(COMMUNICATION_FILTERS).map(([key, predicate]) => [
                    key,
                    COMMUNICATION_HISTORY.filter(predicate).length,
                ])
            ),
        []
    );

    const tabItems = [
        { key: 'all', label: `All(${counts.all})` },
        { key: 'sent', label: `Letter Sent(${counts.sent})` },
        { key: 'received', label: `Responses Received (${counts.received})` },
        { key: 'pending', label: `Pending(${counts.pending})` },
    ];

    return (
        <div className="flex flex-col gap-5">
            <header className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:items-start">
                <h1 className="mb-0 text-[18px] leading-6 font-bold text-[#1450d8]">Communication History</h1>

                <div className="lg:text-center">
                    <p className="mb-1 text-[14.5px] leading-6 font-bold text-slate-900">
                        <span className="text-[#1450d8]">Claim ID:</span> {CLAIM_SUMMARY.claimId}
                    </p>
                    <p className="mb-0.5 text-[11.5px] text-slate-800">
                        Insured Name: {CLAIM_SUMMARY.insuredName}
                    </p>
                    <p className="mb-0 text-[11.5px] text-slate-800">
                        Vehicle Number: {CLAIM_SUMMARY.vehicleNo}
                    </p>
                </div>
            </header>

            <CommunicationStatsBar stats={stats} />

            <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                <section className="min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-col gap-3 px-4 pt-3 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            className="min-w-0 flex-1 [&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-tab]:!text-[12.5px]"
                        />
                        <div className="flex items-center gap-3 pb-3 lg:pb-0">
                            <Input
                                allowClear
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search History"
                                suffix={<SearchOutlined className="text-slate-500" />}
                                className="w-full lg:w-[240px]"
                            />
                            <Button
                                onClick={() => message.info('Filters')}
                                className="flex items-center gap-2"
                            >
                                Filters <FilterOutlined />
                            </Button>
                        </div>
                    </div>

                    <ClaimCommunicationTable rows={rows} />

                    <Pager current={page} total={totalPages} onChange={setPage} align="center" />
                </section>

                <div className="w-full xl:w-[330px] xl:shrink-0">
                    <ClaimSummaryCard onAction={(action) => message.info(action.label)} />
                </div>
            </div>
        </div>
    );
}
