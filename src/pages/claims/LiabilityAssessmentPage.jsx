import { useEffect, useRef, useState } from 'react';
import { App, Button, Input, InputNumber, Select, Spin, Table } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { ALLOWED_OPTIONS, MATERIAL_OPTIONS, REPAIR_REPLACE_OPTIONS } from '../../data/liabilityData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import { api, download } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDateTime, formatINR } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-800">{label}</span>;
const cell = (value) => <span className="text-[11.5px] text-slate-700">{value}</span>;

/** Simple label / values grid used by the four computation blocks. */
function ComputationCard({ title, table, open, onViewAll }) {
    const rows = open !== false ? table.rows : table.rows.filter((r) => r.bold || ['gross', 'net', 'parts', 'labour'].includes(r.key));
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                <h3 className="mb-0 text-[13.5px] font-bold text-[#1450d8]">{title}</h3>
                <button type="button" onClick={onViewAll} className="text-[11.5px] font-semibold text-[#1450d8] hover:underline">
                    {open !== false ? 'Show Less' : 'View All'}
                </button>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                    <thead>
                        <tr className="bg-slate-50">
                            {table.columns.map((column, index) => (
                                <th key={column} className={cn('px-5 py-2.5 text-[11.5px] font-semibold text-slate-700', index === 0 ? 'text-left' : 'text-right')}>
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.key} className="border-t border-slate-100">
                                <td className={cn('px-5 py-2.5 text-[11.5px]', row.bold ? 'font-bold text-slate-900' : 'text-slate-700')}>{row.label}</td>
                                {row.values.map((value, index) => (
                                    <td
                                        key={`${row.key}-${index}`}
                                        className={cn('px-5 py-2.5 text-right text-[11.5px]', row.bold ? 'font-bold text-slate-900' : 'text-slate-700')}
                                    >
                                        {formatINR(value)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/**
 * kind 'liability' = HANDLER ILA (the handler's assessment, seeded from AI ILA),
 * kind 'fla' = FLA (final loss assessment, seeded from the Handler ILA). Same screen.
 */
const KIND = {
    liability: { title: 'HANDLER ILA', module: MODULES.handlerIla, file: 'Handler-ILA', next: ROUTES.flaPending, nextLabel: 'FLA' },
    fla: { title: 'FLA', module: MODULES.fla, file: 'FLA', next: ROUTES.paymentRecommendation, nextLabel: 'Payment Recommendation' },
};

export default function LiabilityAssessmentPage({ kind = 'liability' }) {
    const K = KIND[kind];
    const { message, modal } = App.useApp();
    const navigate = useNavigate();
    const { claim, reloadClaim, can } = useAppState();
    const [data, setData] = useState(null);
    const [open, setOpen] = useState({});
    const [busy, setBusy] = useState(null);
    const [filters, setFilters] = useState({ part: '', material: undefined, action: undefined, allowed: undefined, remarks: '' });
    const timers = useRef({});

    const base = claim ? `/claims/${claim.id}/${kind}` : null;

    useEffect(() => {
        if (!base || claim?.status === 'Draft') return;
        api.get(base)
            .then(setData)
            .catch((err) => message.error(errText(err)));
    }, [base, claim?.status, message]);

    const locked = data?.status === 'Submitted';
    const canEdit = can(K.module, 'edit') && claim?.status === 'Open' && !locked;

    const visible = (data?.parts ?? []).filter((row) => {
        if (filters.part && !row.part.toLowerCase().includes(filters.part.toLowerCase())) return false;
        if (filters.material && row.material !== filters.material) return false;
        if (filters.action && row.action !== filters.action) return false;
        if (filters.allowed && row.allowed !== filters.allowed) return false;
        return true;
    });

    const addPart = async () => {
        if (!filters.part.trim() || !filters.material || !filters.action) {
            return message.info('Fill Part Name, Material and Repair/Replace above, then Add Part');
        }
        setBusy('add');
        try {
            setData(
                await api.post(`${base}/parts`, {
                    part: filters.part,
                    material: filters.material,
                    action: filters.action,
                    allowed: filters.allowed || 'Allowed',
                    remarks: filters.remarks,
                })
            );
            setFilters({ part: '', material: undefined, action: undefined, allowed: undefined, remarks: '' });
            message.success('Part added to the assessment -- enter its price in the table');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
        return undefined;
    };

    const updatePart = (id, field, value, delay = 0) => {
        setData((d) => ({ ...d, parts: d.parts.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }));
        clearTimeout(timers.current[`${id}.${field}`]);
        timers.current[`${id}.${field}`] = setTimeout(
            () =>
                api
                    .patch(`${base}/parts/${id}`, { [field]: value })
                    .then(setData)
                    .catch((err) => {
                        message.error(errText(err));
                        api.get(base).then(setData);
                    }),
            delay
        );
    };

    const generate = async () => {
        setBusy('report');
        try {
            await download(`${base}/report`, `${K.file}-${claim.claimNo}.pdf`, { method: 'POST', body: {} });
            message.success('Report generated');
            setData(await api.get(base));
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    const submit = () =>
        modal.confirm({
            title: `Submit the ${K.title} report?`,
            content: `Net liability ₹${formatINR(data.totals.netLiability)} becomes the claim amount; the report can no longer be changed.`,
            onOk: async () => {
                try {
                    setData(await api.post(`${base}/submit`));
                    await reloadClaim();
                    message.success('Report submitted');
                    navigate(K.next);
                } catch (err) {
                    message.error(errText(err));
                }
            },
        });

    const sel = (field, options) => (value, row) =>
        canEdit ? (
            <Select size="small" value={value} options={options} className="w-[120px]" onChange={(v) => updatePart(row.id, field, v)} />
        ) : (
            cell(value)
        );

    const columns = [
        { title: header('Sr.No'), dataIndex: 'srNo', key: 'srNo', render: cell },
        { title: header('Part Time'), dataIndex: 'part', key: 'part', render: cell },
        { title: header('Material'), dataIndex: 'material', key: 'material', render: sel('material', MATERIAL_OPTIONS) },
        { title: header('Repair/Replace'), dataIndex: 'action', key: 'action', render: sel('action', REPAIR_REPLACE_OPTIONS) },
        {
            title: header('Allowed/Disallowed'),
            dataIndex: 'allowed',
            key: 'allowed',
            render: (value, row) =>
                canEdit ? (
                    sel('allowed', ALLOWED_OPTIONS)(value, row)
                ) : (
                    <span className={cn('inline-flex rounded-md px-3 py-1 text-[11px] font-semibold', value === 'Allowed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600')}>
                        {value}
                    </span>
                ),
        },
        {
            title: header('Remarks'),
            dataIndex: 'remarks',
            key: 'remarks',
            render: (value, row) =>
                canEdit ? (
                    <Input size="small" value={value} className="w-[140px]" onChange={(e) => updatePart(row.id, 'remarks', e.target.value, 600)} />
                ) : (
                    cell(value || '--')
                ),
        },
        { title: header('HSN/SAC Code'), dataIndex: 'hsnCode', key: 'hsnCode', render: cell },
        {
            title: header('Part Price'),
            dataIndex: 'partPrice',
            key: 'partPrice',
            render: (value, row) =>
                canEdit ? (
                    <InputNumber
                        size="small"
                        min={0}
                        value={value}
                        className="w-[110px]"
                        formatter={(v) => formatINR(Number(v || 0))}
                        parser={(v) => Number(String(v).replace(/[^\d]/g, ''))}
                        onChange={(v) => updatePart(row.id, 'partPrice', v || 0, 600)}
                    />
                ) : (
                    cell(formatINR(value))
                ),
        },
        { title: header('Dep%'), dataIndex: 'depreciationPct', key: 'depreciationPct', render: (v) => cell(`${v}%`) },
    ];

    if (claim?.status === 'Draft') {
        return (
            <ClaimShell title={K.title} subtitle="Intelligent Liability Assessment" stage="fla">
                <p className="text-[12px] text-slate-600">Submit the intimation first.</p>
            </ClaimShell>
        );
    }

    return (
        <ClaimShell title={K.title} subtitle="Intelligent Liability Assessment" stage="fla" onNext={() => navigate(K.next)}>
            {!data ? (
                <Spin className="!py-10" />
            ) : (
                <>
                    {data.seeded ? (
                        <p className="mb-0 rounded-lg bg-blue-50 px-4 py-2 text-[11.5px] text-[#1450d8]">
                            Parts are taken from the {data.seededFrom ?? 'AI ILA'} assessment. Check material, prices and allowed / disallowed before submitting.
                        </p>
                    ) : null}
                    {locked ? (
                        <p className="mb-0 rounded-lg bg-emerald-50 px-4 py-2 text-[11.5px] text-emerald-700">
                            Submitted {fmtDateTime(data.submittedAt)} by {data.submittedBy}.
                        </p>
                    ) : null}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                            <h3 className="mb-0 text-[13.5px] font-bold text-[#1450d8]">Parts Assessment</h3>
                            <Button type="primary" icon={<PlusOutlined />} loading={busy === 'add'} disabled={!canEdit} onClick={addPart}>
                                Add Part
                            </Button>
                        </header>

                        <div className="grid grid-cols-1 gap-4 px-5 pb-4 sm:grid-cols-2 xl:grid-cols-5">
                            <div>
                                <span className="mb-1.5 block text-[11.5px] text-slate-600">Part Name</span>
                                <Input
                                    value={filters.part}
                                    placeholder="Search Part Name"
                                    suffix={<SearchOutlined className="text-slate-400" />}
                                    onChange={(event) => setFilters((prev) => ({ ...prev, part: event.target.value }))}
                                />
                            </div>
                            <div>
                                <span className="mb-1.5 block text-[11.5px] text-slate-600">Material</span>
                                <Select allowClear className="w-full" placeholder="Select Material" value={filters.material} options={MATERIAL_OPTIONS} onChange={(value) => setFilters((prev) => ({ ...prev, material: value }))} />
                            </div>
                            <div>
                                <span className="mb-1.5 block text-[11.5px] text-slate-600">Repair/Replace</span>
                                <Select allowClear className="w-full" placeholder="Select" value={filters.action} options={REPAIR_REPLACE_OPTIONS} onChange={(value) => setFilters((prev) => ({ ...prev, action: value }))} />
                            </div>
                            <div>
                                <span className="mb-1.5 block text-[11.5px] text-slate-600">Allowed/Disallowed</span>
                                <Select allowClear className="w-full" placeholder="Select" value={filters.allowed} options={ALLOWED_OPTIONS} onChange={(value) => setFilters((prev) => ({ ...prev, allowed: value }))} />
                            </div>
                            <div>
                                <span className="mb-1.5 block text-[11.5px] text-slate-600">Remarks</span>
                                <Input value={filters.remarks} placeholder="Enter Remarks" onChange={(event) => setFilters((prev) => ({ ...prev, remarks: event.target.value }))} />
                            </div>
                        </div>

                        <Table
                            columns={columns}
                            dataSource={visible}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            locale={{ emptyText: 'No parts. Approve the AI ILA first, or add parts here.' }}
                            className="[&_.ant-table-thead>tr>th]:!bg-white"
                        />

                        <footer className="flex justify-end gap-6 border-t border-slate-100 px-5 py-3 text-[12.5px] font-bold text-slate-900">
                            <span>Total Parts Allowed Ammount</span>
                            <span>{formatINR(data.totals.partsPriceAllowed)}</span>
                        </footer>
                    </section>

                    {[
                        ['parts', 'Parts Computation'],
                        ['labour', 'Labour Computation'],
                        ['charges', 'Additional Charges & Deductions'],
                        ['final', 'Final Assessment'],
                    ].map(([key, title]) => (
                        <ComputationCard key={key} title={title} table={data.tables[key]} open={open[key]} onViewAll={() => setOpen((o) => ({ ...o, [key]: o[key] === false }))} />
                    ))}

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button disabled={!canEdit} onClick={submit}>
                            Submit Report
                        </Button>
                        <Button type="primary" loading={busy === 'report'} onClick={generate}>
                            Generate Report
                        </Button>
                    </div>
                </>
            )}
        </ClaimShell>
    );
}
