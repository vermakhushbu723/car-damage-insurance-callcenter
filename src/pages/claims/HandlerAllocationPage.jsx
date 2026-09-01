import { useState } from 'react';
import { App, Avatar, Button, Input, Select, Table } from 'antd';
import {
    CloseCircleOutlined,
    EnvironmentOutlined,
    SearchOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';

import {
    AVAILABLE_HANDLERS,
    CURRENT_HANDLER,
    FILTER_OPTIONS,
    HANDLER_FILTERS,
    REASSIGNMENT_REASONS,
    REASSIGNMENT_REMARKS,
} from '../../data/handlerData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-700">{label}</span>;

export default function HandlerAllocationPage() {
    const { message } = App.useApp();
    const [changing, setChanging] = useState(false);
    const [reason, setReason] = useState();
    const [remark, setRemark] = useState();
    const [search, setSearch] = useState('');

    const rows = AVAILABLE_HANDLERS.filter((row) =>
        search ? row.name.toLowerCase().includes(search.toLowerCase()) : true
    );

    const columns = [
        {
            title: header('Name'),
            dataIndex: 'name',
            key: 'name',
            render: (value) => <span className="text-[11.5px] text-slate-800">{value}</span>,
        },
        {
            title: header('Handler'),
            key: 'handler',
            render: (_value, row) => (
                <span>
                    <span className="block text-[11.5px] font-semibold text-[#1450d8]">{row.handler}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.handlerNote}</span>
                </span>
            ),
        },
        {
            title: header('Location'),
            key: 'location',
            align: 'center',
            render: (_value, row) => (
                <span>
                    <span className="block text-[11.5px] text-slate-800">{row.location}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.locationNote}</span>
                </span>
            ),
        },
        {
            title: header('Current Load'),
            dataIndex: 'currentLoad',
            key: 'currentLoad',
            align: 'center',
            render: (value) => <span className="text-[11.5px] text-slate-800">{value}</span>,
        },
        {
            title: header('Status'),
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (value) => (
                <span className="inline-flex rounded-md bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    {value}
                </span>
            ),
        },
    ];

    return (
        <ClaimShell
            title="Handler Allocation"
            subtitle="Allocate Claims Based On Workload And Expertise"
            stage="handler-allocation"
        >
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                    <h2 className="mb-0 w-[130px] shrink-0 text-[15px] font-bold text-[#1450d8]">Claim Handler</h2>

                    <div className="flex flex-1 flex-col gap-5 sm:flex-row">
                        <Avatar size={92} icon={<UserOutlined />} className="shrink-0 bg-slate-200" />

                        <div className="min-w-0 flex-1">
                            <p className="mb-0.5 text-[15px] font-bold text-slate-900">{CURRENT_HANDLER.name}</p>
                            <p className="mb-1.5 text-[12px] text-slate-700">{CURRENT_HANDLER.role}</p>
                            <span className="inline-flex rounded-md bg-blue-100 px-3 py-1.5 text-[11px] font-medium text-[#1450d8]">
                                {CURRENT_HANDLER.team}
                            </span>
                            <p className="mt-3 mb-1 flex items-center gap-2 text-[11.5px] text-slate-700">
                                <EnvironmentOutlined className="text-slate-400" /> {CURRENT_HANDLER.location}
                            </p>
                            <p className="mb-0 flex items-center gap-2 text-[11.5px] text-slate-700">
                                <ShopOutlined className="text-slate-400" /> {CURRENT_HANDLER.workshop}
                            </p>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[12.5px] font-bold text-slate-900">Assigned On</p>
                            <p className="mb-4 text-[11.5px] text-slate-700">{CURRENT_HANDLER.assignedOn}</p>
                            <p className="mb-1 text-[12.5px] font-bold text-slate-900">Assignment Method</p>
                            <p className="mb-0 text-[11.5px] text-slate-700">{CURRENT_HANDLER.assignmentMethod}</p>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        icon={<TeamOutlined />}
                        onClick={() => setChanging((open) => !open)}
                        className="shrink-0"
                    >
                        Change Handler
                    </Button>
                </div>
            </section>

            {changing ? (
                <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                    <header className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="mb-0 text-[15px] font-bold text-slate-900">Change Claim Handler</h3>
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={() => setChanging(false)}
                            className="text-[14px] text-slate-400 hover:text-slate-700"
                        >
                            <CloseCircleOutlined />
                        </button>
                    </header>

                    <div className="mb-5 flex flex-col gap-4 rounded-lg bg-[#dce6fb] px-4 py-4 xl:flex-row xl:items-end">
                        <div className="min-w-[220px]">
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-800">
                                Reasson For Reassignment
                            </span>
                            <Select
                                className="w-full"
                                placeholder="Select Reason"
                                value={reason}
                                options={REASSIGNMENT_REASONS}
                                onChange={setReason}
                            />
                        </div>
                        <div className="min-w-[220px]">
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-800">
                                Remarks(Options)
                            </span>
                            <Select
                                className="w-full"
                                placeholder="Enter Remarks (If Any)"
                                value={remark}
                                options={REASSIGNMENT_REMARKS}
                                onChange={setRemark}
                            />
                        </div>
                        <div className="flex flex-1 flex-wrap justify-end gap-3">
                            <Button onClick={() => setChanging(false)} className="!text-[#1450d8]">
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={() =>
                                    reason
                                        ? message.success('Claim reassigned')
                                        : message.warning('Select a reason for reassignment')
                                }
                            >
                                Reassign Claim
                            </Button>
                        </div>
                    </div>

                    <h4 className="mb-3 text-[12.5px] font-bold text-slate-900">Search &amp; Select New Handler</h4>

                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search By Name, Employee ID...."
                        suffix={<SearchOutlined className="text-slate-400" />}
                        className="!mb-4"
                    />

                    <div className="mb-4 grid grid-cols-1 gap-x-8 gap-y-3 xl:grid-cols-2">
                        {HANDLER_FILTERS.map((filter) => (
                            <div key={filter.key} className="flex items-center gap-3">
                                <span className="w-[80px] shrink-0 text-[11.5px] text-slate-600">{filter.label}</span>
                                <Select
                                    className="flex-1"
                                    defaultValue="all"
                                    options={FILTER_OPTIONS}
                                    onChange={() => message.info(`${filter.label} filter applied`)}
                                />
                            </div>
                        ))}
                    </div>

                    <Table
                        columns={columns}
                        dataSource={rows}
                        rowKey="key"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        className="[&_.ant-table-thead>tr>th]:!bg-[#c6d5f5]"
                    />
                </section>
            ) : null}
        </ClaimShell>
    );
}
