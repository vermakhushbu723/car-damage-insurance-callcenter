import { useCallback, useEffect, useState } from 'react';
import { App, Avatar, Button, Input, Modal, Select, Table, Tabs } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    ReloadOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';

import { SURVEYOR_TYPE_OPTIONS, SURVEY_TABS } from '../../data/surveyorData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import Pager from '../../components/common/Pager.jsx';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import { errText, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-800">{label}</span>;
const EMPTY_FILTERS = { type: 'all', city: 'all', state: 'all' };

export default function SurveyorAssignmentPage() {
    const { message } = App.useApp();
    const { claim, setClaim, reloadClaim, can } = useAppState();
    const [tab, setTab] = useState('spot');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [query, setQuery] = useState({ search: '', ...EMPTY_FILTERS });
    const [page, setPage] = useState(1);
    const [list, setList] = useState({ rows: [], totalPages: 1, filters: {} });
    const [selectedId, setSelectedId] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [state, setState] = useState({ assignments: {}, history: [] });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const claimId = claim?.id;
    const activeTab = SURVEY_TABS.find((item) => item.key === tab);
    const assigned = state.assignments?.[tab] ?? null;

    const loadState = useCallback(() => {
        if (!claimId) return;
        api.get(`/claims/${claimId}/surveyors`)
            .then(setState)
            .catch((err) => message.error(errText(err)));
    }, [claimId, message]);

    useEffect(() => {
        loadState();
    }, [loadState]);

    useEffect(() => {
        if (!claimId) return;
        setLoading(true);
        const q = new URLSearchParams({ ...query, page, pageSize: 6 });
        api.get(`/surveyors?${q}`)
            .then((data) => {
                setList(data);
                setSelectedRow((cur) => cur ?? data.rows[0] ?? null);
                setSelectedId((cur) => cur ?? data.rows[0]?.id ?? null);
            })
            .catch((err) => message.error(errText(err)))
            .finally(() => setLoading(false));
    }, [claimId, query, page, message]);

    const reset = () => {
        setSearch('');
        setFilters(EMPTY_FILTERS);
        setQuery({ search: '', ...EMPTY_FILTERS });
        setPage(1);
        message.info('Filters reset');
    };

    const runSearch = () => {
        setPage(1);
        setQuery({ search, ...filters });
    };

    const select = (row) => {
        setSelectedId(row.id);
        setSelectedRow(row);
    };

    const assign = async () => {
        if (!selectedRow) return message.warning('Select a surveyor');
        setSaving(true);
        try {
            const res = await api.post(`/claims/${claimId}/surveyors`, { surveyType: tab, surveyorId: selectedRow.id });
            setState(res);
            setClaim(res.claim);
            message.success(`${selectedRow.name} assigned for the ${activeTab.label.replace(' Allocation', '').toLowerCase()}`);
            setQuery((q) => ({ ...q }));
        } catch (err) {
            message.error(errText(err));
        } finally {
            setSaving(false);
        }
        return undefined;
    };

    const cancel = async () => {
        if (!assigned) {
            setSelectedId(null);
            setSelectedRow(null);
            return message.info('Selection cleared');
        }
        setSaving(true);
        try {
            setState(await api.post(`/claims/${claimId}/surveyors/${assigned.id}/cancel`));
            reloadClaim();
            message.success('Assignment cancelled');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setSaving(false);
        }
        return undefined;
    };

    const options = (key) => [{ label: 'All', value: 'all' }, ...(list.filters?.[key] ?? []).map((v) => ({ label: v, value: v }))];

    const columns = [
        {
            title: header('Surveyor Name'),
            key: 'name',
            render: (_value, row) => (
                <button type="button" onClick={() => select(row)} className="flex items-center gap-2 text-[11.5px] text-slate-800">
                    <CheckCircleOutlined className={cn('text-[12.5px]', row.id === selectedId ? 'text-[#1450d8]' : 'text-slate-300')} />
                    {row.name}
                </button>
            ),
        },
        { title: header('Surveyor ID'), dataIndex: 'surveyorId', key: 'surveyorId', align: 'center', render: (v) => <span className="text-[11.5px] text-slate-800">{v}</span> },
        { title: header('Type'), dataIndex: 'type', key: 'type', align: 'center', render: (v) => <span className="text-[11.5px] text-slate-800">{v}</span> },
        { title: header('Location'), dataIndex: 'location', key: 'location', align: 'center', render: (v) => <span className="text-[11.5px] text-slate-800">{v}</span> },
        { title: header('Current/Load'), dataIndex: 'currentLoad', key: 'currentLoad', align: 'center', render: (v) => <span className="text-[11.5px] text-slate-800">{v}</span> },
        {
            title: header('Availability'),
            dataIndex: 'availability',
            key: 'availability',
            align: 'center',
            render: (value) => (
                <span
                    className={cn(
                        'inline-flex rounded-md px-3 py-1 text-[11px] font-semibold',
                        value === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}
                >
                    {value}
                </span>
            ),
        },
        {
            title: header('Action'),
            key: 'action',
            align: 'center',
            render: (_v, row) => (
                <button type="button" onClick={() => setProfile(row)} className="rounded-md bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#1450d8]">
                    View Profile
                </button>
            ),
        },
    ];

    const shown = assigned
        ? { name: assigned.surveyorName, type: assigned.type, surveyorId: assigned.surveyorCode, phone: assigned.phone, email: assigned.email, address: assigned.location }
        : selectedRow;
    const canEdit = can(MODULES.surveyor, 'edit') && claim?.status === 'Open';

    return (
        <ClaimShell title="Surveyor Assignment" subtitle="Assign Surveyors For Timely Claim Assessment" stage="surveyor-assignment">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                <section className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-4">
                    <Tabs
                        activeKey={tab}
                        onChange={setTab}
                        items={SURVEY_TABS.map((item) => ({
                            key: item.key,
                            label: `${item.label}${state.assignments?.[item.key] ? ' ✓' : ''}`,
                        }))}
                        className="[&_.ant-tabs-tab]:!text-[13px]"
                    />

                    <div className="mb-5 flex items-start gap-3 rounded-lg bg-[#dce6fb] px-4 py-3">
                        <InfoCircleOutlined className="mt-0.5 text-[#1450d8]" />
                        <p className="mb-0 text-[11.5px] font-semibold text-slate-800">{activeTab.hint}</p>
                    </div>

                    <h4 className="mb-3 text-[12.5px] font-bold text-slate-900">Search &amp; Select Surveyor</h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">Search By Name / ID / Phone</span>
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onPressEnter={runSearch}
                                placeholder="Search"
                                suffix={<SearchOutlined className="text-slate-400" />}
                            />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">Serveyor Type</span>
                            <Select className="w-full" value={filters.type} options={SURVEYOR_TYPE_OPTIONS} onChange={(value) => setFilters((p) => ({ ...p, type: value }))} />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">City</span>
                            <Select className="w-full" value={filters.city} options={options('city')} onChange={(value) => setFilters((p) => ({ ...p, city: value }))} />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">State</span>
                            <Select className="w-full" value={filters.state} options={options('state')} onChange={(value) => setFilters((p) => ({ ...p, state: value }))} />
                        </div>
                    </div>

                    <div className="my-4 flex flex-wrap justify-end gap-3">
                        <Button icon={<ReloadOutlined />} onClick={reset}>
                            Reset
                        </Button>
                        <Button type="primary" icon={<SearchOutlined />} onClick={runSearch}>
                            Search
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={list.rows}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        onRow={(row) => ({ onClick: () => select(row) })}
                        locale={{ emptyText: 'No surveyors found. Create them in Admin > Create Users (Internal / External Surveyor).' }}
                        className="[&_.ant-table-thead>tr>th]:!bg-[#c6d5f5]"
                    />

                    <Pager current={list.page ?? page} total={list.totalPages} onChange={setPage} align="center" />
                </section>

                <div className="flex w-full flex-col gap-4 xl:w-[350px] xl:shrink-0">
                    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <h3 className="mb-4 text-[15px] font-bold text-slate-900">{assigned ? 'Assigned Surveyor' : 'Selected Surveyor'}</h3>

                        {shown ? (
                            <div className="rounded-lg border border-slate-200 px-4 py-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <Avatar size={48} icon={<UserOutlined />} className="bg-slate-200" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[13px] font-bold text-slate-900">{shown.name}</span>
                                        <span className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-600">
                                            <span>{shown.type}</span>
                                            <span>{shown.surveyorId}</span>
                                        </span>
                                    </span>
                                </div>
                                <p className="mb-2 flex items-center gap-2 text-[11.5px] text-slate-700">
                                    <PhoneOutlined className="text-slate-400" /> {shown.phone || '—'}
                                </p>
                                <p className="mb-2 flex items-center gap-2 text-[11.5px] break-all text-slate-700">
                                    <MailOutlined className="text-slate-400" /> {shown.email || '—'}
                                </p>
                                <p className="mb-3 flex items-center gap-2 text-[11.5px] break-all text-slate-700">
                                    <EnvironmentOutlined className="text-slate-400" /> {shown.address || '—'}
                                </p>
                                {!assigned ? (
                                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                                        {[
                                            ['Current Load', shown.currentLoad],
                                            ['Experience', shown.experience],
                                            ['Rating', shown.rating],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <span className="block text-[11px] text-slate-500">{label}</span>
                                                <span className="block text-[11.5px] font-semibold text-slate-800">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mb-0 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                                        Assigned {fmtDateTime(assigned.assignedAt)} by {assigned.assignedBy}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mb-0 text-[11.5px] text-slate-500">Select a surveyor in the table.</p>
                        )}

                        <Button
                            type="primary"
                            block
                            className="!mt-4"
                            loading={saving}
                            disabled={!canEdit || !selectedRow || selectedRow.id === assigned?.surveyorId}
                            onClick={assign}
                        >
                            {assigned ? 'Reassign To Selected' : 'Asign Surveyor'}
                        </Button>
                        <Button block className="!mt-3 !text-[#1450d8]" disabled={!canEdit} onClick={cancel}>
                            {assigned ? 'Cancel Assignment' : 'Cancel'}
                        </Button>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <h3 className="mb-3 text-[15px] font-bold text-slate-900">Assignment History</h3>
                        <div className="flex flex-col gap-3 rounded-lg bg-slate-50 px-3 py-3">
                            {state.history?.length ? (
                                state.history.map((entry, i) => {
                                    const cancelled = entry.action === 'Assignment Cancelled';
                                    return (
                                        <div key={i} className="flex gap-3">
                                            <span
                                                className={cn(
                                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px]',
                                                    cancelled ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-[#1450d8]'
                                                )}
                                            >
                                                {cancelled ? <CloseCircleOutlined /> : <UserOutlined />}
                                            </span>
                                            <span className="min-w-0">
                                                <span className={cn('block text-[12px] font-bold', cancelled ? 'text-red-500' : 'text-[#1450d8]')}>{entry.action}</span>
                                                <span className="block text-[10.5px] text-slate-500">{fmtDateTime(entry.at)}</span>
                                                <span className="block text-[10.5px] text-slate-600">{entry.detail}</span>
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-[11px] text-slate-500">No surveyor assigned yet.</span>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <Modal title="Surveyor Profile" open={!!profile} onCancel={() => setProfile(null)} footer={null}>
                {profile ? (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                        {[
                            ['Name', profile.name],
                            ['Surveyor ID', profile.surveyorId],
                            ['Type', profile.type],
                            ['Phone', profile.phone],
                            ['Email', profile.email],
                            ['Location', profile.address],
                            ['Current Load', profile.currentLoad],
                            ['Experience', profile.experience],
                            ['Rating', profile.rating],
                            ['Availability', profile.availability],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <dt className="text-slate-500">{k}</dt>
                                <dd className="mb-0 font-semibold break-all text-slate-800">{v || '—'}</dd>
                            </div>
                        ))}
                    </dl>
                ) : null}
            </Modal>
        </ClaimShell>
    );
}
