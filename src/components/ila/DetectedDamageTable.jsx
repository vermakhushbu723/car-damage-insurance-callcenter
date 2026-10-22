import { Button, InputNumber, Select, Table } from 'antd';

import {
    ACTION_OPTIONS,
    DAMAGE_TYPE_OPTIONS,
    SEVERITY_OPTIONS,
    STATUS_OPTIONS,
    TABLE_TONES,
    formatINR,
} from '../../data/ilaData.js';
import cn from '../../utils/cn.js';

const header = (label) => (
    <span className="text-[11px] font-bold tracking-wide text-slate-900 uppercase">{label}</span>
);

/** Every editable cell is the same select, just with a different option set. */
function ToneSelect({ value, options, tones, onChange, disabled }) {
    return (
        <Select
            value={value}
            options={options}
            onChange={onChange}
            disabled={disabled}
            className={cn('w-[130px] font-semibold', tones?.[value])}
            popupMatchSelectWidth={false}
        />
    );
}

/**
 * The AI's part-by-part findings. Every cell is editable because the CSM's
 * corrections are what feed the retraining pipeline.
 */
export default function DetectedDamageTable({ rows, onChange, onApproveAll, onExport, selected = [], onSelect, disabled = false, model }) {
    const update = (key, field) => (value) => onChange(key, field, value);

    const totals = rows.reduce(
        (acc, row) => ({
            cost: acc.cost + (row.cost || 0),
            repair: acc.repair + (row.action === 'Repair' ? 1 : 0),
            replace: acc.replace + (row.action === 'Replace' ? 1 : 0),
        }),
        { cost: 0, repair: 0, replace: 0 }
    );

    const columns = [
        {
            title: header('Vehicle Part'),
            key: 'part',
            render: (_value, row) => (
                <div className="flex min-w-[170px] items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1450d8] text-[11px] font-bold text-white">
                        {row.key}
                    </span>
                    <span className="text-[11.5px] font-semibold text-slate-900">
                        {row.part}
                        {row.source === 'reviewer' ? <span className="ml-1.5 text-[10px] font-normal text-violet-600">(added)</span> : null}
                        {row.corrected ? <span className="ml-1.5 text-[10px] font-normal text-amber-600">(corrected)</span> : null}
                    </span>
                </div>
            ),
        },
        {
            title: header('Damage Type'),
            key: 'damageType',
            render: (_value, row) => (
                <ToneSelect
                    value={row.damageType}
                    options={DAMAGE_TYPE_OPTIONS}
                    tones={TABLE_TONES.damageType}
                    onChange={update(row.id, 'damageType')}
                    disabled={disabled}
                />
            ),
        },
        {
            title: header('Severity'),
            key: 'severity',
            render: (_value, row) => (
                <ToneSelect
                    value={row.severity}
                    options={SEVERITY_OPTIONS}
                    tones={TABLE_TONES.severity}
                    onChange={update(row.id, 'severity')}
                    disabled={disabled}
                />
            ),
        },
        {
            title: header('Action'),
            key: 'action',
            render: (_value, row) => (
                <ToneSelect
                    value={row.action}
                    options={ACTION_OPTIONS}
                    tones={TABLE_TONES.action}
                    onChange={update(row.id, 'action')}
                    disabled={disabled}
                />
            ),
        },
        {
            title: header('Est. Cost'),
            key: 'cost',
            render: (_value, row) => (
                <InputNumber
                    value={row.cost}
                    min={0}
                    step={100}
                    className="w-[120px]"
                    formatter={(value) => formatINR(Number(value || 0))}
                    parser={(value) => Number(String(value).replace(/[^\d]/g, ''))}
                    disabled={disabled}
                    onChange={(value) => update(row.id, 'cost')(value || 0)}
                />
            ),
        },
        {
            title: header('AI Confidence'),
            key: 'confidence',
            render: (_value, row) => (
                <div className="w-[130px]">
                    <span className="mb-1 block text-center text-[11.5px] font-semibold text-slate-800">
                        {row.confidence === null ? 'Reviewer' : `${row.confidence}%`}
                    </span>
                    <span className="block h-1 w-full rounded-full bg-slate-200">
                        <span
                            style={{ width: `${row.confidence ?? 0}%` }}
                            className={cn(
                                'block h-1 rounded-full',
                                row.confidence >= 90
                                    ? 'bg-emerald-500'
                                    : row.confidence >= 80
                                      ? 'bg-[#1450d8]'
                                      : 'bg-amber-500'
                            )}
                        />
                    </span>
                </div>
            ),
        },
        {
            title: header('Status'),
            key: 'status',
            render: (_value, row) => (
                <ToneSelect
                    value={row.status}
                    options={STATUS_OPTIONS}
                    tones={TABLE_TONES.status}
                    onChange={update(row.id, 'status')}
                    disabled={disabled}
                />
            ),
        },
    ];

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-col gap-3 px-5 pt-4 pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="mb-0.5 text-[11.5px] font-bold tracking-wide text-[#1450d8] uppercase">Detected</p>
                    <h3 className="mb-0.5 text-[15px] leading-6 font-bold text-slate-900">AI Damage Assessment</h3>
                    <p className="mb-0 text-[11px] text-slate-500">
                        {rows.length} Parts Identified – Order By Severity{selected.length ? ` · ${selected.length} selected` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={onExport} className="!text-[#1450d8]">
                        Export CSV
                    </Button>
                    <Button type="primary" disabled={disabled || !rows.length} onClick={onApproveAll}>
                        Approve All
                    </Button>
                </div>
            </header>

            <Table
                columns={columns}
                dataSource={rows}
                rowKey="id"
                pagination={false}
                rowSelection={onSelect ? { selectedRowKeys: selected, onChange: onSelect, getCheckboxProps: () => ({ disabled }) } : undefined}
                locale={{ emptyText: 'No damages yet. Run the AI on the vehicle photos, or use "Add Damages".' }}
                scroll={{ x: 'max-content' }}
                className="[&_.ant-table-thead>tr>th]:!bg-[#f1f5f9]"
            />

            <footer className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-[11px] text-slate-500">
                <span>
                    {totals.repair} repair · {totals.replace} replace ·{' '}
                    <span className="font-semibold text-slate-800">₹{formatINR(totals.cost)}</span> total est.
                </span>
                <span>
                    Model <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">{model ?? '—'}</span>
                </span>
            </footer>
        </section>
    );
}
