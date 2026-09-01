import { useState } from 'react';
import { App, Avatar, Button, Input, Select, Table, Tabs } from 'antd';
import {
    CheckCircleOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    ReloadOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';

import {
    ASSIGNMENT_HISTORY,
    CITY_OPTIONS,
    SELECTED_SURVEYOR,
    STATE_OPTIONS,
    SURVEYORS,
    SURVEYOR_TOTAL_PAGES,
    SURVEYOR_TYPE_OPTIONS,
    SURVEY_TABS,
} from '../../data/surveyorData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import Pager from '../../components/common/Pager.jsx';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-800">{label}</span>;

export default function SurveyorAssignmentPage() {
    const { message } = App.useApp();
    const [tab, setTab] = useState('spot');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ type: 'all', city: 'all', state: 'all' });
    const [selectedKey, setSelectedKey] = useState(SURVEYORS[0].key);
    const [page, setPage] = useState(1);

    const activeTab = SURVEY_TABS.find((item) => item.key === tab);
    const rows = SURVEYORS.filter((row) =>
        search ? `${row.name} ${row.surveyorId}`.toLowerCase().includes(search.toLowerCase()) : true
    );

    const reset = () => {
        setSearch('');
        setFilters({ type: 'all', city: 'all', state: 'all' });
        message.info('Filters reset');
    };

    const columns = [
        {
            title: header('Surveyor Name'),
            key: 'name',
            render: (_value, row) => (
                <button
                    type="button"
                    onClick={() => setSelectedKey(row.key)}
                    className="flex items-center gap-2 text-[11.5px] text-slate-800"
                >
                    <CheckCircleOutlined
                        className={cn(
                            'text-[12.5px]',
                            row.key === selectedKey ? 'text-[#1450d8]' : 'text-slate-300'
                        )}
                    />
                    {row.name}
                </button>
            ),
        },
        {
            title: header('Surveyor ID'),
            dataIndex: 'surveyorId',
            key: 'surveyorId',
            align: 'center',
            render: (value) => <span className="text-[11.5px] text-slate-800">{value}</span>,
        },
        {
            title: header('Type'),
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (value) => <span className="text-[11.5px] text-slate-800">{value}</span>,
        },
        {
            title: header('Location'),
            dataIndex: 'location',
            key: 'location',
            align: 'center',
            render: (value) => <span className="text-[11.5px] text-slate-800">{value}</span>,
        },
        {
            title: header('Current/Load'),
            dataIndex: 'currentLoad',
            key: 'currentLoad',
            align: 'center',
            render: (value) => <span className="text-[11.5px] text-slate-800">{value}</span>,
        },
        {
            title: header('Availability'),
            dataIndex: 'availability',
            key: 'availability',
            align: 'center',
            render: (value) => (
                <span className="inline-flex rounded-md bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    {value}
                </span>
            ),
        },
        {
            title: header('Action'),
            key: 'action',
            align: 'center',
            render: () => (
                <button
                    type="button"
                    onClick={() => message.info('Surveyor profile')}
                    className="rounded-md bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#1450d8]"
                >
                    View Profile
                </button>
            ),
        },
    ];

    return (
        <ClaimShell
            title="Surveyor Assignment"
            subtitle="Assign Surveyors For Timely Claim Assessment"
            stage="surveyor-assignment"
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                <section className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-4">
                    <Tabs
                        activeKey={tab}
                        onChange={setTab}
                        items={SURVEY_TABS.map((item) => ({ key: item.key, label: item.label }))}
                        className="[&_.ant-tabs-tab]:!text-[13px]"
                    />

                    <div className="mb-5 flex items-start gap-3 rounded-lg bg-[#dce6fb] px-4 py-3">
                        <InfoCircleOutlined className="mt-0.5 text-[#1450d8]" />
                        <p className="mb-0 text-[11.5px] font-semibold text-slate-800">{activeTab.hint}</p>
                    </div>

                    <h4 className="mb-3 text-[12.5px] font-bold text-slate-900">Search &amp; Select Surveyor</h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">
                                Search By Name / ID / Phone
                            </span>
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search"
                                suffix={<SearchOutlined className="text-slate-400" />}
                            />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">
                                Serveyor Type
                            </span>
                            <Select
                                className="w-full"
                                value={filters.type}
                                options={SURVEYOR_TYPE_OPTIONS}
                                onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                            />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">City</span>
                            <Select
                                className="w-full"
                                value={filters.city}
                                options={CITY_OPTIONS}
                                onChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}
                            />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">State</span>
                            <Select
                                className="w-full"
                                value={filters.state}
                                options={STATE_OPTIONS}
                                onChange={(value) => setFilters((prev) => ({ ...prev, state: value }))}
                            />
                        </div>
                    </div>

                    <div className="my-4 flex flex-wrap justify-end gap-3">
                        <Button icon={<ReloadOutlined />} onClick={reset}>
                            Reset
                        </Button>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => message.success(`${rows.length} surveyors found`)}
                        >
                            Search
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={rows}
                        rowKey="key"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        className="[&_.ant-table-thead>tr>th]:!bg-[#c6d5f5]"
                    />

                    <Pager current={page} total={SURVEYOR_TOTAL_PAGES} onChange={setPage} align="center" />
                </section>

                <div className="flex w-full flex-col gap-4 xl:w-[350px] xl:shrink-0">
                    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <h3 className="mb-4 text-[15px] font-bold text-slate-900">Selected Surveyor</h3>

                        <div className="rounded-lg border border-slate-200 px-4 py-4">
                            <div className="mb-3 flex items-center gap-3">
                                <Avatar size={48} icon={<UserOutlined />} className="bg-slate-200" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13px] font-bold text-slate-900">
                                        {SELECTED_SURVEYOR.name}
                                    </span>
                                    <span className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-600">
                                        <span>{SELECTED_SURVEYOR.type}</span>
                                        <span>{SELECTED_SURVEYOR.surveyorId}</span>
                                    </span>
                                </span>
                            </div>

                            <p className="mb-2 flex items-center gap-2 text-[11.5px] text-slate-700">
                                <PhoneOutlined className="text-slate-400" /> {SELECTED_SURVEYOR.phone}
                            </p>
                            <p className="mb-2 flex items-center gap-2 text-[11.5px] break-all text-slate-700">
                                <MailOutlined className="text-slate-400" /> {SELECTED_SURVEYOR.email}
                            </p>
                            <p className="mb-3 flex items-center gap-2 text-[11.5px] break-all text-slate-700">
                                <EnvironmentOutlined className="text-slate-400" /> {SELECTED_SURVEYOR.address}
                            </p>

                            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                                {SELECTED_SURVEYOR.stats.map((stat) => (
                                    <div key={stat.key}>
                                        <span className="block text-[11px] text-slate-500">{stat.label}</span>
                                        <span className="block text-[11.5px] font-semibold text-slate-800">
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="primary"
                            block
                            className="!mt-4"
                            onClick={() => message.success('Surveyor assigned')}
                        >
                            Asign Surveyor
                        </Button>
                        <Button
                            block
                            className="!mt-3 !text-[#1450d8]"
                            onClick={() => message.info('Assignment cancelled')}
                        >
                            Cancel
                        </Button>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <h3 className="mb-3 text-[15px] font-bold text-slate-900">Assignment History</h3>
                        <div className="flex flex-col gap-3 rounded-lg bg-slate-50 px-3 py-3">
                            {ASSIGNMENT_HISTORY.map((entry) => (
                                <div key={entry.key} className="flex gap-3">
                                    <span
                                        className={cn(
                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px]',
                                            entry.tone === 'green'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-blue-100 text-[#1450d8]'
                                        )}
                                    >
                                        {entry.tone === 'green' ? <CheckCircleOutlined /> : <UserOutlined />}
                                    </span>
                                    <span className="min-w-0">
                                        <span
                                            className={cn(
                                                'block text-[12px] font-bold',
                                                entry.tone === 'green' ? 'text-emerald-600' : 'text-[#1450d8]'
                                            )}
                                        >
                                            {entry.title}
                                        </span>
                                        <span className="block text-[10.5px] text-slate-500">{entry.time}</span>
                                        <span className="block text-[10.5px] text-slate-600">{entry.detail}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </ClaimShell>
    );
}
