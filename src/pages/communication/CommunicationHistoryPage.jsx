import { useMemo, useState } from 'react';
import { Button, Dropdown, Input, Tabs } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import CommunicationTable from '../../components/communication/CommunicationTable.jsx';
import ClaimSidePanel from '../../components/communication/ClaimSidePanel.jsx';
import useCommunications, { COMMUNICATION_FILTERS, buildStats } from '../../components/communication/useCommunications.jsx';
import { NoClaim } from '../../components/claim/ClaimShell.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { matchesSearch } from '../../utils/search.js';

const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Phone', 'Portal'];

export default function CommunicationHistoryPage() {
    const navigate = useNavigate();
    const { claim, can } = useAppState();
    const comm = useCommunications(claim);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [channel, setChannel] = useState(null);

    const rows = useMemo(
        () =>
            comm.rows
                .filter(COMMUNICATION_FILTERS[activeTab])
                .filter((row) => !channel || row.channel === channel)
                .filter((row) => matchesSearch(row, search)),
        [comm.rows, activeTab, channel, search]
    );

    if (!claim) return <NoClaim />;

    const counts = comm.data?.counts ?? { all: 0, sent: 0, received: 0, pending: 0 };
    const tabItems = [
        { key: 'all', label: `All (${counts.all})` },
        { key: 'sent', label: `Letters Sent (${counts.sent})` },
        { key: 'received', label: `Responses Received (${counts.received})` },
        { key: 'pending', label: `Pending (${counts.pending})` },
    ];

    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={() => navigate(can(MODULES.details) ? ROUTES.claimDetails : ROUTES.intimation)}
                className="flex w-fit items-center gap-2 text-[11.5px] font-medium text-[#1450d8] hover:underline"
            >
                <ArrowLeftOutlined /> Back to Claim
            </button>

            <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <h1 className="mb-1 text-[18px] leading-6 font-bold text-slate-900">Communication History</h1>
                    <p className="mb-0 text-[11.5px] text-slate-500">All communication related to this claim</p>
                </div>

                <div className="xl:pt-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                        <span className="font-semibold text-slate-700">Claim ID:</span>
                        <span className="font-semibold text-[#1450d8]">{claim.claimNo}</span>
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700">{claim.stageLabel}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-2 text-[11px] text-slate-500">
                        <span>
                            Insured Name: <span className="font-medium text-slate-800">{claim.insuredName || '—'}</span>
                        </span>
                        <span>|</span>
                        <span>
                            Vehicle No.: <span className="font-medium text-slate-800">{claim.vehicleNo || '—'}</span>
                        </span>
                    </div>
                </div>

                <Button icon={<DownloadOutlined />} disabled={!can(MODULES.communication, 'download')} onClick={comm.exportCsv} className="w-fit">
                    Export History
                </Button>
            </header>

            <section className="grid grid-cols-1 gap-2 divide-slate-100 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.05)] sm:grid-cols-2 xl:grid-cols-4 xl:divide-x">
                {buildStats(comm.data).map((stat) => (
                    <StatCard key={stat.key} stat={stat} variant="summary" />
                ))}
            </section>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                <section className="min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                    <div className="flex flex-col gap-3 px-4 pt-3 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="min-w-0 flex-1 [&_.ant-tabs-nav]:!mb-0" />
                        <div className="flex items-center gap-2 pb-3 lg:pb-0">
                            <Input
                                allowClear
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search in history..."
                                prefix={<SearchOutlined className="text-slate-400" />}
                                className="w-full lg:w-[220px]"
                            />
                            <Dropdown
                                trigger={['click']}
                                menu={{
                                    items: [{ key: 'all', label: 'All channels' }, ...CHANNELS.map((c) => ({ key: c, label: c }))],
                                    selectable: true,
                                    selectedKeys: [channel ?? 'all'],
                                    onClick: ({ key }) => setChannel(key === 'all' ? null : key),
                                }}
                            >
                                <Button icon={<FilterOutlined />}>{channel ?? 'Filters'}</Button>
                            </Dropdown>
                        </div>
                    </div>

                    <CommunicationTable rows={rows} />
                </section>

                <div className="w-full xl:w-[300px] xl:shrink-0">
                    <ClaimSidePanel claim={claim} onAction={comm.onAction} canAct={can(MODULES.communication, 'create')} />
                </div>
            </div>
            {comm.modal}
        </div>
    );
}
