import { useCallback, useEffect, useState } from 'react';
import { App, Avatar, Button, Input, Select, Table } from 'antd';
import {
    CloseCircleOutlined,
    EnvironmentOutlined,
    SearchOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';

import { HANDLER_FILTERS, REASSIGNMENT_REASONS, REASSIGNMENT_REMARKS } from '../../data/handlerData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import { errText, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-700">{label}</span>;
const STATUS_TONE = { Available: 'bg-emerald-100 text-emerald-700', Full: 'bg-amber-100 text-amber-700' };

export default function HandlerAllocationPage() {
    const { message } = App.useApp();
    const { claim, setClaim, can } = useAppState();
    const [current, setCurrent] = useState(null);
    const [changing, setChanging] = useState(false);
    const [reason, setReason] = useState();
    const [remark, setRemark] = useState();
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [handlers, setHandlers] = useState({ rows: [], filters: {} });
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const claimId = claim?.id;
    const loadCurrent = useCallback(() => {
        if (!claimId) return;
        api.get(`/claims/${claimId}/handler`)
            .then(setCurrent)
            .catch((err) => message.error(errText(err)));
    }, [claimId, message]);

    useEffect(() => {
        loadCurrent();
    }, [loadCurrent, claim?.handlerId]);

    // Nobody allocated yet: open the picker straight away.
    useEffect(() => {
        if (current && !current.current) setChanging(true);
    }, [current]);

    useEffect(() => {
        if (!changing) return undefined;
        const t = setTimeout(async () => {
            setLoading(true);
            const q = new URLSearchParams({ search, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== 'all')) });
            try {
                setHandlers(await api.get(`/handlers?${q}`));
            } catch (err) {
                message.error(errText(err));
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(t);
    }, [changing, search, filters, message]);

    const reassign = async () => {
        if (!selected) return message.warning('Select the new handler in the table');
        if (current?.current && !reason) return message.warning('Select a reason for reassignment');
        setSaving(true);
        try {
            const updated = await api.post(`/claims/${claimId}/handler`, { handlerId: selected, reason, remark });
            setClaim(updated);
            message.success(`Claim ${current?.current ? 'reassigned' : 'allocated'} to ${updated.handlerName}`);
            setChanging(false);
            setSelected(null);
            setReason(undefined);
            setRemark(undefined);
            loadCurrent();
        } catch (err) {
            message.error(errText(err));
        } finally {
            setSaving(false);
        }
        return undefined;
    };

    const optionList = (key) => [{ label: 'All', value: 'all' }, ...(handlers.filters?.[key] ?? []).map((v) => ({ label: v, value: v }))];

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
                    <span className="block text-[11.5px] font-semibold text-[#1450d8]">{row.roleName}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.employeeId}{row.team ? ` · ${row.team}` : ''}</span>
                </span>
            ),
        },
        {
            title: header('Location'),
            key: 'location',
            align: 'center',
            render: (_value, row) => (
                <span>
                    <span className="block text-[11.5px] text-slate-800">{row.city || '—'}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.state ? `(${row.state})` : ''}</span>
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
                <span className={cn('inline-flex rounded-md px-3 py-1 text-[11px] font-semibold', STATUS_TONE[value] ?? 'bg-slate-100 text-slate-600')}>
                    {value}
                </span>
            ),
        },
    ];

    const h = current?.current;
    const canEdit = can(MODULES.handler, 'edit') && claim?.status === 'Open';

    return (
        <ClaimShell title="Handler Allocation" subtitle="Allocate Claims Based On Workload And Expertise" stage="handler-allocation">
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                    <h2 className="mb-0 w-[130px] shrink-0 text-[15px] font-bold text-[#1450d8]">Claim Handler</h2>

                    {h ? (
                        <div className="flex flex-1 flex-col gap-5 sm:flex-row">
                            <Avatar size={92} icon={<UserOutlined />} className="shrink-0 bg-slate-200" />
                            <div className="min-w-0 flex-1">
                                <p className="mb-0.5 text-[15px] font-bold text-slate-900">{h.name}</p>
                                <p className="mb-1.5 text-[12px] text-slate-700">
                                    {h.roleName ?? 'Claims Handler'} {h.employeeId ? `· ${h.employeeId}` : ''} {h.currentLoad ? `· Load ${h.currentLoad}` : ''}
                                </p>
                                {h.team ? (
                                    <span className="inline-flex rounded-md bg-blue-100 px-3 py-1.5 text-[11px] font-medium text-[#1450d8]">{h.team}</span>
                                ) : null}
                                <p className="mt-3 mb-1 flex items-center gap-2 text-[11.5px] text-slate-700">
                                    <EnvironmentOutlined className="text-slate-400" /> {[h.city, h.state, h.pinCode].filter(Boolean).join(', ') || '—'}
                                </p>
                                <p className="mb-0 flex items-center gap-2 text-[11.5px] text-slate-700">
                                    <ShopOutlined className="text-slate-400" /> {claim.workshop || '—'}
                                </p>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="mb-1 text-[12.5px] font-bold text-slate-900">Assigned On</p>
                                <p className="mb-4 text-[11.5px] text-slate-700">{fmtDateTime(h.assignedOn)}</p>
                                <p className="mb-1 text-[12.5px] font-bold text-slate-900">Assignment Method</p>
                                <p className="mb-0 text-[11.5px] text-slate-700">
                                    {h.method ?? '—'}
                                    {h.assignedBy && h.assignedBy !== 'System' ? ` · by ${h.assignedBy}` : ''}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="mb-0 flex-1 text-[12px] text-slate-600">
                            {claim?.status === 'Draft'
                                ? 'Submit the intimation first.'
                                : 'No handler allocated yet -- the Admin allocation rule found no handler with capacity. Pick one below.'}
                        </p>
                    )}

                    {canEdit ? (
                        <Button type="primary" icon={<TeamOutlined />} onClick={() => setChanging((open) => !open)} className="shrink-0">
                            {h ? 'Change Handler' : 'Allocate Handler'}
                        </Button>
                    ) : null}
                </div>
            </section>

            {changing && canEdit ? (
                <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                    <header className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="mb-0 text-[15px] font-bold text-slate-900">{h ? 'Change Claim Handler' : 'Allocate Claim Handler'}</h3>
                        <button type="button" aria-label="Close" onClick={() => setChanging(false)} className="text-[14px] text-slate-400 hover:text-slate-700">
                            <CloseCircleOutlined />
                        </button>
                    </header>

                    <div className="mb-5 flex flex-col gap-4 rounded-lg bg-[#dce6fb] px-4 py-4 xl:flex-row xl:items-end">
                        <div className="min-w-[220px]">
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-800">Reasson For Reassignment</span>
                            <Select className="w-full" placeholder="Select Reason" value={reason} options={REASSIGNMENT_REASONS} onChange={setReason} disabled={!h} />
                        </div>
                        <div className="min-w-[220px]">
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-800">Remarks(Options)</span>
                            <Select
                                className="w-full"
                                placeholder="Enter Remarks (If Any)"
                                value={remark}
                                options={REASSIGNMENT_REMARKS}
                                onChange={setRemark}
                                allowClear
                                disabled={!h}
                            />
                        </div>
                        <div className="flex flex-1 flex-wrap justify-end gap-3">
                            <Button onClick={() => setChanging(false)} className="!text-[#1450d8]">
                                Cancel
                            </Button>
                            <Button type="primary" loading={saving} onClick={reassign}>
                                {h ? 'Reassign Claim' : 'Allocate Claim'}
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
                                    value={filters[filter.key] ?? 'all'}
                                    options={optionList(filter.key)}
                                    onChange={(v) => setFilters((f) => ({ ...f, [filter.key]: v }))}
                                />
                            </div>
                        ))}
                    </div>

                    <Table
                        columns={columns}
                        dataSource={handlers.rows.filter((r) => r.id !== claim?.handlerId)}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        rowSelection={{
                            type: 'radio',
                            selectedRowKeys: selected ? [selected] : [],
                            onChange: (keys) => setSelected(keys[0]),
                            getCheckboxProps: (row) => ({ disabled: !row.selectable }),
                        }}
                        onRow={(row) => ({ onClick: () => row.selectable && setSelected(row.id) })}
                        locale={{ emptyText: 'No claim handlers found. Create them in Admin > Create Users (role Claim Handler).' }}
                        className="[&_.ant-table-thead>tr>th]:!bg-[#c6d5f5]"
                    />
                </section>
            ) : null}

            {current?.history?.length ? (
                <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                    <h3 className="mb-3 text-[13.5px] font-bold text-slate-900">Allocation History</h3>
                    <ol className="m-0 flex list-none flex-col gap-2 p-0">
                        {current.history.map((e, i) => (
                            <li key={i} className="text-[11.5px] text-slate-700">
                                <span className="font-semibold text-[#1450d8]">{e.action}</span> · {e.detail}
                                {e.reason ? ` · ${e.reason}` : ''}
                                {e.remark ? ` · ${e.remark}` : ''}
                                <span className="text-slate-400"> · {e.by} · {fmtDateTime(e.at)}</span>
                            </li>
                        ))}
                    </ol>
                </section>
            ) : null}
        </ClaimShell>
    );
}
