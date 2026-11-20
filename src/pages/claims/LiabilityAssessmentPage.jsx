import { useEffect, useRef, useState } from 'react';
import { App, Button, Input, InputNumber, Modal, Popconfirm, Select, Spin, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { ALLOWED_OPTIONS, IMT23_OPTIONS, MATERIAL_OPTIONS, REPAIR_REPLACE_OPTIONS } from '../../data/liabilityData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import { api, download } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDateTime, formatINR } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-800">{label}</span>;

/** Plain number as in the Figma summaries (436470.35, 5500, 0). */
const plain = (v) => (typeof v === 'number' ? String(Math.round(v * 100) / 100) : v);

/** Figma summary table (Gross / Depn / IMT 23 / Net, or one Net column): bordered cells, centred values. */
function SummaryCard({ table, children }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-[#fbfbfb] shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
            <h3 className="mb-0 px-4 pt-4 pb-3 text-[16px] font-bold text-[#1450d8]">{table.title}</h3>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-[#c5daff]">
                        {table.columns.map((column) => (
                            <th key={column} className="border border-[#e4e9f2] px-2 py-2 text-center text-[10.5px] font-semibold uppercase text-slate-900">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.rows.map((row) => (
                        <tr key={row.key}>
                            <td className={cn('border border-[#e4e9f2] px-2 py-1.5 text-[11.5px] text-slate-900', row.bold ? 'font-bold' : 'font-medium')}>{row.label}</td>
                            {row.text !== undefined ? (
                                <td className="border border-[#e4e9f2] px-2 py-1.5 text-center text-[11.5px] text-slate-800">{row.text}</td>
                            ) : (
                                row.values.map((value, index) => (
                                    <td key={`${row.key}-${index}`} className={cn('border border-[#e4e9f2] px-2 py-1.5 text-center text-[11.5px] text-slate-800', row.bold && 'font-bold')}>
                                        {children ? children(row, value) : plain(value)}
                                    </td>
                                ))
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

/**
 * kind 'liability' = HANDLER ILA (the handler's assessment, seeded from AI ILA),
 * kind 'fla' = FLA (final loss assessment, seeded from the Handler ILA). Same screen.
 */
const KIND = {
    liability: { title: 'HANDLER ILA', module: MODULES.handlerIla, file: 'Handler-ILA', next: ROUTES.flaPending, nextLabel: 'FLA' },
    fla: { title: 'FLA', module: MODULES.fla, file: 'FLA', next: ROUTES.surveyPaybill, nextLabel: 'Survey Fee Bill' },
};

export default function LiabilityAssessmentPage({ kind = 'liability' }) {
    const K = KIND[kind];
    const { message, modal } = App.useApp();
    const navigate = useNavigate();
    const { claim, reloadClaim, can } = useAppState();
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(null);
    const [editing, setEditing] = useState(null); // part in the Action > edit dialog
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

    const center = (value) => <span className="block text-center text-[12px] text-slate-800">{value}</span>;
    const money = (v) => center(formatINR(v));
    const columns = [
        { title: header('Sr.No'), dataIndex: 'srNo', key: 'srNo', align: 'center', render: center },
        { title: header('Part Time'), dataIndex: 'part', key: 'part', render: (v) => <span className="text-[12px] text-slate-800">{v}</span> },
        { title: header('Material'), dataIndex: 'material', key: 'material', align: 'center', render: center },
        { title: header('Repair/Replace'), dataIndex: 'action', key: 'action', align: 'center', render: center },
        {
            title: header('Allowed/Disallowed'),
            dataIndex: 'allowed',
            key: 'allowed',
            align: 'center',
            render: (value) => (
                <span className={cn('inline-flex rounded-md px-3 py-1 text-[12px] font-medium', value === 'Allowed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                    {value}
                </span>
            ),
        },
        { title: header('Remarks'), dataIndex: 'remarks', key: 'remarks', align: 'center', render: (v) => center(v || '--') },
        { title: header('HSN/SAC Code'), dataIndex: 'hsnCode', key: 'hsnCode', align: 'center', render: center },
        { title: header('Part Price'), dataIndex: 'partPrice', key: 'partPrice', align: 'center', render: money },
        { title: header('Dep%'), dataIndex: 'depreciationPct', key: 'depreciationPct', align: 'center', render: (v) => center(`${v}%`) },
        { title: header('Dep Ammount'), dataIndex: 'depAmount', key: 'depAmount', align: 'center', render: money },
        { title: header('Net Ammount'), dataIndex: 'netAmount', key: 'netAmount', align: 'center', render: money },
        { title: header('GST%'), dataIndex: 'gstPct', key: 'gstPct', align: 'center', render: (v) => center(`${v}%`) },
        { title: header('GST Ammount'), dataIndex: 'gstAmount', key: 'gstAmount', align: 'center', render: money },
        { title: header('Remove & RFT'), dataIndex: 'removeRefit', key: 'removeRefit', align: 'center', render: money },
        { title: header('Repair Labour'), dataIndex: 'repairLabour', key: 'repairLabour', align: 'center', render: money },
        { title: header('Paint Labour'), dataIndex: 'paintLabour', key: 'paintLabour', align: 'center', render: money },
        {
            title: header('Total Allowed'),
            dataIndex: 'totalAllowed',
            key: 'totalAllowed',
            align: 'center',
            render: (v) => center(formatINR(v)),
        },
        {
            title: header('Action'),
            key: 'action',
            fixed: 'right',
            render: (_, row) => (
                <span className="flex items-center gap-3">
                    <button type="button" aria-label={`Edit ${row.part}`} disabled={!canEdit} onClick={() => setEditing({ ...row })} className="text-[#1450d8] disabled:text-slate-300">
                        <EditOutlined />
                    </button>
                    <Popconfirm title={`Remove ${row.part}?`} okText="Remove" okButtonProps={{ danger: true }} disabled={!canEdit} onConfirm={() => removePart(row)}>
                        <button type="button" aria-label={`Delete ${row.part}`} disabled={!canEdit} className="text-red-500 disabled:text-slate-300">
                            <DeleteOutlined />
                        </button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    const removePart = async (row) => {
        try {
            setData(await api.del(`${base}/parts/${row.id}`));
            message.success(`${row.part} removed`);
        } catch (err) {
            message.error(errText(err));
        }
    };
    const saveEdit = async () => {
        const e = editing;
        try {
            setData(
                await api.patch(`${base}/parts/${e.id}`, {
                    part: e.part, material: e.material, action: e.action, allowed: e.allowed, remarks: e.remarks ?? '',
                    partPrice: e.partPrice ?? 0, removeRefit: e.removeRefit, repairLabour: e.repairLabour, paintLabour: e.paintLabour, imt23: !!e.imt23,
                })
            );
            setEditing(null);
            message.success('Part updated');
        } catch (err) {
            message.error(errText(err));
        }
    };

    // Final Settlement Summary amounts + 3. Remarks (PUT .../charges, debounced)
    const saveCharges = (patch, delay = 700) => {
        clearTimeout(timers.current.charges);
        timers.current.charges = setTimeout(
            () =>
                api
                    .put(`${base}/charges`, patch)
                    .then(setData)
                    .catch((err) => {
                        message.error(errText(err));
                        api.get(base).then(setData);
                    }),
            delay
        );
    };
    const settlementCell = (row, value) =>
        row.editable && canEdit ? (
            <InputNumber
                size="small"
                min={0}
                variant="borderless"
                value={Math.abs(value)}
                className="!w-[96px] [&_input]:!text-center"
                onChange={(v) => saveCharges({ [row.key]: v || 0 })}
            />
        ) : (
            <span className={row.deduction && value ? 'text-red-600' : undefined}>{plain(Math.abs(value))}</span>
        );

    if (claim?.status === 'Draft') {
        return (
            <ClaimShell title={K.title} subtitle="Intelligent Liability Assessment" stage={kind === 'fla' ? 'fla' : 'handler-ila'}>
                <p className="text-[12px] text-slate-600">Submit the intimation first.</p>
            </ClaimShell>
        );
    }

    return (
        <ClaimShell title={K.title} subtitle="Intelligent Liability Assessment" stage={kind === 'fla' ? 'fla' : 'handler-ila'} onNext={() => navigate(K.next)}>
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
                            <span>{formatINR(data.totals.totalAllowed ?? data.totals.partsPriceAllowed)}</span>
                        </footer>
                    </section>

                    <p className="mb-0 rounded-lg bg-slate-50 px-4 py-2 text-[11px] text-slate-600">
                        Depreciation on replaced parts (IRDAI): metal {data.metalDepreciationPct}%
                        {data.ageMonths == null ? ' (vehicle age not known)' : ` (vehicle age ${Math.floor(data.ageMonths / 12)}y ${data.ageMonths % 12}m)`}, plastic / rubber 50%,
                        fibre glass 30%, glass nil; paint material 50%. IMT 23 = 50% deduction on that part.
                    </p>

                    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.35fr_1fr]">
                        <div className="flex min-w-0 flex-col gap-3">
                            <SummaryCard table={data.tables.parts} />
                            <SummaryCard table={data.tables.labour} />
                        <section className="rounded-xl border border-slate-200 bg-[#fbfbfb] px-4 pt-4 pb-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
                            <h3 className="mb-2 text-[16px] font-bold text-[#1450d8]">3. Remarks</h3>
                            <Input.TextArea
                                rows={4}
                                disabled={!canEdit}
                                defaultValue={data.remarks}
                                key={`remarks-${data.status}`}
                                placeholder="Remarks for this assessment (shown on the report)"
                                onChange={(e) => saveCharges({ remarks: e.target.value }, 900)}
                            />
                        </section>
                        </div>
                        <div className="min-w-0">
                            <SummaryCard table={data.tables.final}>{settlementCell}</SummaryCard>
                        </div>
                    </div>

                    <Modal open={!!editing} title={editing ? `Edit Part · ${editing.part}` : ''} okText="Save" onOk={saveEdit} onCancel={() => setEditing(null)} destroyOnHidden>
                        {editing ? (
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['part', 'Part Name', 'text'],
                                    ['material', 'Material', MATERIAL_OPTIONS],
                                    ['action', 'Repair/Replace', REPAIR_REPLACE_OPTIONS],
                                    ['allowed', 'Allowed/Disallowed', ALLOWED_OPTIONS],
                                    ['remarks', 'Remarks', 'text'],
                                    ['partPrice', 'Part Price', 'number'],
                                    ['removeRefit', 'Remove & RFT', 'number'],
                                    ['repairLabour', 'Repair Labour', 'number'],
                                    ['paintLabour', 'Paint Labour', 'number'],
                                    ['imt23', 'IMT 23', IMT23_OPTIONS],
                                ].map(([f, label, type]) => (
                                    <label key={f} className="text-[11.5px] text-slate-600">
                                        {label}
                                        {type === 'text' ? (
                                            <Input value={editing[f] ?? ''} onChange={(ev) => setEditing((x) => ({ ...x, [f]: ev.target.value }))} />
                                        ) : type === 'number' ? (
                                            <InputNumber min={0} className="!w-full" value={editing[f]} onChange={(v) => setEditing((x) => ({ ...x, [f]: v ?? 0 }))} />
                                        ) : (
                                            <Select className="w-full" value={f === 'imt23' ? !!editing[f] : editing[f]} options={type} onChange={(v) => setEditing((x) => ({ ...x, [f]: v }))} />
                                        )}
                                    </label>
                                ))}
                            </div>
                        ) : null}
                    </Modal>

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
