import { useMemo, useState } from 'react';
import { App, Checkbox, Input } from 'antd';
import { AlertOutlined, DollarOutlined, DownloadOutlined, FileDoneOutlined, FileSearchOutlined, FormOutlined } from '@ant-design/icons';

import Pager from '../../components/common/Pager.jsx';
import { FieldLabel, NmButton, NmSearch, NmSelect, NmTable, NmTitle, toneOf } from '../../components/national/NmUi.jsx';
import { APPROVAL_KPIS, APPROVAL_ROWS, APPROVAL_TYPES } from '../../data/nationalManagerData.js';
import cn from '../../utils/cn.js';
import { INDIA_STATES } from '../../data/indiaLocations.js';

const ICONS = { pending: FormOutlined, ila: FileSearchOutlined, fla: FileDoneOutlined, payment: DollarOutlined, fraud: AlertOutlined };
const STATES = INDIA_STATES;
const ACTIONS = ['Approve', 'Reject', 'Send Back'];
const REASONS = ['Documents Incomplete', 'Amount Mismatch', 'Policy Not In Force', 'Other'];

/** My Approvals: filters first; the claim table fills once "Submit" is pressed (Figma's empty state). */
export default function NmApprovalsPage() {
    const { message } = App.useApp();
    const [type, setType] = useState('');
    const [submittedType, setSubmittedType] = useState('');
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState([]);
    const [edits, setEdits] = useState({});

    // The Payment tile only exists once an approval type is picked (Figma frame "Withdraw approval").
    const kpis = submittedType ? APPROVAL_KPIS : APPROVAL_KPIS.filter((k) => k.icon !== 'payment');
    const rows = useMemo(() => {
        if (!submittedType) return [];
        const q = query.trim().toLowerCase();
        return q ? APPROVAL_ROWS.filter((r) => `${r.claimNo} ${r.branch}`.toLowerCase().includes(q)) : APPROVAL_ROWS;
    }, [submittedType, query]);

    const edit = (id, key) => (value) => setEdits((e) => ({ ...e, [id]: { ...e[id], [key]: value } }));
    const toggle = (id, on) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));

    const columns = [
        {
            key: 'select',
            title: (
                <Checkbox
                    aria-label="Select all"
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                >
                    <span className="font-semibold text-white">Select</span>
                </Checkbox>
            ),
            render: (r) => <Checkbox aria-label={`Select ${r.id}`} checked={selected.includes(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} />,
        },
        { key: 'claimNo', title: 'Claim No', render: (r) => <span className="font-semibold text-[#0b4fc9]">{r.claimNo}</span> },
        { key: 'region', title: 'Region', render: (r) => <Input aria-label="Region" className="!w-28" value={edits[r.id]?.region ?? ''} onChange={(e) => edit(r.id, 'region')(e.target.value)} /> },
        { key: 'state', title: 'State', render: (r) => <NmSelect className="!w-36" placeholder="Choose State" value={edits[r.id]?.state} onChange={edit(r.id, 'state')} options={STATES} /> },
        { key: 'remarks', title: 'Remarks', render: (r) => <Input aria-label="Remarks" className="!w-32" value={edits[r.id]?.remarks ?? ''} onChange={(e) => edit(r.id, 'remarks')(e.target.value)} /> },
        { key: 'action', title: 'Action', render: (r) => <NmSelect className="!w-36" placeholder="Choose Action" value={edits[r.id]?.action} onChange={edit(r.id, 'action')} options={ACTIONS} /> },
        { key: 'reason', title: 'Reason Of Rejection', render: (r) => <NmSelect className="!w-44" placeholder="Choose Reason" value={edits[r.id]?.reason} onChange={edit(r.id, 'reason')} options={REASONS} /> },
        { key: 'branch', title: 'Branch' },
        { key: 'approvalStatus', title: 'Approval Status' },
        { key: 'claimStatus', title: 'Claim Status' },
        { key: 'paymentMode', title: 'Payment Mode' },
        { key: 'amount', title: 'Approval Amount' },
        { key: 'interest', title: 'Interest Amount' },
        { key: 'nol', title: 'NOL' },
        { key: 'paymentType', title: 'Type Of Payment' },
        { key: 'tat', title: 'TAT' },
        { key: 'sentAt', title: 'Approval Request Sent Date/Time' },
    ];

    return (
        <div>
            <NmTitle title="My Approvals" sample />
            <div className={cn('grid gap-3 sm:grid-cols-2', submittedType ? 'xl:grid-cols-5' : 'xl:grid-cols-4')}>
                {kpis.map((k) => {
                    const Icon = ICONS[k.icon];
                    const t = toneOf(k.tone);
                    return (
                        <div key={k.title} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#fafafa] p-4">
                            <span className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-full text-[22px]', t.tile)}>
                                <Icon />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[13px] font-medium text-slate-900">{k.title}</span>
                                <span className="block text-[24px] leading-tight font-bold text-slate-900">{k.value}</span>
                                <span className="block text-[12px] text-slate-800">
                                    <b className={k.bad ? 'text-red-700' : 'text-[#0f9a59]'}>{k.delta}</b> VS Last Week
                                </span>
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <FieldLabel label="Approval Type" required>
                    <NmSelect value={type} onChange={setType} options={APPROVAL_TYPES} placeholder="Choose type of approval" />
                </FieldLabel>
                <FieldLabel label="Region" required>
                    <NmSelect options={['All Region', 'North', 'South', 'East', 'West']} placeholder="All Region" />
                </FieldLabel>
                <FieldLabel label="State" required>
                    <NmSelect showSearch options={STATES} placeholder="All States" />
                </FieldLabel>
                <FieldLabel label="Branch" required>
                    <NmSelect options={['All', 'kurnool', 'bhuneshwar']} placeholder="All" />
                </FieldLabel>
                <NmButton
                    className="h-[38px] w-32"
                    onClick={() => {
                        if (!type) return message.warning('Choose the type of approval first.');
                        setSubmittedType(type);
                        setSelected([]);
                        return undefined;
                    }}
                >
                    Submit
                </NmButton>
            </div>

            <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto] xl:max-w-[50%]">
                <FieldLabel label="Show Entries" required>
                    <NmSelect value="10" options={['10', '25', '50']} />
                </FieldLabel>
                <NmSearch value={query} onChange={setQuery} placeholder="Claim No/Insured/Policy No" />
                <NmButton className="h-[38px] w-28">Search</NmButton>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-[#f4f4f6]">
                <NmTable
                    blue
                    columns={columns}
                    rows={rows}
                    empty="Choose an approval type and press Submit"
                    minWidth={1900}
                />
                <div className="flex flex-wrap items-center justify-between px-4">
                    <NmButton
                        disabled={rows.length === 0}
                        onClick={() => message.info('Not connected to the backend yet: nothing was exported.')}
                    >
                        Export to excel <DownloadOutlined />
                    </NmButton>
                    <Pager current={1} total={rows.length ? 1 : 1} />
                </div>
            </div>
        </div>
    );
}
